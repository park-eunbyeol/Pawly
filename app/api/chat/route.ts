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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 대화 내역 포맷팅
        const conversationHistory = messages.map((m: any) => {
            const roleLabel = m.role === 'assistant' ? '폴리' : '사용자';
            return `${roleLabel}: ${m.content}`;
        }).join('\n');

        const prompt = `당신은 반려동물 건강 및 케어 전문가 '폴리(Pawly)'입니다. 
사용자의 반려동물에 대한 질문에 친절하고 전문적으로 답변해 주세요. 
응급 상황으로 판단되는 경우 반드시 즉시 동물병원에 방문할 것을 강력히 권고해야 합니다. 
답변은 한국어로 작성해 주세요.

[이전 대화 내역]
${conversationHistory}

최종 답변:`;

        const result = await model.generateContent(prompt);
        const assistantContent = result.response.text();

        return NextResponse.json({ content: assistantContent });

    } catch (err: any) {
        console.error('Chat API error:', err);
        return NextResponse.json({
            error: 'Failed to process chat request',
            details: err.message
        }, { status: 500 });
    }
}
