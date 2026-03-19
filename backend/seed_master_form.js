require('dotenv').config();
const mongoose = require('mongoose');
const FormTemplate = require('./models/FormTemplate');
const Category = require('./models/Category');

const MASTER_TEMPLATE = {
    title: "MASTER VENDOR REGISTRATION PLATFORM (ENTERPRISE)",
    isPublished: true,
    sections: [
        {
            title: "Section 1: Company Information",
            fields: [
                { label: "Company Name", name: "companyName", type: "text", required: true, order: 1 },
                { label: "Website", name: "website", type: "text", required: false, order: 2, placeholder: "https://" },
                { label: "Year of Establishment", name: "establishmentYear", type: "number", required: true, order: 3 },
                { label: "Nature of Business", name: "natureOfBusiness", type: "dropdown", required: true, options: ["Manufacturer", "Service Provider", "Dealer", "Contractor", "Consultant"], order: 4 },
                { label: "Number of Employees", name: "employeeCount", type: "number", required: false, order: 5 },
                { label: "Registered Address", name: "address", type: "text", required: true, order: 6 }
            ]
        },
        {
            title: "Section 2: Contact Details",
            fields: [
                { label: "Contact Person Name", name: "contactName", type: "text", required: true, order: 1 },
                { label: "Designation", name: "designation", type: "text", required: true, order: 2 },
                { label: "Mobile Number", name: "mobileNumber", type: "text", required: true, order: 3 },
                { label: "Email ID", name: "email", type: "text", required: true, order: 4 },
                { label: "Alternate Contact", name: "altMobile", type: "text", required: false, order: 5 }
            ]
        },
        {
            title: "Section 3: Statutory Details",
            fields: [
                { label: "PAN Number", name: "panNum", type: "text", required: true, order: 1, placeholder: "ABCDE1234F" },
                { label: "GST Number", name: "gstNum", type: "text", required: true, order: 2, placeholder: "22AAAAA0000A1Z5" },
                { label: "Business Registration Type", name: "regType", type: "dropdown", required: true, options: ["Private Limited", "Partnership", "Sole Proprietorship", "Public Limited", "Other"], order: 3 },
                { label: "MSME Registration Number", name: "msmeNum", type: "text", required: false, order: 4 },
                { label: "MSME Category", name: "msmeCat", type: "dropdown", required: false, options: ["Micro", "Small", "Medium", "Non-MSME"], order: 5 }
            ]
        },
        {
            title: "Section 4: Bank Details (NEFT/RTGS)",
            fields: [
                { label: "Beneficiary Name", name: "beneficiaryName", type: "text", required: true, order: 1 },
                { label: "Bank Name", name: "bankName", type: "text", required: true, order: 2 },
                { label: "Branch Name", name: "bankBranch", type: "text", required: true, order: 3 },
                { label: "Account Number", name: "accountNumber", type: "text", required: true, order: 4 },
                { label: "Account Type", name: "accountType", type: "dropdown", required: true, options: ["Savings", "Current", "Cash Credit", "Overdraft"], order: 5 },
                { label: "IFSC Code", name: "ifscCode", type: "text", required: true, order: 6, placeholder: "SBIN0001234" },
                { label: "MICR Code", name: "micrCode", type: "text", required: false, order: 7 }
            ]
        },
        {
            title: "Section 5: Tax Information",
            fields: [
                { label: "Income Tax Return (Last 3 Years)", name: "itrStatus", type: "dropdown", required: true, options: ["Filed", "Not Filed", "Not Applicable"], order: 1 },
                { label: "Tax Residency Certificate (if applicable)", name: "trcStatus", type: "text", required: false, order: 2 },
                { label: "VAT Number (if applicable)", name: "vatNum", type: "text", required: false, order: 3 }
            ]
        },
        {
            title: "Section 6: Compliance Declarations",
            fields: [
                { label: "Compliance with Anti-Bribery Policy", name: "antiBribery", type: "checkbox", required: true, order: 1 },
                { label: "No Conflict of Interest", name: "noConflict", type: "checkbox", required: true, order: 2 },
                { label: "Data Privacy Agreement", name: "dataPrivacy", type: "checkbox", required: true, order: 3 }
            ]
        },
        {
            title: "Section 7: Document Upload",
            fields: [
                { label: "PAN Card Copy", name: "doc_pan", type: "file", required: true, order: 1 },
                { label: "GST Registration Copy", name: "doc_gst", type: "file", required: true, order: 2 },
                { label: "Cancelled Cheque", name: "doc_cheque", type: "file", required: true, order: 3 },
                { label: "Incorporation Certificate", name: "doc_incorp", type: "file", required: true, order: 4 },
                { label: "MSME Certificate", name: "doc_msme", type: "file", required: false, order: 5 }
            ]
        }
    ]
};

async function seedMasterForm() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Remove old master templates
        await FormTemplate.deleteMany({ title: MASTER_TEMPLATE.title });

        const template = await FormTemplate.create(MASTER_TEMPLATE);
        console.log("Master Form Template Seeded Successfully:", template._id);

        // Create or Update Enterprise Category
        const catData = {
            name: "Enterprise Infrastructure Partner",
            code: "INFRA-ENT",
            description: "High-value partner ecosystem with full statutory and bank verification.",
            formTemplate: template._id,
            criteria: {
                minimumTurnover: 10000000,
                preferredTurnover: 50000000,
                minimumExperienceYears: 5,
                riskThresholdLow: 85,
                riskThresholdMedium: 60
            }
        };

        await Category.findOneAndUpdate({ code: "INFRA-ENT" }, catData, { upsert: true, new: true });
        console.log("Enterprise Category Synchronized.");

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedMasterForm();
