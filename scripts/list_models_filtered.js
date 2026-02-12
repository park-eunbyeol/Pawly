const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                const activeModels = parsed.models
                    .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name);
                console.log("Supported Models for generateContent:");
                console.log(JSON.stringify(activeModels, null, 2));
            } else {
                console.log('No models found in response:', parsed);
            }
        } catch (e) {
            console.log('Parsing Error:', e.message);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
