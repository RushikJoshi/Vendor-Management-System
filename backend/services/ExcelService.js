const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelService {
    /**
     * Export a list of objects to an Excel Buffer
     * @param {Array} data - Array of objects to export
     * @param {String} sheetName - Name of the sheet
     */
    static exportToBuffer(data, sheetName = "Vendors") {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }

    /**
     * Parse an Excel file from a buffer or file path
     * @param {Buffer|String} input - Buffer or path to Excel file
     */
    static parseExcel(input) {
        let workbook;
        if (Buffer.isBuffer(input)) {
            workbook = XLSX.read(input, { type: 'buffer' });
        } else {
            workbook = XLSX.readFile(input);
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        return data;
    }

    /**
     * Flatten nested vendor data for Excel export
     * @param {Object} vendor - Vendor object from DB
     */
    static flattenVendor(vendor) {
        const v = vendor.toObject ? vendor.toObject() : vendor;
        return {
            'Company Name': v.companyName,
            'Email': v.email,
            'Contact Person': v.contactPerson,
            'Phone': v.phone,
            'Address': v.address,
            'Service Type': v.serviceType,
            'Status': v.status,
            'Risk Level': v.riskLevel || 'Low',
            'Overall Risk Score': v.overallRiskScore || 0,
            'Created At': v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'
        };
    }

    /**
     * Map Excel Row to Vendor Schema (Pre-validation)
     */
    static mapRowToVendor(row) {
        return {
            companyName: row['Company Name'],
            email: row['Email'],
            contactPerson: row['Contact Person'],
            phone: row['Phone'] || row['Mobile'] || '',
            address: row['Address'] || '',
            serviceType: row['Service Type'] || 'General',
            status: 'approved', // Bulk imports usually approved
            password: 'Vendor@123' // Default password for imported vendors
        };
    }
}

module.exports = ExcelService;
