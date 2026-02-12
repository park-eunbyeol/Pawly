const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testRaw() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Using API Key:", apiKey.substring(0, 8) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    console.log("Testing raw SDK with gemini-flash-latest...");
    try {
        const result = await model.generateContent("Hi");
        console.log("✅ Success:", result.response.text());
    } catch (e) {
        console.error("❌ Failed:", e.message);
    }
}

testRaw();
