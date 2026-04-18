const express = require("express");
const { createSO, getSOs } = require("../controllers/soController");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", createSO);
router.get("/", getSOs);

module.exports = router;
