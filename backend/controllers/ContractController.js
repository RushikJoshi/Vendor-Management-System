const Contract = require("../models/Contract");
const AuditService = require("../services/AuditService");
const NotificationService = require("../services/NotificationService");
const { successResponse, errorResponse } = require("../utils/responseHandler");

exports.getContractStats = async (req, res) => {
    try {
        const total = await Contract.countDocuments();
        const active = await Contract.countDocuments({ status: "active" });
        const expired = await Contract.countDocuments({ status: "expired" });

        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

        const expiringSoon = await Contract.countDocuments({
            status: "active",
            endDate: { $lte: thirtyDaysLater, $gt: new Date() }
        });

        return successResponse(res, "Contract statistics retrieved", {
            total,
            active,
            expired,
            expiringSoon
        });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

exports.getContracts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (status && status !== 'All') {
            if (status === 'Expiring') {
                const thirtyDaysLater = new Date();
                thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
                query.status = 'active';
                query.endDate = { $lte: thirtyDaysLater, $gt: new Date() };
            } else {
                query.status = status.toLowerCase();
            }
        }

        if (search) {
            query.$or = [
                { contractNumber: { $regex: search, $options: "i" } },
                { contractTitle: { $regex: search, $options: "i" } }
            ];
        }

        const contracts = await Contract.find(query)
            .populate("vendorId", "companyName email")
            .sort("-createdAt")
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Contract.countDocuments(query);

        return successResponse(res, "Contracts retrieved", contracts, 200, {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        return errorResponse(res, err.message);
    }
};

exports.createContract = async (req, res) => {
    try {
        const { vendorId, contractNumber, contractTitle, startDate, endDate, contractValue, documentUrl } = req.body;

        const contract = await Contract.create({
            vendorId,
            contractNumber,
            contractTitle,
            startDate,
            endDate,
            contractValue,
            documentUrl,
            createdBy: req.user.id
        });

        await AuditService.logCreate(req, "Contract", contract);

        await NotificationService.notify({
            userId: vendorId,
            title: "New Contract Awarded",
            message: `A new contract "${contractTitle}" has been uploaded to your profile.`,
            type: "contract",
            relatedEntityId: contract._id
        });


        res.status(201).json({ success: true, data: contract });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getVendorContracts = async (req, res) => {
    try {
        const contracts = await Contract.find({ vendorId: req.params.vendorId }).sort("-createdAt");
        res.json({ success: true, data: contracts });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.terminateContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) throw new Error("Contract not found");

        const beforeData = { status: contract.status };
        contract.status = "terminated";
        await contract.save();

        await AuditService.log({
            req,
            actionType: "CONTRACT_TERMINATED",
            entityType: "Contract",
            entityId: contract._id,
            beforeData,
            afterData: { status: "terminated" }
        });

        res.json({ success: true, message: "Contract terminated successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

        const beforeData = contract.toObject();

        // Update fields
        ['contractTitle', 'startDate', 'endDate', 'contractValue', 'status', 'documentUrl'].forEach(field => {
            if (req.body[field] !== undefined) {
                contract[field] = req.body[field];
            }
        });

        // Reset renewal sent if extended
        if (contract.endDate > beforeData.endDate) {
            contract.renewalReminderSent = false;
        }

        await contract.save();

        await AuditService.logUpdate(req, "Contract", contract._id, beforeData, contract.toObject());

        res.json({ success: true, message: "Contract updated successfully", data: contract });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

        await Contract.findByIdAndDelete(req.params.id);

        await AuditService.log({
            req,
            actionType: "CONTRACT_DELETED",
            entityType: "Contract",
            entityId: contract._id,
            beforeData: contract.toObject(),
            afterData: null
        });

        res.json({ success: true, message: "Contract deleted permanently" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
