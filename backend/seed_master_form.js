require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const FormTemplate = require('./models/FormTemplate');
const Category = require('./models/Category');

async function seedMasterForm() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

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

        // 3. Define the Template with Conditional Logic
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
                        { label: "District", fieldId: "district", type: "text", required: false, order: 6 },
                        { label: "Postal Code", fieldId: "pincode", type: "text", required: true, order: 7 },
                        { label: "City", fieldId: "city", type: "text", required: true, order: 8 },
                        { label: "Country/Region", fieldId: "country", type: "text", required: true, order: 9 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.2.3 Other Details",
                    order: 5,
                    fields: [
                        { label: "Category", fieldId: "serviceCategory", type: "text", required: true, order: 1, placeholder: "Search Category (e.g., CIVIL BULK > ROAD UTILITY)" },
                        { label: "Region", fieldId: "region", type: "text", required: false, order: 2 },
                        { label: "Department", fieldId: "department", type: "text", required: false, order: 3 }
                    ]
                },
                {
                    sectionTitle: "1.1.1.3 Statutory Compliances - Domestic Vendors",
                    order: 6,
                    fields: [
                        { label: "PAN Status", fieldId: "panStatus", type: "dropdown", required: true, options: ["Available", "Not Available"], order: 1 },
                        { label: "PAN Number", fieldId: "panNum", type: "text", required: true, order: 2, dependsOn: "panStatus", dependsOnValue: "Available" },
                        { label: "PF Status", fieldId: "pfStatus", type: "dropdown", required: true, options: ["Yes", "No"], order: 3 },
                        { label: "PF No.", fieldId: "pfNo", type: "text", required: true, order: 4, dependsOn: "pfStatus", dependsOnValue: "Yes" },
                        { label: "ESI Status", fieldId: "esiStatus", type: "dropdown", required: true, options: ["Yes", "No"], order: 5 },
                        { label: "ESI No.", fieldId: "esiNo", type: "text", required: true, order: 6, dependsOn: "esiStatus", dependsOnValue: "Yes" },
                        { label: "Is E-Invoice applicable to you?", fieldId: "eInvoiceApplicable", type: "dropdown", required: true, options: ["Yes", "No"], order: 7 },
                        { label: "LY1 Turnover (Indian Rupee)", fieldId: "ly1Turnover", type: "number", required: true, order: 8 },
                        { label: "LY2 Turnover (Indian Rupee)", fieldId: "ly2Turnover", type: "number", required: true, order: 9 },
                        { label: "LY3 Turnover (Indian Rupee)", fieldId: "ly3Turnover", type: "number", required: true, order: 10 },
                        { label: "LY4 Turnover (Indian Rupee)", fieldId: "ly4Turnover", type: "number", required: true, order: 11 },
                        { label: "LY5 Turnover (Indian Rupee)", fieldId: "ly5Turnover", type: "number", required: true, order: 12 },
                        { label: "LY6 Turnover (Indian Rupee)", fieldId: "ly6Turnover", type: "number", required: true, order: 13 }
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
                }
            ]
        };

        // 4. Delete old master templates
        await FormTemplate.deleteMany({ name: MASTER_TEMPLATE_DATA.name });

        // 5. Create new template
        const template = await FormTemplate.create(MASTER_TEMPLATE_DATA);
        console.log("Master Form Template Seeded Successfully:", template._id);

        // 6. Link to category
        category.formTemplate = template._id;
        category.hasPublishedForm = true;
        await category.save();
        console.log("Category linked and published.");

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedMasterForm();
