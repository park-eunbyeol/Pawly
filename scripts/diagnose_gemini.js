const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
    const apiKey = process.env.GOOGLE_API_KEY;

    // v1 과 v1beta 둘 다 시도
    const configs = [
        { model: "gemini-1.5-flash", apiVersion: "v1" },
        { model: "gemini-1.5-flash", apiVersion: "v1beta" },
        { model: "gemini-2.0-flash", apiVersion: "v1" },
        { model: "gemini-pro", apiVersion: "v1" }
    ];

    for (const config of configs) {
        console.log(`\nTrying: ${config.model} (${config.apiVersion})...`);
        try {
            const model = new ChatGoogleGenerativeAI({
                modelName: config.model,
                apiKey: apiKey,
                apiVersion: config.apiVersion
            });
            const res = await model.invoke("Hi");
            console.log(`✅ Success:`, res.content.substring(0, 20), "...");
            break;
        } catch (e) {
            console.error(`❌ Failed:`, e.message);
        }
    }
}

diagnose();
