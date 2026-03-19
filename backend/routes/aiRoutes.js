const express = require("express");
const router = express.Router();
const { generateCategoryAI } = require("../controllers/aiController");

router.post("/generate-ai", generateCategoryAI);

module.exports = router;
