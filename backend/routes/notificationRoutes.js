const router = require("express").Router();
const { protect } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

// Get user notifications
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id
        }).sort("-createdAt").limit(50);

        res.json({ success: true, data: notifications });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Count unread
router.get("/unread-count", protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false
        });
        res.json({ success: true, count });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Mark as read
router.patch("/:id/read", protect, async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Mark all as read
router.patch("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
