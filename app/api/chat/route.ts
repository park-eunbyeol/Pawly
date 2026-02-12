import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { messages = [] } = body;

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Google API Key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const fs = require('fs');
        const path = require('path');

        // Check if the user is asking for a location
        const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user')?.content || '';
        let hospitalContext = "";

        let recommendedHospitals: any[] = [];

        // Simple keyword check to trigger hospital search
        if (lastUserMessage.length > 0 && (lastUserMessage.includes('병원') || lastUserMessage.includes('동물') || /[시구동]/.test(lastUserMessage))) {
            try {
                const csvPath = path.join(process.cwd(), '동물_동물병원.csv');
                if (fs.existsSync(csvPath)) {
                    const csvData = fs.readFileSync(csvPath, 'utf8');
                    const lines = csvData.split('\n');

                    const keywords = lastUserMessage.split(/\s+/).filter((w: string) =>
                        w.length > 1 && !['병원', '찾아', '알려', '추천', '어디', '있어', '동물', '근처', '주변', '가까운'].includes(w)
                    );

                    if (keywords.length > 0) {
                        // Get raw lines first
                        const rawResults = lines
                            .filter((line: string) => {
                                if (!line.includes('정상')) return false;
                                return keywords.some((k: string) => line.includes(k));
                            })
                            .slice(0, 5); // Limit results

                        // Process for Context String
                        const contextLines = rawResults.map((line: string) => {
                            const parts = line.split(',');
                            const name = parts.find((p: string) => p.includes('동물병원')) || parts[21] || "병원명 확인불가";
                            const address = parts.find((p: string) => p.includes('시') && p.includes('구')) || parts[19] || "주소 확인불가";
                            const phone = parts.find((p: string) => /^\d{2,3}-?\d{3,4}-?\d{4}$/.test(p) || p.startsWith('02')) || "전화번호 미제공";

                            const cleanName = name.replace(/"/g, '');
                            const cleanAddress = address.replace(/"/g, '');
                            const mapLink = `https://map.kakao.com/link/search/${encodeURIComponent(cleanName)}`;

                            let timeInfo = "";
                            if (cleanName.includes('24') || cleanName.includes('응급') || cleanName.includes('365')) {
                                timeInfo = " [⭐24시간/연중무휴 가능성 높음]";
                            }

                            // Populate structured data
                            recommendedHospitals.push({
                                name: cleanName,
                                address: cleanAddress,
                                phone: phone,
                                timeInfo: timeInfo.trim(),
                                mapLink: mapLink
                            });

                            return `- **${cleanName}**${timeInfo}: ${cleanAddress}\n  (Tel: ${phone}) [[🕒실시간 운영정보 확인하기](${mapLink})]`;
                        });

                        if (contextLines.length > 0) {
                            hospitalContext = `\n[관련 병원 데이터베이스 검색 결과]\n${contextLines.join('\n')}\n` +
                                `※ 필수 안내: 위 정보는 데이터베이스 기반이므로, 방문 전 반드시 [실시간 운영정보 확인하기] 링크를 눌러 **오늘 영업 여부**를 체크하거나 전화로 확인하도록 안내하세요.\n`;
                        }
                    }
                }
            } catch (e) {
                console.error("Error reading hospital CSV:", e);
            }
        }

        // 대화 내역 포맷팅
        const conversationHistory = messages.map((m: any) => {
            const roleLabel = m.role === 'assistant' ? '폴리' : '사용자';
            return `${roleLabel}: ${m.content}`;
        }).join('\n');

        // Define models to try in order of preference
        const modelsToTry = ["gemini-2.0-flash-lite-001", "gemini-pro-latest", "gemini-flash-latest"];
        let model;
        let assistantContent = null;
        let lastError = null;

        const prompt = `당신은 반려동물 건강 및 케어 전문가 '폴리(Pawly)'입니다. 
다음 지침을 철저히 지켜 대답하세요:
1. **핵심만 간결하게**: 인사말, 자기소개, 불필요한 미사여구는 모두 생략하고 답변 본론만 즉시 말하세요.
2. **위치 관련**: 'GPS를 확인할 수 없다'거나 '기능이 제한되어 있다'는 말은 하지 마세요. 위치 정보가 필요하면 자연스럽게 "어느 지역에 계신가요?"라고 물어보세요.
3. **병원 추천**: 사용자가 위치를 말하면 해당 지역의 병원을 찾는 방법을 안내하거나, 일반적인 응급 처치법을 먼저 알려주세요.
4. **어조**: 친절하지만 전문적이고 단호하게, 불필요한 서론 없이 바로 정보만 전달하세요.

[참고 데이터]
${hospitalContext}

[이전 대화 내역]
${conversationHistory}

최종 답변:`;

        // Try each model until one works
        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}`);
                model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                assistantContent = response.text();

                if (assistantContent) {
                    console.log(`Successfully generated content with ${modelName}`);
                    break; // Success!
                }
            } catch (err: any) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
                // Continue to next model
            }
        }

        if (!assistantContent) {
            throw lastError || new Error("All models failed to generate content");
        }

        return NextResponse.json({
            content: assistantContent,
            recommendedHospitals: recommendedHospitals.length > 0 ? recommendedHospitals : undefined
        });

    } catch (err: any) {
        console.error('Chat API error:', err);
        return NextResponse.json({
            error: 'Failed to process chat request',
            details: err.message
        }, { status: 500 });
    }
}
