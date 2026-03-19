const Invitation = require("../models/Invitation");
const EmailService = require("../services/EmailService");
const Category = require("../models/Category");
const crypto = require("crypto");

exports.sendInvitation = async (req, res) => {
    try {
        const { email, categoryId } = req.body;

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const category = await Category.findById(categoryId);
        const invitation = await Invitation.create({
            email,
            token,
            category: categoryId,
            invitedBy: req.user.id,
            expiresAt,
        });

        await EmailService.sendInvitationEmail(email, category?.name || "Unclassified", token);

        res.status(201).json({ success: true, data: invitation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.verifyInvitation = async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation.findOne({
            token,
            status: "sent",
            expiresAt: { $gt: new Date() },
        }).populate("category");

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired invitation token",
            });
        }

        res.status(200).json({ success: true, data: invitation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find()
            .populate("category")
            .populate("invitedBy", "email")
            .sort("-createdAt");
        res.status(200).json({ success: true, data: invitations });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
