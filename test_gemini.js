const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Load env manully since we don't assume dotenv is installed
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split(/\r?\n/).forEach(line => { // Handle \r\n
                const match = line.trim().match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error("Error loading .env.local", e);
    }
}

loadEnv();

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY not found in .env.local");
        return;
    }
    console.log("API Key found (length):", apiKey.length);

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.0-pro"];

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Hello, are you working?";
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(`SUCCESS: ${modelName} responded: ${text}`);
            return; // Exit on first success
        } catch (error) {
            console.error(`FAILED: ${modelName} error:`, error.message);
        }
    }
}

testGemini();
