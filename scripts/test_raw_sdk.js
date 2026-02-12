const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testRaw() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // v1 과 v1beta 둘 다 시도 가능
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }, { apiVersion: "v1beta" });

    console.log("Testing raw SDK with gemini-2.0-flash-lite (v1beta)...");
    try {
        const result = await model.generateContent("Hi");
        console.log("✅ Success:", result.response.text());
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

testRaw();
