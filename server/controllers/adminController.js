const AdminService = require("../services/AdminService");
const { successResponse, errorResponse } = require("../utils/responseHandler");
const Message = require("../models/Message");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");
const Role = require("../models/Role");
const AuditService = require("../services/AuditService");
const ExcelService = require("../services/ExcelService");
const { sendEmail } = require("../utils/emailService");

/**
 * @desc Export Vendors to Excel
 * @route GET /api/v1/admin/vendors/export
 */
exports.exportVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("category");
    const flattened = vendors.map(v => ExcelService.flattenVendor(v));

    const buffer = ExcelService.exportToBuffer(flattened);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Vendor_Registry_Export.xlsx');

    return res.send(buffer);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Import Vendors from Excel
 * @route POST /api/v1/admin/vendors/import
 */
exports.importVendors = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) throw new Error("No file uploaded");

    const file = req.files[0];
    const data = ExcelService.parseExcel(file.path);

    let successCount = 0;
    let errors = [];

    for (const row of data) {
      try {
        const vendorData = ExcelService.mapRowToVendor(row);
        await Vendor.create(vendorData);
        successCount++;
      } catch (err) {
        errors.push(`Row ${data.indexOf(row) + 2}: ${err.message}`);
      }
    }

    return successResponse(res, `Import complete: ${successCount} successful, ${errors.length} failed.`, {
      successCount,
      failureCount: errors.length,
      errors: errors.slice(0, 50) // Limit error display
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Get Admin Dashboard Statistics
 * @route GET /api/v1/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await AdminService.getDashboardStats();
    return successResponse(res, "Dashboard statistics retrieved", stats);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Get Messages for Admin
 * @route GET /api/v1/admin/messages
 */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ receiverModel: "Admin" }, { senderModel: "Admin" }],
    })
      .populate("sender", "companyName email")
      .sort("-createdAt");

    return successResponse(res, "Messages retrieved", messages);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc List Vendors with Pagination
 * @route GET /api/v1/admin/vendors
 */
exports.getVendors = async (req, res) => {
  try {
    const result = await AdminService.getVendors(req.query);
    return successResponse(res, "Vendors retrieved", result.vendors, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Update Vendor Status
 * @route PATCH /api/v1/admin/vendors/:id/status
 */
exports.updateVendorStatus = async (req, res) => {
  try {
    const vendor = await AdminService.updateVendorStatus(req.params.id, req.body, req);
    return successResponse(res, "Vendor status updated", vendor);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Delete Vendor
 * @route DELETE /api/v1/admin/vendors/:id
 */
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return errorResponse(res, "Vendor not found", null, 404);

    const beforeData = vendor.toObject();
    await Vendor.findByIdAndDelete(req.params.id);

    await AuditService.log({
      req,
      actionType: "RECORD_DELETED",
      entityType: "Vendor",
      entityId: vendor._id,
      beforeData
    });

    return successResponse(res, "Vendor deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Get Audit Logs
 * @route GET /api/v1/admin/audit-logs
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const result = await AdminService.getAuditLogs(req.query);
    return successResponse(res, "Audit logs retrieved", result.logs, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

/**
 * @desc Send Inquiry to Vendor
 * @route POST /api/v1/admin/inquiry
 */
exports.sendInquiry = async (req, res) => {
  try {
    const { vendorId, subject, message } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return errorResponse(res, "Vendor not found", null, 404);

    await sendEmail({
      to: vendor.email,
      subject: `VMS INQUIRY: ${subject}`,
      text: message,
    });

    return successResponse(res, "Inquiry sent to vendor");
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
