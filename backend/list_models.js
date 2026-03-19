require('dotenv').config();
const axios = require('axios');
const key = process.env.GEMINI_API_KEY;

axios.get('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => {
        const models = r.data.models.filter(m =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent')
        );
        console.log("=== Models supporting generateContent ===");
        models.forEach(m => console.log(" -", m.name));
    })
    .catch(e => console.log('ERR:', e.response?.data || e.message));
