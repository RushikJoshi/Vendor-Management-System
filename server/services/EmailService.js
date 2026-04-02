const { sendEmail } = require("../utils/emailService");

class EmailService {
    static getBaseTemplate(content, ctaLink = null, ctaText = "View Details") {
        return `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
            <div style="background-color: #0F7B4D; padding: 40px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">VMS ENTERPRISE</h1>
            </div>
            <div style="padding: 40px; color: #1a1a1a; line-height: 1.6;">
                ${content}
                ${ctaLink ? `
                    <div style="margin-top: 40px; text-align: center;">
                        <a href="${ctaLink}" style="background-color: #0F7B4D; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">${ctaText}</a>
                    </div>
                ` : ''}
            </div>
            <div style="padding: 24px; background-color: #fbfbfb; border-top: 1px solid #f0f0f0; text-align: center; color: #999999; font-size: 12px;">
                <p style="margin: 0;">&copy; 2026 VMS Enterprise Procure-to-Pay System. All rights reserved.</p>
                <p style="margin: 4px 0;">This is an automated system message. Please do not reply directly.</p>
            </div>
        </div>
        `;
    }

    static async sendInvitationEmail(email, categoryName, token) {
        const link = `${process.env.FRONTEND_URL}/register?token=${token}`;
        const content = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Strategic Sourcing Invitation</h2>
            <p>Your organization has been identified as a potential partner for the <strong>${categoryName}</strong> category.</p>
            <p>Please complete your digital dossier and submit for compliance verification via our enterprise registration portal.</p>
        `;
        return sendEmail({
            to: email,
            subject: "Invitation to Join VMS Enterprise Supply Chain",
            html: this.getBaseTemplate(content, link, "Begin Registration")
        });
    }

    static async sendApprovalNotification(email, companyName, stageName) {
        const content = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Checkpoint Authorized</h2>
            <p>Dear ${companyName},</p>
            <p>We are pleased to inform you that your <strong>${stageName}</strong> stage has been successfully verified and authorized by our compliance team.</p>
            <p>Your application has advanced to the next segment of our procurement pipeline.</p>
        `;
        return sendEmail({
            to: email,
            subject: `Update: ${stageName} Stage Approved - VMS`,
            html: this.getBaseTemplate(content, `${process.env.FRONTEND_URL}/dashboard`, "Track Progress")
        });
    }

    static async sendRejectionNotification(email, companyName, stageName, remarks) {
        const content = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #dc2626;">Dossier Rejected</h2>
            <p>Dear ${companyName},</p>
            <p>Your application was not authorized during the <strong>${stageName}</strong> verification phase.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-weight: 700; color: #991b1b;">Reviewer Justification:</p>
                <p style="margin: 8px 0 0 0; color: #b91c1c;">"${remarks}"</p>
            </div>
            <p>Please review the requirements and re-submit if applicable.</p>
        `;
        return sendEmail({
            to: email,
            subject: "Notification: Application Status Updated",
            html: this.getBaseTemplate(content)
        });
    }

    static async sendDocumentExpiryAlert(email, docName, daysLeft) {
        const content = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #d97706;">Compliance Alert: Document Expiry</h2>
            <p>Our automated monitoring system has detected that your <strong>${docName}</strong> is expiring in <strong>${daysLeft} days</strong>.</p>
            <p>Maintaining valid compliance documentation is mandatory to remain an active vendor in our registry. Please upload updated documents immediately.</p>
        `;
        return sendEmail({
            to: email,
            subject: "Urgent: Compliance Document Expiring Soon",
            html: this.getBaseTemplate(content, `${process.env.FRONTEND_URL}/dashboard/documents`, "Upload New Document")
        });
    }

    static async sendApplicationSubmissionEmail(vendorEmail, adminEmail, application, pdfPath) {
        // Send email to Admin
        const adminContent = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">New Vendor Registration</h2>
            <p>A new Vendor Application has been submitted by <strong>${application.companyName || vendorEmail}</strong>.</p>
            <p><strong>Application ID:</strong> ${application._id}</p>
            <p>Please find the structured dossier attached to this email.</p>
        `;

        await sendEmail({
            to: adminEmail,
            subject: "Notification: New Vendor Registration",
            html: this.getBaseTemplate(adminContent, `${process.env.FRONTEND_URL}/admin/applications`, "Review Application"),
            attachments: [{ path: pdfPath }]
        });

        // Send confirmation email to Vendor
        const vendorContent = `
            <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Registration Successfully Submitted</h2>
            <p>Dear ${application.companyName || vendorEmail},</p>
            <p>Thank you for submitting your registration to VMS Enterprise. Your dossier has advanced to the Technical Review stage.</p>
            <p><strong>Application ID:</strong> ${application._id}</p>
            <p>A structured format of your submitted profile is attached to this email for your records.</p>
        `;

        await sendEmail({
            to: vendorEmail,
            subject: "Application Submitted - VMS Enterprise",
            html: this.getBaseTemplate(vendorContent),
            attachments: [{ path: pdfPath }]
        });
    }

    /**
     * Vendor Account Activated — sent when application is fully approved
     * Includes login credentials and dashboard link
     */
    static async sendVendorApprovalWelcomeEmail(email, companyName, tempPassword) {
        const dashboardLink = `${process.env.FRONTEND_URL}/login`;
        const content = `
            <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #0F7B4D;">🎉 Congratulations! You're Approved.</h2>
            <p style="color: #555; margin-bottom: 24px;">Dear <strong>${companyName}</strong>, your vendor registration has been reviewed and <strong style="color: #0F7B4D;">fully approved</strong> by our procurement team. Your account is now active.</p>

            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #bbf7d0; border-radius: 16px; padding: 28px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 1.5px;">Your Login Credentials</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0; font-size: 13px; color: #555; font-weight: 600; width: 40%;">Login Email</td>
                        <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0; font-size: 13px; color: #111; font-weight: 700;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-size: 13px; color: #555; font-weight: 600;">Temporary Password</td>
                        <td style="padding: 10px 0; font-size: 16px; color: #0F7B4D; font-weight: 800; letter-spacing: 3px; font-family: monospace;">${tempPassword}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ <strong>Important:</strong> This is a temporary password. Please log in and change it immediately for security.</p>
            </div>

            <p style="color: #555; font-size: 14px;">Use the button below to access your vendor dashboard and complete your profile setup.</p>
        `;
        return sendEmail({
            to: email,
            subject: "🎉 Account Activated — Welcome to VMS Enterprise",
            html: this.getBaseTemplate(content, dashboardLink, "Access Vendor Dashboard")
        });
    }

    /**
     * Rejection notification with reason
     */
    static async sendApplicationRejectionEmail(email, companyName, reason) {
        const content = `
            <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #dc2626;">Application Not Approved</h2>
            <p>Dear <strong>${companyName}</strong>,</p>
            <p>After careful review, we regret to inform you that your vendor application was <strong>not approved</strong> at this time.</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 6px 0; font-weight: 700; color: #991b1b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reason for Rejection</p>
                <p style="margin: 0; color: #b91c1c; font-style: italic;">"${reason}"</p>
            </div>
            <p style="color: #555;">If you believe this was in error or wish to re-apply, please contact our procurement team.</p>
        `;
        return sendEmail({
            to: email,
            subject: "Update: Vendor Application Status — VMS Enterprise",
            html: this.getBaseTemplate(content)
        });
    }
}

module.exports = EmailService;
