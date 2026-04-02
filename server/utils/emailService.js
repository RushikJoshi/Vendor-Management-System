const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

exports.sendEmail = async ({ to, subject, text, html, attachments }) => {
    try {
        const info = await transporter.sendMail({
            from: `"VMS Enterprise" <${process.env.SMTP_USER || process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
            attachments
        });
        console.log("📧 Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Email error:", error);
        // Don't throw if email fails in dev, just log it
        if (process.env.NODE_ENV === 'production') throw error;
    }
};
