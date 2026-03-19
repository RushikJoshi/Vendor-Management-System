const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

/**
 * Send Email Utility
 * @param {Object} options - { to, subject, templateName, placeholders }
 */
const sendEmail = async (options) => {
    try {
        // 1) Create Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2) Handle HTML Template if templateName is provided
        let html = options.html;
        if (options.templateName) {
            const templatePath = path.join(__dirname, "..", "templates", `${options.templateName}.html`);
            if (fs.existsSync(templatePath)) {
                html = fs.readFileSync(templatePath, "utf-8");

                // Replace placeholders like {{name}} with actual values
                if (options.placeholders) {
                    Object.keys(options.placeholders).forEach((key) => {
                        const regex = new RegExp(`{{${key}}}`, "g");
                        html = html.replace(regex, options.placeholders[key]);
                    });
                }
            }
        }

        // 3) Define Mail Options
        const mailOptions = {
            from: `"Vendor Management System" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text || "New notification from Vendor Management System",
            html: html,
        };

        // 4) Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("EMAIL ERROR:", error.message);
        // We log the error but don't re-throw to prevent crashing the main request
        return null;
    }
};

module.exports = sendEmail;
