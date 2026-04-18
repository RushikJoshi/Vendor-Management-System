const ProcurementSettings = require("../models/ProcurementSettings");

class SequenceService {
    /**
     * Generates a unique sequence number for a given entity type and tenant.
     * @param {string} tenantId 
     * @param {'application' | 'vendor' | 'po' | 'so'} type 
     * @returns {Promise<string>}
     */
    static async getNextSequence(tenantId, type) {
        // Find existing settings
        let settings = await ProcurementSettings.findOne({ tenantId });

        // If no settings exist, create with defaults
        if (!settings) {
            settings = await ProcurementSettings.create({
                tenantId,
                PO: {},
                SO: {},
                versionHistory: []
            });
        }

        let prefix = "";
        let suffix = "";
        let nextNum = 0;
        let dbField = "";

        switch (type.toLowerCase()) {
            case "application":
                prefix = settings.applicationPrefix || "APP";
                nextNum = settings.nextApplicationNumber || settings.applicationStartNumber || 1001;
                dbField = "nextApplicationNumber";
                break;
            case "vendor":
                prefix = settings.vendorPrefix || "VND";
                nextNum = settings.nextVendorNumber || settings.vendorStartNumber || 2001;
                dbField = "nextVendorNumber";
                break;
            case "po":
                prefix = settings.poPrefix || "PO";
                suffix = settings.poSuffix || "";
                nextNum = settings.nextPONumber || settings.poStartNumber || 1;
                dbField = "nextPONumber";
                break;
            case "so":
                prefix = settings.soPrefix || "SO";
                suffix = settings.soSuffix || "";
                nextNum = settings.nextSONumber || settings.soStartNumber || 1;
                dbField = "nextSONumber";
                break;
            default:
                throw new Error("Invalid sequence type requested: " + type);
        }

        // Generate the formatted ID
        const generatedId = `${prefix}${nextNum}${suffix}`;

        // Increment and save for next time
        settings[dbField] = nextNum + 1;
        await settings.save();

        return generatedId;
    }
}

module.exports = SequenceService;
