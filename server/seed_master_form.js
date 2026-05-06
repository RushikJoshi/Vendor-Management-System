require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const FormTemplate = require('./models/FormTemplate');
const Category = require('./models/Category');

async function seedMasterForm() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 Connected to MongoDB");

        // 1. Cleanup
        await Category.deleteMany({ $or: [{ code: "STRAT-PARTNER" }, { name: "Enterprise Strategic Partner" }] });
        
        // 2. Ensure Category exists
        const category = await Category.create({
            name: "Enterprise Strategic Partner",
            code: "STRAT-PARTNER",
            description: "High-density supplier registration matching Global Ariba standards.",
            status: "active",
            criteria: {
                minimumTurnover: 0,
                minimumExperienceYears: 0
            }
        });

        // Helper to generate Equipment fields
        const genEquipFields = (prefix) => [
            { label: "Count", fieldId: `${prefix}_count`, type: "number", order: 1 },
            { label: "Hired", fieldId: `${prefix}_hired`, type: "number", order: 2 },
            { label: "Purchased", fieldId: `${prefix}_purchased`, type: "number", order: 3 },
            { label: "Capacity", fieldId: `${prefix}_capacity`, type: "text", order: 4 },
            { label: "Year of Purchase", fieldId: `${prefix}_year`, type: "text", order: 5 }
        ];

        // 3. Define the Template
        const MASTER_TEMPLATE_DATA = {
            name: "Supplier Self-Registration Request Form",
            description: "Full Global Ariba Standard Supplier Registration Form",
            categoryId: category._id,
            status: "published",
            version: 1,
            sections: [
                {
                    sectionTitle: "1.1.1.1 Company Basic Details",
                    order: 1,
                    fields: [
                        { label: "Title", fieldId: "title", type: "dropdown", required: true, options: ["Mr", "Ms", "Mrs", "Dr", "M/s"], order: 1 },
                        { label: "Supplier Full Trade Name (As per GST Registration)", fieldId: "fullTradeName", type: "text", required: true, order: 2 },
                        { label: "Supplier Full Trade Name (Remaining if > 35 Characters)", fieldId: "fullTradeNameExtra", type: "text", required: false, order: 3 },
                        { label: "Vendor Category", fieldId: "vendorCategory", type: "dropdown", required: true, options: ["Propriety", "Partnership", "Private Limited", "Public Limited", "Individual", "Others"], order: 4 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.2.1 Primary Contact Details - Supplier",
                    order: 2,
                    fields: [
                        { label: "Name of Authorized Person First Name", fieldId: "authFirstName", type: "text", required: true, order: 1 },
                        { label: "Name of Authorized Person Last Name", fieldId: "authLastName", type: "text", required: true, order: 2 },
                        { label: "Mobile No. of Authorized Person", fieldId: "authMobile", type: "text", required: true, order: 3 },
                        { label: "Email ID of Authorized Person", fieldId: "email", type: "text", required: true, order: 4 },
                        { label: "Mobile No. of Supplier Contact Person", fieldId: "contactPersonMobile", type: "text", required: false, order: 5 },
                        { label: "Email ID of Supplier Contact Person", fieldId: "contactPersonEmail", type: "text", required: false, order: 6 },
                        { label: "Other Mobile No.", fieldId: "otherMobile", type: "text", required: false, order: 7 },
                        { label: "Other Email ID", fieldId: "otherEmail", type: "text", required: false, order: 8 },
                        { label: "Designation of Contact Person", fieldId: "designation", type: "text", required: true, order: 9 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.2.1.10 Contact Details - Buyer (HGEIL) Coordinator",
                    order: 3,
                    fields: [
                        { label: "Name of the (HGEIL) Buyer", fieldId: "buyerName", type: "text", required: true, order: 1 },
                        { label: "Mobile No. of the (HGEIL) Buyer", fieldId: "buyerMobile", type: "text", required: true, order: 2 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.2.2 Address Details (Billing Address)",
                    order: 4,
                    fields: [
                        { label: "Address Domestic / International (Billing Address)", fieldId: "addressType", type: "dropdown", required: true, options: ["Domestic", "International"], order: 1 },
                        { label: "Street", fieldId: "street", type: "text", required: true, order: 2 },
                        { label: "House Number", fieldId: "houseNumber", type: "text", required: false, order: 3 },
                        { label: "Street 2", fieldId: "street2", type: "text", required: false, order: 4 },
                        { label: "Street 3", fieldId: "street3", type: "text", required: false, order: 5 },
                        { label: "Postal Code", fieldId: "pincode", type: "text", required: true, order: 6 },
                        { label: "District", fieldId: "district", type: "text", required: false, order: 7 },
                        { label: "City", fieldId: "city", type: "text", required: true, order: 8 },
                        { label: "Country/Region", fieldId: "country", type: "text", required: true, order: 9 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.2.3 Other Details",
                    order: 5,
                    fields: [
                        { label: "Category", fieldId: "serviceCategory", type: "text", required: true, order: 1, placeholder: "Select Category" },
                        { label: "Sub Category", fieldId: "subCategory", type: "text", required: true, order: 2, placeholder: "Select Sub Category" },
                        { label: "Region", fieldId: "region", type: "text", required: false, order: 3 },
                        { label: "Department", fieldId: "department", type: "text", required: false, order: 4 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.3 Statutory Compliances - Domestic Vendors",
                    order: 6,
                    fields: [
                        { label: "GST Registration Status", fieldId: "gstStatus", type: "dropdown", required: true, options: ["Registered", "Unregistered", "Composition Scheme", "Export/SEZ"], order: 1 },
                        { label: "GST Number", fieldId: "gstNum", type: "text", required: true, order: 2 },
                        { label: "PAN Status", fieldId: "panStatus", type: "dropdown", required: true, options: ["Available", "Not Available"], order: 3 },
                        { label: "PAN Number", fieldId: "panNum", type: "text", required: true, order: 4, dependsOn: "panStatus", dependsOnValue: "Available" },
                        { label: "PF Status", fieldId: "pfStatus", type: "dropdown", required: true, options: ["Yes", "No"], order: 5 },
                        { label: "PF No.", fieldId: "pfNo", type: "text", required: true, order: 6, dependsOn: "pfStatus", dependsOnValue: "Yes" },
                        { label: "ESI Status", fieldId: "esiStatus", type: "dropdown", required: true, options: ["Yes", "No"], order: 7 },
                        { label: "ESI No.", fieldId: "esiNo", type: "text", required: true, order: 8, dependsOn: "esiStatus", dependsOnValue: "Yes" },
                        { label: "Is E-Invoice applicable to you?", fieldId: "eInvoiceApplicable", type: "dropdown", required: true, options: ["Yes", "No"], order: 9 },
                        { label: "LY1 Turnover (Indian Rupee)", fieldId: "ly1Turnover", type: "number", required: true, order: 10 },
                        { label: "LY2 Turnover (Indian Rupee)", fieldId: "ly2Turnover", type: "number", required: true, order: 11 },
                        { label: "LY3 Turnover (Indian Rupee)", fieldId: "ly3Turnover", type: "number", required: true, order: 12 },
                        { label: "LY4 Turnover (Indian Rupee)", fieldId: "ly4Turnover", type: "number", required: true, order: 13 },
                        { label: "LY5 Turnover (Indian Rupee)", fieldId: "ly5Turnover", type: "number", required: true, order: 14 },
                        { label: "LY6 Turnover (Indian Rupee)", fieldId: "ly6Turnover", type: "number", required: true, order: 15 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.4 Financial & Bank Details",
                    order: 7,
                    fields: [
                        { label: "How many bank details you want to Input", fieldId: "bankCount", type: "dropdown", required: true, options: ["One", "Two", "Three"], order: 1 },
                        { label: "Account Type", fieldId: "accountType", type: "dropdown", required: true, options: ["Savings", "Current", "OD", "CC"], order: 2 },
                        { label: "Bank Name", fieldId: "bankName", type: "text", required: true, order: 3 },
                        { label: "Bank Branch", fieldId: "bankBranch", type: "text", required: true, order: 4 },
                        { label: "Bank Street", fieldId: "bankStreet", type: "text", required: true, order: 5 },
                        { label: "Bank City", fieldId: "bankCity", type: "text", required: true, order: 6 },
                        { label: "Bank Account Number", fieldId: "accountNumber", type: "text", required: true, order: 7 },
                        { label: "Bank Key (IFSC Code)", fieldId: "ifscCode", type: "text", required: true, order: 8 },
                        { label: "Account Holder Name", fieldId: "accountHolderName", type: "text", required: true, order: 9 }
                    ]
                },
                // --- NEW 1.1.2 ADDITIONAL DETAILS START ---
                {
                    sectionTitle: "1.1.2.1 Do You want to fill Additional Details",
                    order: 8,
                    fields: [
                        { label: "Consent to Fill Additional Details", fieldId: "fillAdditional", type: "dropdown", required: true, options: ["Yes", "No"], order: 1 }
                    ]
                },
                {
                    sectionTitle: "1.1.2.2.1 Experience & References",
                    order: 9,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: [
                        { label: "Years of Experience in this Business", fieldId: "expYears", type: "number", order: 1 },
                        { label: "How Many Companies delivered goods/services?", fieldId: "deliveryCount", type: "number", order: 2 },
                        { label: "Company Details Information", fieldId: "clientList", type: "textarea", order: 3 },
                        { label: "References", fieldId: "references", type: "textarea", order: 4 },
                        { label: "Achievements and Recognition", fieldId: "achievements", type: "textarea", order: 5 },
                        { label: "Latest Financial Statements (Balance Sheet/P&L/ITR)", fieldId: "finDocuments", type: "file", order: 6 }
                    ]
                },
                {
                    sectionTitle: "1.1.2.2.6.1 Equipment - Plant Operation",
                    order: 10,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("plant")
                },
                {
                    sectionTitle: "1.1.2.2.6.2 Equipment - Laying Equipment",
                    order: 11,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("laying")
                },
                {
                    sectionTitle: "1.1.2.2.6.3 Equipment - Transportation",
                    order: 12,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("trans")
                },
                {
                    sectionTitle: "1.1.2.2.6.4 Equipment - Misc. (Hydra, JCB, Crane, etc.)",
                    order: 13,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("miscEquip")
                },
                {
                    sectionTitle: "1.1.2.2.6.5 Equipment - Excavation / Earthwork",
                    order: 14,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("excavation")
                },
                {
                    sectionTitle: "1.1.2.2.6.6 Equipment - Crusher",
                    order: 15,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("crusher")
                },
                {
                    sectionTitle: "1.1.2.2.6.7 Equipment - LMVs",
                    order: 16,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: genEquipFields("lmv")
                },
                {
                    sectionTitle: "1.1.2.2.7 Manpower Count",
                    order: 17,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: [
                        { label: "Office Staff - Managerial", fieldId: "staffManagerial", type: "number", order: 1 },
                        { label: "Office Staff - Supervisory", fieldId: "staffSupervisory", type: "number", order: 2 },
                        { label: "Office Staff - Technical", fieldId: "staffTechnical", type: "number", order: 3 },
                        { label: "Office Staff - Non-Technical", fieldId: "staffNonTech", type: "number", order: 4 },
                        { label: "Labour Skilled", fieldId: "labourSkilled", type: "number", order: 5 },
                        { label: "Labour Semi-Skilled", fieldId: "labourSemiSkilled", type: "number", order: 6 }
                    ]
                },
                {
                    sectionTitle: "1.1.2.2.8 Quality & Certification",
                    order: 18,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: [
                        { label: "Lab Equipment Name", fieldId: "labEquipName", type: "text", order: 1 },
                        { label: "Lab Issuing Authority", fieldId: "labAuth", type: "text", order: 2 },
                        { label: "Lab Purchase/Achievement Year", fieldId: "labYear", type: "text", order: 3 },
                        { label: "Certification Name", fieldId: "certName", type: "text", order: 4 },
                        { label: "Certification Issuing Authority", fieldId: "certAuth", type: "text", order: 5 },
                        { label: "Certification Year", fieldId: "certYear", type: "text", order: 6 }
                    ]
                },
                {
                    sectionTitle: "1.1.2.2.9 Key Supplier List",
                    order: 19,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: [
                        { label: "Supplier 1 Name", fieldId: "sup1Name", type: "text", order: 1 },
                        { label: "Supplier 1 Material", fieldId: "sup1Mat", type: "text", order: 2 },
                        { label: "Supplier 1 Quantity", fieldId: "sup1Qty", type: "text", order: 3 },
                        { label: "Supplier 2 Name", fieldId: "sup2Name", type: "text", order: 4 },
                        { label: "Supplier 2 Material", fieldId: "sup2Mat", type: "text", order: 5 },
                        { label: "Supplier 2 Quantity", fieldId: "sup2Qty", type: "text", order: 6 }
                    ]
                },
                {
                    sectionTitle: "1.1.2.2.10 Export Details",
                    order: 20,
                    dependsOn: "fillAdditional",
                    dependsOnValue: "Yes",
                    fields: [
                        { label: "Product 1", fieldId: "export1Prod", type: "text", order: 1 },
                        { label: "Country 1", fieldId: "export1Country", type: "text", order: 2 },
                        { label: "Value 1", fieldId: "export1Value", type: "text", order: 3 },
                        { label: "Product 2", fieldId: "export2Prod", type: "text", order: 4 },
                        { label: "Country 2", fieldId: "export2Country", type: "text", order: 5 },
                        { label: "Value 2", fieldId: "export2Value", type: "text", order: 6 },
                        { label: "Product 3", fieldId: "export3Prod", type: "text", order: 7 },
                        { label: "Country 3", fieldId: "export3Country", type: "text", order: 8 },
                        { label: "Value 3", fieldId: "export3Value", type: "text", order: 9 }
                    ]
                }
            ]
        };

        // 4. Delete old master templates
        await FormTemplate.deleteMany({ name: MASTER_TEMPLATE_DATA.name });

        // 5. Create new template
        const template = await FormTemplate.create(MASTER_TEMPLATE_DATA);
        console.log("✅ Master Form Template Seeded Successfully:", template._id);

        // 6. Link to category
        category.formTemplate = template._id;
        category.hasPublishedForm = true;
        await category.save();
        console.log("🔗 Category linked and published.");

    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database disconnected.");
        process.exit();
    }
}

seedMasterForm();
