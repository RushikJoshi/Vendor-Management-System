const axios = require("axios");

const GEMINI_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.generateCategoryAI = async (req, res) => {
    try {
        const { segmentName } = req.body;

        if (!segmentName || !segmentName.trim()) {
            return res.status(400).json({ success: false, message: "segmentName is required." });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        const prompt = `You are a backend config generator for an enterprise Vendor Management System.
Generate configuration for this vendor category segment: "${segmentName.trim()}"

Return ONLY a valid JSON object with exactly these keys:
{
  "uniqueCode": "3-6 uppercase letters only (e.g. ITSRV)",
  "slug": "lowercase-hyphen-separated (e.g. it-services)",
  "description": "3-5 professional enterprise-level sentences about this vendor category",
  "approvalType": "Manual or Auto",
  "requiredDocuments": ["at least 3 document names as strings"],
  "customFields": [
    { "fieldName": "field label", "type": "text", "required": true }
  ]
}

Return ONLY the JSON object. No markdown. No backticks. No explanation.`;

        for (const modelName of GEMINI_MODELS) {
            let attempts = 0;
            while (attempts < 2) {
                attempts++;
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

                    const response = await axios.post(
                        url,
                        {
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 1024,
                                responseMimeType: "application/json",
                            },
                        },
                        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
                    );

                    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

                    let parsed;
                    try {
                        parsed = JSON.parse(cleaned);
                    } catch {
                        console.error(`[Gemini:${modelName}] JSON parse failed:`, rawText.slice(0, 100));
                        break;
                    }

                    console.log(`[Gemini] ✅ Success with model: ${modelName}`);
                    return res.status(200).json({ success: true, data: parsed });

                } catch (err) {
                    const status = err.response?.status;
                    const errMsg = err.response?.data?.error?.message || err.message;
                    console.error(`[Gemini:${modelName}] attempt ${attempts} failed (${status}):`, errMsg);

                    if (status === 429 && attempts < 2) {
                        console.log(`[Gemini] Rate limited. Waiting 45s before retry...`);
                        await sleep(45000);
                        continue;
                    }
                    break;
                }
            }
        }

        return res.status(429).json({
            success: false,
            message: "AI rate limit reached. Please wait 1 minute and try again.",
        });

    } catch (error) {
        console.error("[AI Controller Error]:", error?.message || error);
        return res.status(500).json({ success: false, message: "AI generation failed. Please try again." });
    }
};
