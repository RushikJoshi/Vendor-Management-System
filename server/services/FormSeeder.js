const FormTemplate = require("../models/FormTemplate");
const Category = require("../models/Category");

class FormSeeder {
    static async seedMasterForm() {
        try {
            const masterFormName = "MASTER_VENDOR_FORM";

            // Check if it already exists
            const existingForm = await FormTemplate.findOne({ name: masterFormName });

            if (existingForm) {
                console.log("⚡ MASTER_VENDOR_FORM already exists. Seeding skipped.");
                return;
            }

            const template = await FormTemplate.create({
                name: masterFormName,
                description: "Pre-Configured Enterprise Vendor Registration Form System",
                status: "draft",
                version: 1,
                sections: [
                    {
                        sectionTitle: "SECTION 1: COMPANY INFORMATION",
                        order: 1,
                        fields: [
                            { fieldId: "co_name", label: "Company Name", type: "text", required: true, order: 1 },
                            { fieldId: "co_address", label: "Registered Address", type: "textarea", required: true, order: 2 },
                            { fieldId: "co_comm_address", label: "Communication Address", type: "textarea", required: false, order: 3 },
                            { fieldId: "co_city", label: "City", type: "text", required: false, order: 4 },
                            { fieldId: "co_state", label: "State", type: "text", required: false, order: 5 },
                            { fieldId: "co_pincode", label: "Pincode", type: "number", required: false, order: 6 },
                            { fieldId: "co_country", label: "Country", type: "text", required: false, order: 7 },
                            { fieldId: "co_contact_name", label: "Contact Person Name", type: "text", required: true, order: 8 },
                            { fieldId: "co_designation", label: "Designation", type: "text", required: false, order: 9 },
                            { fieldId: "co_email", label: "Email", type: "email", required: true, order: 10 },
                            { fieldId: "co_mobile", label: "Mobile Number", type: "number", required: true, order: 11 },
                            { fieldId: "co_landline", label: "Landline Number", type: "number", required: false, order: 12 }
                        ]
                    },
                    {
                        sectionTitle: "SECTION 2: BUSINESS DETAILS",
                        order: 2,
                        fields: [
                            { fieldId: "biz_nature", label: "Nature of Business", type: "text", required: false, order: 1 },
                            { fieldId: "biz_type", label: "Type of Organization", type: "dropdown", required: false, options: ["Proprietorship", "Partnership", "Pvt Ltd", "Ltd", "LLP"], order: 2 },
                            { fieldId: "biz_year", label: "Year of Establishment", type: "number", required: false, order: 3 },
                            { fieldId: "biz_employees", label: "Total Employees", type: "number", required: false, order: 4 },
                            { fieldId: "biz_turnover", label: "Annual Turnover", type: "number", required: false, order: 5 }
                        ]
                    },
                    {
                        sectionTitle: "SECTION 3: STATUTORY DETAILS",
                        order: 3,
                        fields: [
                            { fieldId: "stat_gst", label: "GST Number", type: "text", required: false, validation: { regex: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" }, order: 1 },
                            { fieldId: "stat_pan", label: "PAN Number", type: "text", required: false, validation: { regex: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" }, order: 2 },
                            { fieldId: "stat_tan", label: "TAN Number", type: "text", required: false, order: 3 },
                            { fieldId: "stat_msme", label: "MSME Registration", type: "text", required: false, order: 4 },
                            { fieldId: "stat_cin", label: "CIN Number", type: "text", required: false, order: 5 }
                        ]
                    },
                    {
                        sectionTitle: "SECTION 4: BANK DETAILS (NEFT / RTGS)",
                        order: 4,
                        fields: [
                            { fieldId: "bank_name", label: "Bank Name", type: "text", required: true, order: 1 },
                            { fieldId: "bank_branch", label: "Branch Name", type: "text", required: false, order: 2 },
                            { fieldId: "bank_holder", label: "Account Holder Name", type: "text", required: true, order: 3 },
                            { fieldId: "bank_account", label: "Account Number", type: "number", required: true, order: 4 },
                            { fieldId: "bank_ifsc", label: "IFSC Code", type: "text", required: true, order: 5 },
                            { fieldId: "bank_micr", label: "MICR Code", type: "text", required: false, order: 6 },
                            { fieldId: "bank_cheque", label: "Cancelled Cheque Upload", type: "file", required: true, order: 7 }
                        ]
                    },
                    {
                        sectionTitle: "SECTION 5: DOCUMENT UPLOAD",
                        order: 5,
                        fields: [
                            { fieldId: "doc_gst", label: "GST Certificate", type: "file", required: true, order: 1 },
                            { fieldId: "doc_pan", label: "PAN Card Copy", type: "file", required: true, order: 2 },
                            { fieldId: "doc_incorp", label: "Incorporation Certificate", type: "file", required: false, order: 3 },
                            { fieldId: "doc_address", label: "Address Proof", type: "file", required: false, order: 4 },
                            { fieldId: "doc_bank", label: "Bank Proof", type: "file", required: false, order: 5 }
                        ]
                    },
                    {
                        sectionTitle: "SECTION 6: DECLARATION",
                        order: 6,
                        fields: [
                            { fieldId: "decl_confirm", label: "I confirm all provided information is correct.", type: "checkbox", required: true, order: 1 }
                        ]
                    }
                ]
            });
            console.log("✅ MASTER_VENDOR_FORM Seeded Successfully:", template._id);
        } catch (err) {
            console.error("🚨 Seeding Error:", err.message);
        }
    }
}

module.exports = FormSeeder;
