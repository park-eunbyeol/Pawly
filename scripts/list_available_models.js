const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log("Testing with API Key present:", !!apiKey);

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("\n--- Listing Models ---");
        // Using direct API client to check what's available
        // Note: listModels might not be available in all SDK versions, but let's try a different approach
        // To see what works, we'll try the most standard 'gemini-1.5-flash' but with the official SDK
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log("Official SDK Success with gemini-1.5-flash:", response.text());
    } catch (err) {
        console.error("Official SDK Failed:", err.message);
    }
}

listModels();
