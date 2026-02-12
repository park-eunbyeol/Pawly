import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { records, pet } = body;

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Google API Key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const petLabel = pet === 'dog' ? '강아지' : pet === 'cat' ? '고양이' : '반려동물';

        const recordSummary = records.map((r: any) => {
            return `- [${r.time}] ${r.title}: ${r.value} ${r.memo ? `(${r.memo})` : ''}`;
        }).join('\n');

        const prompt = `당신은 수의학 전문 AI입니다. 제공된 반려동물의 건강 기록을 분석하여 종합적인 상태 요약과 제안을 제공해주세요.

[반려동물 종류] ${petLabel}
[건강 기록]
${recordSummary}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요(코드 블록 기호 \` \` \` json 등도 제외):
{
  "summary": "전반적인 상태 요약 (2~3문장)",
  "insights": ["분석 결과 1", "분석 결과 2"],
  "suggestions": ["보호자 교육/실행 제안 1", "보호자 교육/실행 제안 2"],
  "healthScore": 0~100 (정수)
}`;

        const response = await model.generateContent(prompt);
        let text = response.response.text();

        // JSON 파싱 (코드 블록 제거)
        const clean = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(clean);

        return NextResponse.json(result);

    } catch (err) {
        console.error('Diary analysis error:', err);
        return NextResponse.json({
            error: 'Failed to analyze diary records'
        }, { status: 500 });
    }
}
