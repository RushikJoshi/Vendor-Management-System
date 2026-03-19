require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-2.0-flash"];
    for (const modelName of models) {
        try {
            console.log("Testing:", modelName);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello in one word');
            console.log("SUCCESS with", modelName, ":", result.response.text().trim());
            break;
        } catch (e) {
            console.log("FAIL", modelName, ":", e.message?.slice(0, 80));
        }
    }
}

test();
