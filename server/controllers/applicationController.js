const VendorApplication = require("../models/VendorApplication");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const Category = require("../models/Category");
const { sendEmail } = require("../utils/emailService");
const EligibilityService = require("../services/EligibilityService");
const WorkflowService = require("../services/WorkflowService");
const AuditService = require("../services/AuditService");
const NotificationService = require("../services/NotificationService");
const EmailService = require("../services/EmailService");
const PdfService = require("../services/PdfService");
const SequenceService = require("../services/SequenceService");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { successResponse, errorResponse } = require("../utils/responseHandler");

const resolveApplicationTenantId = async (application, fallbackTenantId = null) => {
    if (fallbackTenantId) return fallbackTenantId;
    
    // 1. Check if it was approved by someone already
    if (application?.approvedBy) {
        const approver = await User.findById(application.approvedBy).select("tenantId");
        if (approver?.tenantId) return approver.tenantId;
    }

    // 2. Check if it came from an invitation
    if (application?.invitationToken) {
        const Invitation = require("../models/Invitation");
        const invite = await Invitation.findOne({ token: application.invitationToken }).populate("invitedBy");
        if (invite?.invitedBy?.tenantId) return invite.invitedBy.tenantId;
    }

    // 3. Last resort: Get many first admin to find a tenantId if single-tenant environment
    const firstAdmin = await User.findOne({ role: "admin" }).select("tenantId");
    return firstAdmin?.tenantId || "DEFAULT";
};

// @desc Check if email already exists (Public)
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return successResponse(res, "Email param required", { exists: false });
        const existing = await VendorApplication.findOne({ email: email.toLowerCase().trim() });
        return successResponse(res, "Email check complete", { exists: !!existing });
    } catch (err) {
        return errorResponse(res, err.message, null, 400);
    }
};

// @desc Submit or Update Application (Public)
exports.submitApplication = async (req, res) => {
    try {
        const { invitationToken, categoryId, data, companyName } = req.body;
        const incomingData = typeof data === "string" ? JSON.parse(data) : (data || {});

        // 1) Dynamic Category Resolution
        // If the vendor types a category in the form, we ensure it exists in the registry
        let resolvedCategoryId = categoryId && categoryId !== 'null' ? categoryId : null;
        const dynamicCatName = incomingData.serviceCategory || incomingData.vendor_category || incomingData.category;

        if (dynamicCatName && typeof dynamicCatName === 'string' && dynamicCatName.trim() !== '') {
            let finalName = dynamicCatName.trim();
            // Handle breadcrumb if present: "A > B > C" -> "C"
            if (finalName.includes(' > ')) {
                const parts = finalName.split(' > ');
                finalName = parts[parts.length - 1].split(' (')[0].trim();
            }

            let category = await Category.findOne({ name: { $regex: new RegExp(`^${finalName}$`, "i") } });
            if (!category) {
                // Auto-create new category
                const baseCode = finalName.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 10);
                category = await Category.create({
                    name: finalName,
                    code: `${baseCode}_${Math.floor(Math.random() * 10000)}`,
                    description: `Auto-created from form submission`,
                    status: "active"
                });
                console.log(`✨ New category created: ${finalName}`);
            }
            resolvedCategoryId = category._id;
        }

        // Priority: explicit body email → form field email → form field co_email
        const email =
            req.body.email ||
            incomingData?.email ||
            incomingData?.co_email ||
            incomingData?.contactEmail ||
            incomingData?.businessEmail ||
            incomingData?.vendorEmail ||
            incomingData?.emailAddress;

        if (!email) throw new Error("Compliance Error: Identification email is required to process dossier.");

        // 1) Find existing application - Only match by token to allow multiple applications per email
        // If invitationToken is provided, we update that specific dossier. 
        // If no token, we always create a new application.
        let application = null;
        if (invitationToken && invitationToken !== 'null') {
            application = await VendorApplication.findOne({ invitationToken });
        }

        // 2) Blacklist Integrity Check
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor && existingVendor.lifecycleStatus === 'blacklisted') {
            throw new Error("Compliance Violation: This organization is currently blacklisted and barred from new applications.");
        }

        if (!application && invitationToken && invitationToken !== 'null') {
            // New application from invitation
            const Invitation = require("../models/Invitation");
            const invite = await Invitation.findOne({ token: invitationToken }).populate("category");

            if (!invite) throw new Error("Invalid or expired invitation token.");

            const category = invite.category;
            if (!category) throw new Error("Category configuration missing for this invitation.");

            const tenantId = await resolveApplicationTenantId(null, req.user?.tenantId);
            const applicationId = await SequenceService.getNextSequence(tenantId, "application");

            application = await VendorApplication.create({
                applicationId,
                formTemplate: req.body.formTemplateId || category.formTemplate,
                formVersion: req.body.formVersion || 1,
                category: resolvedCategoryId || category._id,
                invitationToken,
                email: email,
                vendorEmail: email,
                companyName: companyName || incomingData.companyName || incomingData.vendorName || incomingData.co_name || incomingData.fullTradeName || incomingData.company_name || incomingData.legalName || incomingData.legal_name || incomingData.tradeName || incomingData.trade_name || incomingData.supplierName || incomingData.organizationName || "Vendor Submission",
                data: incomingData,
                status: "submitted",
                submittedAt: new Date(),
                documents: req.files ? req.files.map(f => ({
                    name: f.originalname,
                    url: f.path,
                    public_id: f.filename,
                    fieldName: f.fieldname
                })) : []
            });

            // Initialize strict workflow
            WorkflowService.initializeWorkflow(application);
            await application.save();

            // Perform initial scoring
            await EligibilityService.calculateScore(application, category);

            invite.status = "accepted";
            await invite.save();
        } else if (!application && resolvedCategoryId) {
            // New application from public category registration (resolved either by ID or dynamic name)
            const category = await Category.findById(resolvedCategoryId);
            if (!category || category.status !== "active") throw new Error("Invalid or inactive category.");

            const effectiveFormTemplateId = req.body.formTemplateId || category.formTemplate;
            // Fallback for auto-created categories which might not have a form template linked yet
            const finalFormTemplateId = effectiveFormTemplateId || (await Category.findOne({ formTemplate: { $exists: true } }).select("formTemplate")).formTemplate;

            if (!finalFormTemplateId) throw new Error("Category configuration missing form template.");

            const tenantId = await resolveApplicationTenantId(null, req.user?.tenantId);
            const applicationId = await SequenceService.getNextSequence(tenantId, "application");

            application = await VendorApplication.create({
                applicationId,
                formTemplate: finalFormTemplateId,
                formVersion: req.body.formVersion || 1,
                category: category._id,
                email: email,
                vendorEmail: email,
                companyName: companyName || incomingData.companyName || incomingData.vendorName || incomingData.co_name || incomingData.fullTradeName || incomingData.company_name || incomingData.legalName || incomingData.legal_name || incomingData.tradeName || incomingData.trade_name || incomingData.supplierName || incomingData.organizationName || "Vendor Submission",
                data: incomingData,
                status: "submitted",
                submittedAt: new Date(),
                documents: req.files ? req.files.map(f => ({
                    name: f.originalname,
                    url: f.path,
                    public_id: f.filename,
                    fieldName: f.fieldname
                })) : []
            });

            // Initialize strict workflow
            WorkflowService.initializeWorkflow(application);
            await application.save();

            // Perform initial scoring
            await EligibilityService.calculateScore(application, category);
        } else if (!application) {
            // No category, using Master Form fallback directly
            const tenantId = await resolveApplicationTenantId(null, req.user?.tenantId);
            const applicationId = await SequenceService.getNextSequence(tenantId, "application");

            const defaultCategory = await Category.findOne() || null;
            application = await VendorApplication.create({
                applicationId,
                formTemplate: req.body.formTemplateId,
                formVersion: req.body.formVersion || 1,
                category: defaultCategory ? defaultCategory._id : null,
                email: email,
                vendorEmail: email,
                companyName: companyName || incomingData.companyName || incomingData.vendorName || incomingData.co_name || incomingData.fullTradeName || incomingData.company_name || incomingData.legalName || incomingData.legal_name || incomingData.tradeName || incomingData.trade_name || incomingData.supplierName || incomingData.organizationName || "Vendor Submission",
                data: incomingData,
                status: "submitted",
                submittedAt: new Date(),
                documents: req.files ? req.files.map(f => ({
                    name: f.originalname,
                    url: f.path,
                    public_id: f.filename,
                    fieldName: f.fieldname
                })) : []
            });

            // Initialize strict workflow
            WorkflowService.initializeWorkflow(application);
            await application.save();
        } else if (application) {
            // Update existing draft
            const category = application.category ? await Category.findById(application.category) : null;

            // ✅ Self-heal: fix corrupted currentStage value if not a valid enum
            const validStages = ["TECHNICAL", "FINANCE", "COMPLIANCE", "FINAL_APPROVAL", "COMPLETED"];
            if (!validStages.includes(application.currentStage)) {
                application.currentStage = "TECHNICAL";
            }

            // ✅ Self-heal: reinitialize workflow if stages are missing
            if (!application.workflowStages || application.workflowStages.length === 0) {
                WorkflowService.initializeWorkflow(application);
            }

            // Safely merge map data
            const existingData = application.data instanceof Map ?
                Object.fromEntries(application.data) :
                (application.data || {});

            application.data = { ...existingData, ...incomingData };

            if (companyName || incomingData.companyName || incomingData.vendorName || incomingData.co_name) {
                application.companyName = companyName || incomingData.companyName || incomingData.vendorName || incomingData.co_name;
            }

            if (req.files && req.files.length > 0) {
                const newDocs = req.files.map(f => ({
                    name: f.originalname,
                    url: f.path,
                    public_id: f.filename,
                    fieldName: f.fieldname
                }));
                // Check for duplicates before adding
                const existingNames = application.documents.map(d => d.name);
                const filteredNewDocs = newDocs.filter(d => !existingNames.includes(d.name));
                application.documents = [...application.documents, ...filteredNewDocs];
            }

            if (invitationToken && invitationToken !== 'null' && !application.invitationToken) {
                application.invitationToken = invitationToken;
            }

            // Perform DB update bypassing save hook
            await VendorApplication.findByIdAndUpdate(application._id, {
                $set: {
                    data: application.data,
                    companyName: application.companyName,
                    documents: application.documents,
                    invitationToken: application.invitationToken,
                    currentStage: application.currentStage,
                    workflowStages: application.workflowStages,
                    category: resolvedCategoryId || application.category
                }
            });

            // Recalculate score on update
            if (resolvedCategoryId || application.category) {
                const finalCat = await Category.findById(resolvedCategoryId || application.category);
                if (finalCat) {
                    await EligibilityService.calculateScore(application, finalCat);
                }
            }
        } else {
            throw new Error("Application Dossier not found. Please ensure you are using a valid invitation link.");
        }

        return successResponse(res, "Dossier synchronized successfully.", application);
    } catch (err) {
        console.error("Dossier Submission Core Exception:", err);
        return errorResponse(res, err.message, null, 400);
    }
};

// @desc Final Submission (Public)
exports.finalizeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await VendorApplication.findById(id);

        if (!application) throw new Error("Application not found");

        application.status = "submitted";
        application.submittedAt = new Date();
        await application.save();

        // Ensure score is up to date on final submission
        const category = application.category ? await Category.findById(application.category) : null;
        if (category) {
            await EligibilityService.calculateScore(application, category);
        }

        // Generate PDF
        let pdfPath = null;
        try {
            pdfPath = await PdfService.generateVendorApplicationPDF(application);
            application.pdfPath = pdfPath;
            await application.save();
        } catch (pdfErr) {
            console.error("PDF generation failed:", pdfErr);
        }

        // Centralized Immutable Audit Logging
        await AuditService.log({
            req,
            actionType: "Application Submitted + Email Sent",
            entityType: "Application",
            entityId: application._id,
            afterData: { status: "submitted", pdfPath }
        });

        // Notify Reviewers in-app
        await NotificationService.notifyAdminsByRole("Technical Reviewer", {
            title: "New Application Received",
            message: `${application.companyName} has submitted their dossier for Technical Review.`,
            type: "INFO",
            relatedEntityId: application._id,
            relatedEntityType: "Application"
        });

        const vendorEmail = application.vendorEmail || application.email;
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL || "admin@vms.com";
        if (pdfPath && vendorEmail) {
            try {
                await EmailService.sendApplicationSubmissionEmail(
                    vendorEmail,
                    adminEmail,
                    application,
                    pdfPath
                );
                console.log(`📧 Submission emails sent → Vendor: ${vendorEmail} | Admin: ${adminEmail}`);
            } catch (emailErr) {
                console.error("Failed to send submission emails:", emailErr);
            }
        }

        return successResponse(res, "Application submitted successfully");
    } catch (err) {
        return errorResponse(res, err.message, null, 400);
    }
};

exports.processApprovalStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;

        // ── 1. Validate inputs ────────────────────────
        const VALID_STATUSES = ["approved", "rejected", "changes_requested"];
        if (!status || !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
        }
        if (status === "approved" && !remarks?.trim()) {
            return res.status(400).json({ success: false, message: "Authorization remarks are required." });
        }

        // ── 2. Load application ───────────────────────
        const application = await VendorApplication.findById(id);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });

        // ── 3. Normalize user identity ────────────────
        const userId = req.user._id?.toString() || req.user.id || null;
        const userRole = req.user.roleName || req.user.role || "unknown";

        // ── 4. Apply workflow logic inline ────────────
        if (status === "approved") {
            // Find current pending stage
            const stage = application.workflowStages?.find(s => s.stageName === application.currentStage && s.status === "pending");

            if (stage) {
                stage.status = "approved";
                stage.reviewedBy = userId;
                stage.reviewedAt = new Date();
                stage.remarks = remarks?.trim();

                // Unlock next stage or mark completed
                const nextStage = application.workflowStages.find(s => s.stageOrder === stage.stageOrder + 1);
                if (nextStage) {
                    nextStage.status = "pending";
                    application.currentStage = nextStage.stageName;
                } else {
                    application.currentStage = "COMPLETED";
                    application.status = "approved";
                    application.approvedAt = new Date();
                    application.approvedBy = userId;
                }
            } else {
                // No workflowStages or already done — direct approve
                application.status = "approved";
                application.currentStage = "COMPLETED";
                application.approvedAt = new Date();
                application.approvedBy = userId;
            }

        } else if (status === "rejected") {
            const stage = application.workflowStages?.find(s => s.stageName === application.currentStage);
            if (stage) {
                stage.status = "rejected";
                stage.reviewedBy = userId;
                stage.reviewedAt = new Date();
                stage.remarks = remarks?.trim();
                application.workflowStages.forEach(s => {
                    if (s.status === "pending" || s.status === "locked") s.status = "locked";
                });
            }
            application.status = "rejected";
            application.rejectedAt = new Date();
            application.rejectedBy = userId;

        } else {
            // changes_requested
            const stage = application.workflowStages?.find(s => s.stageName === application.currentStage);
            if (stage) { stage.remarks = remarks?.trim(); }
            application.status = "changes_requested";
        }

        // ── 5. Persist with findByIdAndUpdate (bypasses all hooks & validation) ──
        const updatePayload = {
            status: application.status,
            currentStage: application.currentStage,
            workflowStages: application.workflowStages,
        };
        if (application.approvedAt) updatePayload.approvedAt = application.approvedAt;
        if (application.approvedBy) updatePayload.approvedBy = application.approvedBy;
        if (application.rejectedAt) updatePayload.rejectedAt = application.rejectedAt;
        if (application.rejectedBy) updatePayload.rejectedBy = application.rejectedBy;

        const updated = await VendorApplication.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true, runValidators: false }
        );

        // ── 6. Side effects — fully non-blocking ──────
        setImmediate(async () => {
            try {
                // Audit log
                await AuditService.log({
                    req,
                    actionType: `WORKFLOW_STAGE_${status.toUpperCase()}`,
                    entityType: "VendorApplication",
                    entityId: application._id,
                    metadata: { status, remarks, stage: updated.currentStage, userRole }
                });
            } catch (e) { console.error("Audit log failed:", e.message); }

            try {
                // Email notification
                if (status === "approved") {
                    await EmailService.sendApprovalNotification(updated.email, updated.companyName, updated.currentStage);
                } else if (status === "rejected") {
                    await EmailService.sendApplicationRejectionEmail(updated.email, updated.companyName, remarks);
                }
            } catch (e) { console.error("Email notification failed:", e.message); }

            // Create vendor account when fully approved
            if (status === "approved" && updated.currentStage === "COMPLETED") {
                try {
                    await exports.createVendorFromApplication(updated, req.user?.tenantId);
                } catch (e) { console.error("Vendor creation failed:", e.message); }
            }
        });

        // ── 7. Return success immediately ─────────────
        return res.status(200).json({
            success: true,
            message: status === "approved"
                ? (updatePayload.currentStage === "COMPLETED"
                    ? "Application fully approved! Vendor account is being created."
                    : `Stage approved. Next: ${updatePayload.currentStage}`)
                : status === "rejected" ? "Application rejected."
                    : "Changes requested from vendor.",
            data: updated
        });

    } catch (err) {
        console.error("❌ processApprovalStage FATAL:", err.message, err.stack);
        next(err);
    }
};

// @desc Full Approve: status check → vendor creation → credentials → email → audit
// POST /api/applications/:id/approve
exports.approveApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const application = await VendorApplication.findById(id);
        if (!application) return errorResponse(res, "Application not found", null, 404);

        // 1. Status guard — only submitted/in_review can be approved
        const actionableStatuses = ["submitted", "in_review", "draft"];
        if (!actionableStatuses.includes(application.status)) {
            return errorResponse(res, `Cannot approve: application is already '${application.status}'`, null, 400);
        }

        // 2. Check if vendor already exists (prevent duplicate)
        const existingVendor = await Vendor.findOne({ email: application.email });
        if (existingVendor) {
            // Already created — just mark approved
            application.status = "approved";
            application.approvedAt = new Date();
            application.approvedBy = req.user._id;
            application.currentStage = "COMPLETED";
            application.workflowStages?.forEach(s => { if (s.status !== 'approved') s.status = 'approved'; });
            await application.save({ validateBeforeSave: false });
            return successResponse(res, "Application approved (vendor already exists)", application);
        }

        // 3. Generate secure 8-char temp password (upper + lower + digits)
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        const tempPassword = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // 4. Helper to extract form data values
        const getVal = (...keys) => {
            for (const key of keys) {
                const val = application.data instanceof Map ? application.data.get(key) : application.data?.[key];
                if (val && val !== 'N/A') return val;
            }
            return 'N/A';
        };

        const tenantId = await resolveApplicationTenantId(application, req.user?.tenantId);

        // 5. Create or Update Vendor account mapping form data
        let vendor = await Vendor.findOne({ email: application.email });
        if (vendor) {
            vendor.companyName = application.companyName;
            vendor.phone = getVal('co_mobile', 'mobileNumber', 'phone', 'mobile');
            vendor.category = application.category;
            vendor.address = getVal('co_address', 'address', 'registeredAddress');
            await vendor.save();
        } else {
            const vendorId = await SequenceService.getNextSequence(tenantId, "vendor");
            vendor = await Vendor.create({
                vendorId,
                email: application.email,
                companyName: application.companyName,
                password: hashedPassword,
                status: 'approved',
                phone: getVal('co_mobile', 'mobileNumber', 'phone', 'mobile'),
                contactPerson: getVal('co_contact', 'contactName', 'contactPerson'),
                serviceType: getVal('co_nature', 'natureOfBusiness', 'serviceType') !== 'N/A'
                    ? getVal('co_nature', 'natureOfBusiness', 'serviceType') : 'General',
                category: application.category,
                address: getVal('co_address', 'address', 'registeredAddress'),
                companyDetails: {
                    website: getVal('co_website', 'website'),
                    establishmentYear: Number(getVal('co_estYear', 'establishmentYear')) || 0,
                    natureOfBusiness: getVal('co_nature', 'natureOfBusiness'),
                    employeeCount: Number(getVal('co_employees', 'employeeCount')) || 0,
                    registeredAddress: getVal('co_address', 'address')
                },
                contactDetails: {
                    name: getVal('co_contact', 'contactName'),
                    designation: getVal('co_designation', 'designation'),
                    mobile: getVal('co_mobile', 'mobileNumber'),
                    email: getVal('co_email', 'contactEmail', 'email') !== 'N/A' ? getVal('co_email', 'contactEmail', 'email') : application.email,
                    alternateContact: getVal('co_altMobile', 'altMobile')
                },
                statutoryDetails: {
                    panNumber: getVal('co_pan', 'panNum'),
                    gstNumber: getVal('co_gst', 'gstNum'),
                    registrationType: getVal('co_regType', 'regType'),
                    msmeNumber: getVal('co_msme', 'msmeNum'),
                    msmeCategory: getVal('co_msmeCat', 'msmeCat')
                },
                bankAccount: {
                    accountHolderName: getVal('bk_beneficiary', 'beneficiaryName', 'accountHolderName'),
                    bankName: getVal('bk_bankName', 'bankName'),
                    branchName: getVal('bk_branch', 'bankBranch', 'branchName'),
                    accountNumber: getVal('bk_accNo', 'accountNumber'),
                    ifscCode: getVal('bk_ifsc', 'ifscCode'),
                },
                taxDetails: {
                    itrLast3Years: getVal('tx_itr', 'itrStatus'),
                    taxResidencyCert: getVal('tx_trc', 'trcStatus'),
                    vatNumber: getVal('tx_vat', 'vatNum')
                },
                complianceDetails: {
                    antiBribery: ['true', 'on', true].includes(getVal('cl_antiBribery', 'antiBribery')),
                    noConflict: ['true', 'on', true].includes(getVal('cl_noConflict', 'noConflict')),
                    dataPrivacy: ['true', 'on', true].includes(getVal('cl_dataPrivacy', 'dataPrivacy'))
                },
                documents: (application.documents || []).map(doc => ({
                    name: doc.name, url: doc.url,
                    public_id: doc.public_id, fieldName: doc.fieldName
                })),
                createdFromApplicationId: application._id,
                rating: 0,
                contractsCount: 0
            });
        }

        // 5b. Handle User account for authentication
        let user = await User.findOne({ email: application.email });
        if (!user) {
            user = await User.create({
                name: application.companyName,
                email: application.email,
                password: tempPassword,
                role: "vendor",
                status: "active",
                mustChangePassword: true,
                tenantId,
            });
        } else {
            // Only update role to vendor if they are not already an admin/hr
            if (user.role === "vendor") {
                user.name = application.companyName;
                user.status = "active";
                user.mustChangePassword = true;
                user.password = tempPassword;
                await user.save();
            }
        }

        // Link User to Vendor
        vendor.createdBy = user._id;
        await vendor.save();

        // 6. Update application status
        application.status = 'approved';
        application.approvedAt = new Date();
        application.approvedBy = req.user._id;
        application.currentStage = 'COMPLETED';
        if (remarks) {
            const currentStageObj = application.workflowStages?.find(s => s.status === 'pending');
            if (currentStageObj) { currentStageObj.status = 'approved'; currentStageObj.remarks = remarks; }
        }
        await application.save({ validateBeforeSave: false });

        // 7. Send welcome email with credentials (non-blocking)
        EmailService.sendVendorApprovalWelcomeEmail(application.email, application.companyName, tempPassword)
            .catch(err => console.error('Approval email failed:', err));

        // 7b. NOTIFY VENDOR IN-APP
        const NotificationService = require("../services/NotificationService");
        NotificationService.sendNotification(vendor._id, {
            title: "Application Approved",
            message: `Your application for ${application.companyName} has been approved.`,
            type: "application",
            relatedEntityId: application._id
        });


        // 8. Audit log
        await AuditService.log({
            req,
            actionType: 'APPLICATION_APPROVED',
            entityType: 'VendorApplication',
            entityId: application._id,
            beforeData: { status: 'submitted' },
            afterData: { status: 'approved', vendorId: vendor._id },
            metadata: { remarks: remarks || 'Approved by admin', companyName: application.companyName }
        });

        return successResponse(res, 'Application approved. Vendor account created and credentials sent via email.', {
            application,
            vendor: { id: vendor._id, email: vendor.email, companyName: vendor.companyName }
        });
    } catch (err) {
        console.error('Approve Application Error:', err);
        return errorResponse(res, err.message, null, 500);
    }
};

// @desc Full Reject: status check → update app → send rejection email → audit
// POST /api/applications/:id/reject
exports.rejectApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks, reason } = req.body;
        const rejectionReason = remarks || reason || 'Application did not meet requirements';

        const application = await VendorApplication.findById(id);
        if (!application) return errorResponse(res, "Application not found", null, 404);

        if (application.status === 'rejected') {
            return errorResponse(res, 'Application is already rejected', null, 400);
        }

        // Update status
        application.status = 'rejected';
        application.rejectedAt = new Date();
        application.rejectedBy = req.user._id;
        application.workflowStages?.forEach(s => {
            if (s.status === 'pending' || s.status === 'locked') s.status = 'locked';
        });
        await application.save({ validateBeforeSave: false });

        // Send rejection email (non-blocking)
        EmailService.sendApplicationRejectionEmail(application.email, application.companyName, rejectionReason)
            .catch(err => console.error('Rejection email failed:', err));

        // Audit log
        await AuditService.log({
            req,
            actionType: 'APPLICATION_REJECTED',
            entityType: 'VendorApplication',
            entityId: application._id,
            beforeData: { status: application.status },
            afterData: { status: 'rejected' },
            metadata: { reason: rejectionReason, companyName: application.companyName }
        });

        return successResponse(res, 'Application rejected. Vendor has been notified via email.', application);
    } catch (err) {
        console.error('Reject Application Error:', err);
        return errorResponse(res, err.message, null, 500);
    }
};

async function createVendorFromApplication(application, fallbackTenantId = null) {
    // 1. Generate secure 8-char temp password (upper + lower + digits)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const tempPassword = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // 2. Helper to extract form data values robustly across different form templates
    const getVal = (...keys) => {
        for (const key of keys) {
            const val = application.data instanceof Map ? application.data.get(key) : application.data?.[key];
            if (val && val !== 'N/A') return val;
        }
        return 'N/A';
    };

    // 3. Create or Update Vendor account mapping form data
    const contactNameVal = getVal('co_contact', 'contactName', 'contactPerson');
    const vendorName = contactNameVal !== 'N/A' ? contactNameVal : application.companyName;

    let vendor = await Vendor.findOne({ email: application.email });
    const tenantId = await resolveApplicationTenantId(application, fallbackTenantId);

    if (vendor) {
        vendor.name = vendorName;
        vendor.companyName = application.companyName;
        vendor.phone = getVal('co_mobile', 'mobileNumber', 'phone', 'mobile');
        vendor.category = application.category;
        vendor.address = getVal('co_address', 'address', 'registeredAddress');
        await vendor.save();
    } else {
        const vendorId = await SequenceService.getNextSequence(tenantId, "vendor");
        vendor = await Vendor.create({
            vendorId,
            name: vendorName,
            createdBy: application.approvedBy || application.category,
            email: application.email,
            companyName: application.companyName,
            password: hashedPassword,
            status: 'active',
            phone: getVal('co_mobile', 'mobileNumber', 'phone', 'mobile'),
            contactPerson: vendorName,
            serviceType: getVal('co_nature', 'natureOfBusiness', 'serviceType') !== 'N/A'
                ? getVal('co_nature', 'natureOfBusiness', 'serviceType') : 'General',
            category: application.category,
            address: getVal('co_address', 'address', 'registeredAddress'),
            companyDetails: {
                website: getVal('co_website', 'website'),
                establishmentYear: Number(getVal('co_estYear', 'establishmentYear')) || 0,
                natureOfBusiness: getVal('co_nature', 'natureOfBusiness'),
                employeeCount: Number(getVal('co_employees', 'employeeCount')) || 0,
                registeredAddress: getVal('co_address', 'address')
            },
            contactDetails: {
                name: getVal('co_contact', 'contactName'),
                designation: getVal('co_designation', 'designation'),
                mobile: getVal('co_mobile', 'mobileNumber'),
                email: getVal('co_email', 'contactEmail', 'email') !== 'N/A' ? getVal('co_email', 'contactEmail', 'email') : application.email,
                alternateContact: getVal('co_altMobile', 'altMobile')
            },
            statutoryDetails: {
                panNumber: getVal('co_pan', 'panNum'),
                gstNumber: getVal('co_gst', 'gstNum'),
                registrationType: getVal('co_regType', 'regType'),
                msmeNumber: getVal('co_msme', 'msmeNum'),
                msmeCategory: getVal('co_msmeCat', 'msmeCat')
            },
            bankAccount: {
                accountHolderName: getVal('bk_beneficiary', 'beneficiaryName', 'accountHolderName'),
                bankName: getVal('bk_bankName', 'bankName'),
                branchName: getVal('bk_branch', 'bankBranch', 'branchName'),
                accountNumber: getVal('bk_accNo', 'accountNumber'),
                ifscCode: getVal('bk_ifsc', 'ifscCode'),
            },
            taxDetails: {
                itrLast3Years: getVal('tx_itr', 'itrStatus'),
                taxResidencyCert: getVal('tx_trc', 'trcStatus'),
                vatNumber: getVal('tx_vat', 'vatNum')
            },
            complianceDetails: {
                antiBribery: ['true', 'on', true].includes(getVal('cl_antiBribery', 'antiBribery')),
                noConflict: ['true', 'on', true].includes(getVal('cl_noConflict', 'noConflict')),
                dataPrivacy: ['true', 'on', true].includes(getVal('cl_dataPrivacy', 'dataPrivacy'))
            },
            documents: (application.documents || []).map(doc => ({
                name: doc.name, url: doc.url,
                public_id: doc.public_id, fieldName: doc.fieldName
            })),
            createdFromApplicationId: application._id,
            rating: 0,
            contractsCount: 0
        });
    }

    // 4. Handle User account for authentication
    let user = await User.findOne({ email: application.email });
    if (!user) {
        user = await User.create({
            name: application.companyName,
            email: application.email,
            password: tempPassword,
            role: "vendor",
            status: "active",
            mustChangePassword: true,
            tenantId
        });
    } else {
        if (user.role === "vendor") {
            user.name = application.companyName;
            user.status = "active";
            user.mustChangePassword = true;
            user.password = tempPassword;
            await user.save();
        }
    }

    // Link User to Vendor
    vendor.createdBy = user._id;
    await vendor.save();

    // 5. Update the application to link vendor ID using findByIdAndUpdate (bypasses hooks)
    await VendorApplication.findByIdAndUpdate(application._id, {
        $set: { vendorId: vendor._id }
    });

    // 5. Send rich welcome email (this will send the template to the user's registry email)
    await EmailService.sendVendorApprovalWelcomeEmail(
        application.email,
        application.companyName,
        tempPassword
    );

    return vendor;
}

exports.getApplicationState = async (req, res) => {
    try {
        const { email } = req.params;
        const application = await VendorApplication.findOne({ email }).populate("category formTemplate");
        return successResponse(res, "Application state retrieved", application);
    } catch (err) {
        return errorResponse(res, err.message, null, 400);
    }
};

exports.getApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;

        // RBAC: Vendors should only see their own applications
        if (req.user.role === "vendor") {
            query.email = req.user.email;
        }


        const TreeSubmission = require("../models/TreeSubmission");
        
        // Fetch from both sources
        const [apps, treeSubmissions] = await Promise.all([
             VendorApplication.find(query).populate("category").sort("-createdAt").skip(skip).limit(parseInt(limit)),
             TreeSubmission.find(status ? { status } : {}).populate("formId").sort("-createdAt").skip(skip).limit(parseInt(limit))
        ]);
        // Fix VendorApplication companyName from data when stored as generic fallback
        const fixedApps = apps.map(a => {
            const appObj = a.toObject();
            if (appObj.companyName === "Dossier Submission" || appObj.companyName === "Incomplete Profile" || appObj.companyName === "Vendor Submission") {
                const dataMap = a.data instanceof Map ? Object.fromEntries(a.data) : (appObj.data || {});
                const realName = dataMap.companyName || dataMap.vendorName || dataMap.co_name || dataMap.fullTradeName || dataMap.company_name || dataMap.legalName || dataMap.legal_name || dataMap.tradeName || dataMap.trade_name || dataMap.supplierName || null;
                if (realName) appObj.companyName = realName;
            }
            return appObj;
        });

        // Harmonize TreeSubmissions to look like applications
        const harmonizedTree = treeSubmissions.map(ts => ({
            ...ts.toObject(),
            _id: ts._id,
            companyName: ts.vendorName || "Vendor Submission",
            email: ts.vendorEmail,
            status: ts.status,
            currentStage: ts.status === 'approved' ? 'COMPLETED' : ts.status === 'rejected' ? 'REJECTED' : 'SUBMITTED',
            isTree: true,
            createdAt: ts.createdAt
        }));

        let applications = [...fixedApps, ...harmonizedTree].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Field Level Security
        const adminPerms = req.user.permissions || [];
        const isSuper = req.user.roleName === "Super Admin" || req.user.role === "admin" || req.user.role === "superadmin";

        if (!adminPerms.includes("APPLICATION_VIEW_TECHNICAL") && !isSuper) {
            applications = applications.map(app => {
                const appObj = app instanceof mongoose.Document ? app.toObject() : app;
                delete appObj.data;
                delete appObj.documents;
                return appObj;
            });
        }

        const total = (await VendorApplication.countDocuments(query)) + (await TreeSubmission.countDocuments(status ? { status } : {}));

        const pagination = {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };

        return successResponse(res, "Unified applications retrieved", applications, 200, pagination);
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const application = await VendorApplication.findById(req.params.id)
            .populate("category formTemplate");

        if (!application) return errorResponse(res, "Application not found", null, 404);

        const appObj = application.toObject();
        const perms = req.user.permissions || [];
        const isSuper = req.user.roleName === "Super Admin" || req.user.role === "admin" || req.user.role === "superadmin";

        // ── Critical fix: convert Map → plain object for frontend ──
        // Mongoose Map serializes differently; toObject() may give {} for Maps
        if (application.data instanceof Map) {
            appObj.data = Object.fromEntries(application.data);
        } else if (appObj.data && typeof appObj.data === "object") {
            // Already a plain object, leave as-is
        }

        // Granular Data Visibility Logic
        if (!isSuper) {
            if (!perms.includes("APPLICATION_VIEW_FINANCIAL")) {
                if (appObj.data) {
                    delete appObj.data.turnover;
                    delete appObj.data.annualRevenue;
                }
            }

            if (!perms.includes("APPLICATION_VIEW_COMPLIANCE")) {
                if (appObj.documents) {
                    appObj.documents = appObj.documents.filter(doc => doc.status !== "verified");
                }
            }
        }

        return successResponse(res, "Application details retrieved", appObj);
    } catch (err) {
        console.error("getApplicationById error:", err);
        return errorResponse(res, err.message, null, 500);
    }
};

exports.createVendorFromApplication = createVendorFromApplication;
