const ProcurementSettings = require("../models/ProcurementSettings");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const MAX_HISTORY_ITEMS = 20;
const ALLOWED_TYPES = ["PO", "SO"];

const DEFAULT_DOC_CONFIG = {
    companyName: "Global Tech",
    companyAddress: "HQ Address",
    gstNumber: "GSTIN-PENDING",
    poTerms: ["Term 1", "Term 2"],
    soTerms: ["Service Term 1"],
    themeColor: "#1e3a8a",
    secondaryColor: "#64748b",
    fontFamily: "Inter",
    headerHeight: 80,
    logoSize: 48,
    layoutPositions: {},
    authorizedSignatory: { name: "Authorized Desk", designation: "Procurement Manager" }
};

const normalizeType = (type) => (ALLOWED_TYPES.includes(type) ? type : "PO");

const clonePlain = (value) => JSON.parse(JSON.stringify(value ?? {}));

const areConfigsEqual = (first, second) => JSON.stringify(buildConfig(first)) === JSON.stringify(buildConfig(second));

const buildConfig = (raw = {}) => {
    const normalized = clonePlain(raw);
    delete normalized.type;

    return {
        ...clonePlain(DEFAULT_DOC_CONFIG),
        ...normalized,
        layoutPositions: clonePlain(normalized.layoutPositions || {}),
        authorizedSignatory: {
            ...clonePlain(DEFAULT_DOC_CONFIG.authorizedSignatory),
            ...clonePlain(normalized.authorizedSignatory || {})
        }
    };
};

const getUserLabel = (user) => user?.name || user?.fullName || user?.email || "System";

const trimHistory = (doc) => {
    doc.versionHistory = (doc.versionHistory || []).slice(0, MAX_HISTORY_ITEMS);
};

const pushHistoryEntry = (doc, entry) => {
    const nextEntry = {
        type: normalizeType(entry.type),
        action: entry.action || "Published Version",
        userLabel: entry.userLabel || "System",
        snapshot: buildConfig(entry.snapshot),
        createdAt: entry.createdAt || new Date()
    };

    doc.versionHistory = [nextEntry, ...(doc.versionHistory || [])];
    trimHistory(doc);
};

const getOrCreateSettingsDoc = async (tenantId) => {
    let doc = await ProcurementSettings.findOne({ tenantId });

    if (!doc) {
        doc = await ProcurementSettings.create({
            tenantId,
            PO: buildConfig(DEFAULT_DOC_CONFIG),
            SO: buildConfig(DEFAULT_DOC_CONFIG),
            versionHistory: []
        });
    }

    return doc;
};

exports.getSettings = asyncHandler(async (req, res) => {
    const type = normalizeType(req.query.type || "PO");
    const doc = await getOrCreateSettingsDoc(req.user.tenantId);
    const data = {
        ...buildConfig(doc[type] || DEFAULT_DOC_CONFIG),
        applicationPrefix: doc.applicationPrefix,
        applicationStartNumber: doc.applicationStartNumber,
        vendorPrefix: doc.vendorPrefix,
        vendorStartNumber: doc.vendorStartNumber,
        poPrefix: doc.poPrefix,
        poStartNumber: doc.poStartNumber,
        poSuffix: doc.poSuffix,
        soPrefix: doc.soPrefix,
        soStartNumber: doc.soStartNumber,
        soSuffix: doc.soSuffix
    };

    res.status(200).json({ success: true, data });
});

exports.updateSettings = asyncHandler(async (req, res) => {
    const type = normalizeType(req.body.type || "PO");
    const nextConfig = buildConfig(req.body);
    const doc = await getOrCreateSettingsDoc(req.user.tenantId);
    const currentConfig = buildConfig(doc[type] || DEFAULT_DOC_CONFIG);

    if (!areConfigsEqual(currentConfig, nextConfig)) {
        pushHistoryEntry(doc, {
            type,
            action: "Previous Template Backup",
            userLabel: getUserLabel(req.user),
            snapshot: currentConfig
        });
    }

    // Update Global Numbering System if present
    const sequenceFields = [
        'applicationPrefix', 'applicationStartNumber',
        'vendorPrefix', 'vendorStartNumber',
        'poPrefix', 'poStartNumber', 'poSuffix',
        'soPrefix', 'soStartNumber', 'soSuffix'
    ];

    sequenceFields.forEach(field => {
        if (req.body[field] !== undefined) {
            // If the start number is changing, we should potentially reset the next tracker
            // but only if it hasn't been used or if the user explicitly wants to reset.
            // For now, let's just update the field.
            doc[field] = req.body[field];

            // If user manually changed startNumber, update the next tracker to match
            if (field.includes('StartNumber')) {
                const nextField = `next${field.replace('StartNumber', '')}Number`;
                // Only update if current next is missing or lower than new start
                if (!doc[nextField] || doc[nextField] < req.body[field]) {
                    doc[nextField] = req.body[field];
                }
            }
        }
    });

    doc.set(type, nextConfig);
    doc.updatedBy = req.user._id;
    await doc.save();

    res.status(200).json({ success: true, data: buildConfig(doc[type]) });
});

exports.getHistory = asyncHandler(async (req, res) => {
    const doc = await getOrCreateSettingsDoc(req.user.tenantId);
    const history = (doc.versionHistory || []).map((entry) => ({
        id: entry._id,
        type: entry.type,
        action: entry.action,
        user: entry.userLabel || "System",
        createdAt: entry.createdAt,
        companyName: entry.snapshot?.companyName || "Untitled Template",
        themeColor: entry.snapshot?.themeColor || DEFAULT_DOC_CONFIG.themeColor,
        snapshot: buildConfig(entry.snapshot)
    }));

    res.status(200).json({ success: true, data: history });
});

exports.restoreHistoryVersion = asyncHandler(async (req, res) => {
    const doc = await getOrCreateSettingsDoc(req.user.tenantId);
    const historyEntry = doc.versionHistory.id(req.params.historyId);

    if (!historyEntry) {
        throw new AppError("Requested template history was not found.", 404);
    }

    const type = normalizeType(historyEntry.type);
    const currentConfig = buildConfig(doc[type] || DEFAULT_DOC_CONFIG);
    const targetConfig = buildConfig(historyEntry.snapshot);

    if (areConfigsEqual(currentConfig, targetConfig)) {
        return res.status(200).json({
            success: true,
            data: {
                type,
                restored: false,
                settings: currentConfig
            }
        });
    }

    pushHistoryEntry(doc, {
        type,
        action: "Backup Before Restore",
        userLabel: getUserLabel(req.user),
        snapshot: currentConfig
    });

    doc.set(type, targetConfig);
    doc.updatedBy = req.user._id;
    await doc.save();

    res.status(200).json({
        success: true,
        data: {
            type,
            restored: true,
            settings: buildConfig(doc[type])
        }
    });
});
