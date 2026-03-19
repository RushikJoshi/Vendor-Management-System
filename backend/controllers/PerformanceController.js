const PerformanceReview = require("../models/PerformanceReview");
const LifecycleService = require("../services/LifecycleService");

exports.submitReview = async (req, res) => {
    try {
        const { vendorId, scores, remarks } = req.body;

        const review = await LifecycleService.recordPerformance(req, vendorId, scores, remarks);

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getVendorPerformance = async (req, res) => {
    try {
        const reviews = await PerformanceReview.find({ vendorId: req.params.vendorId }).sort("-reviewDate");
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
