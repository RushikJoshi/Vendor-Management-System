const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: './.env' }); // Adjust if .env is not in root of server

const TreeForm = require('./models/TreeForm');

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vendorDB";

const genEquipFields = (prefix) => [
  { id: `${prefix}_count`, label: "Count", type: "number" },
  { id: `${prefix}_hired`, label: "Hired", type: "number" },
  { id: `${prefix}_purchased`, label: "Purchased", type: "number" },
  { id: `${prefix}_capacity`, label: "Capacity", type: "text" },
  { id: `${prefix}_year`, label: "Year of Purchase", type: "text" },
];

async function seedDeepMaster() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // 1. Delete previous nested forms
    await TreeForm.deleteMany({ name: "Supplier Self-Registration Request Form" });
    await TreeForm.deleteMany({ name: "Enterprise Vendor Registration" });
    await TreeForm.deleteMany({ name: "Enterprise Vendor Registration Form" });
    await TreeForm.deleteMany({ code: "DEFAULT_VENDOR_REGISTRATION_V1" });
    console.log("Old TreeForms deleted.");

    // 2. Build deep nested structure matching the Ariba master fields
    const structure = [
      {
        id: "s1", title: "1. Supplier Information", fields: [],
        children: [
          {
            id: "s1_1", title: "1.1.1.1 Company Basic Details", children: [],
            fields: [
              { id: "title", label: "Title", type: "dropdown", required: true, options: ["Mr", "Ms", "Mrs", "Dr", "M/s"] },
              { id: "fullTradeName", label: "Supplier Full Trade Name (As per GST Registration)", type: "text", required: true },
              { id: "fullTradeNameExtra", label: "Supplier Full Trade Name (Remaining if > 35 Characters)", type: "text", required: false },
              { id: "vendorCategory", label: "Vendor Category", type: "dropdown", required: true, options: ["Propriety", "Partnership", "Private Limited", "Public Limited", "Individual", "Others"] },
            ]
          },
          {
            id: "s1_2", title: "1.1.1.2.1 Primary Contact Details - Supplier", children: [],
            fields: [
              { id: "authFirstName", label: "Name of Authorized Person First Name", type: "text", required: true },
              { id: "authLastName", label: "Name of Authorized Person Last Name", type: "text", required: true },
              { id: "authMobile", label: "Mobile No. of Authorized Person", type: "text", required: true },
              { id: "email", label: "Email ID of Authorized Person", type: "email", required: true },
              { id: "contactPersonMobile", label: "Mobile No. of Supplier Contact Person", type: "text", required: false },
              { id: "contactPersonEmail", label: "Email ID of Supplier Contact Person", type: "email", required: false },
              { id: "otherMobile", label: "Other Mobile No.", type: "text", required: false },
              { id: "otherEmail", label: "Other Email ID", type: "email", required: false },
              { id: "designation", label: "Designation of Contact Person", type: "text", required: true },
            ]
          },
          {
            id: "s1_3", title: "1.1.1.2.1.10 Contact Details - Buyer (HGEIL) Coordinator", children: [],
            fields: [
              { id: "buyerName", label: "Name of the (HGEIL) Buyer", type: "text", required: true },
              { id: "buyerMobile", label: "Mobile No. of the (HGEIL) Buyer", type: "text", required: true },
            ]
          },
          {
            id: "s1_4", title: "1.1.1.2.2 Address Details (Billing Address)", children: [],
            fields: [
              { id: "addressType", label: "Address Domestic / International", type: "dropdown", required: true, options: ["Domestic", "International"] },
              { id: "street", label: "Street", type: "text", required: true },
              { id: "houseNumber", label: "House Number", type: "text", required: false },
              { id: "street2", label: "Street 2", type: "text", required: false },
              { id: "street3", label: "Street 3", type: "text", required: false },
              { id: "district", label: "District", type: "text", required: false },
              { id: "pincode", label: "Postal Code", type: "text", required: true },
              { id: "city", label: "City", type: "text", required: true },
              { id: "country", label: "Country/Region", type: "text", required: true },
            ]
          },
          {
            id: "s1_5", title: "1.1.1.2.3 Other Details", children: [],
            fields: [
              { id: "serviceCategory", label: "Category", type: "text", required: true },
              { id: "region", label: "Region", type: "text", required: false },
              { id: "department", label: "Department", type: "text", required: false },
            ]
          }
        ]
      },
      {
        id: "s2", title: "2. Statutory Compliances", fields: [],
        children: [
          {
            id: "s2_1", title: "1.1.1.3 Statutory Compliances - Domestic Vendors", children: [],
            fields: [
              { id: "panStatus", label: "PAN Status", type: "dropdown", required: true, options: ["Available", "Not Available"] },
              { id: "panNum", label: "PAN Number", type: "text", required: true },
              { id: "pfStatus", label: "PF Status", type: "dropdown", required: true, options: ["Yes", "No"] },
              { id: "pfNo", label: "PF No.", type: "text", required: true },
              { id: "esiStatus", label: "ESI Status", type: "dropdown", required: true, options: ["Yes", "No"] },
              { id: "esiNo", label: "ESI No.", type: "text", required: true },
              { id: "eInvoiceApplicable", label: "Is E-Invoice applicable to you?", type: "dropdown", required: true, options: ["Yes", "No"] },
              { id: "ly1Turnover", label: "LY1 Turnover (Indian Rupee)", type: "number", required: true },
              { id: "ly2Turnover", label: "LY2 Turnover (Indian Rupee)", type: "number", required: true },
              { id: "ly3Turnover", label: "LY3 Turnover (Indian Rupee)", type: "number", required: true },
              { id: "ly4Turnover", label: "LY4 Turnover (Indian Rupee)", type: "number", required: true },
              { id: "ly5Turnover", label: "LY5 Turnover (Indian Rupee)", type: "number", required: true },
              { id: "ly6Turnover", label: "LY6 Turnover (Indian Rupee)", type: "number", required: true },
            ]
          }
        ]
      },
      {
        id: "s3", title: "3. Financial & Bank Details", fields: [],
        children: [
          {
            id: "s3_1", title: "1.1.1.4 Financial & Bank Details", children: [],
            fields: [
              { id: "bankCount", label: "How many bank details you want to Input", type: "dropdown", required: true, options: ["One", "Two", "Three"] },
              { id: "accountType", label: "Account Type", type: "dropdown", required: true, options: ["Savings", "Current", "OD", "CC"] },
              { id: "bankName", label: "Bank Name", type: "text", required: true },
              { id: "bankBranch", label: "Bank Branch", type: "text", required: true },
              { id: "bankStreet", label: "Bank Street", type: "text", required: true },
              { id: "bankCity", label: "Bank City", type: "text", required: true },
              { id: "accountNumber", label: "Bank Account Number", type: "text", required: true },
              { id: "ifscCode", label: "Bank Key (IFSC Code)", type: "text", required: true },
              { id: "accountHolderName", label: "Account Holder Name", type: "text", required: true },
            ]
          }
        ]
      },
      {
        id: "s4", title: "4. Additional Details", fields: [],
        children: [
          {
            id: "s4_1", title: "1.1.2.1 Do You want to fill Additional Details", children: [],
            fields: [
              { id: "fillAdditional", label: "Consent to Fill Additional Details", type: "dropdown", required: true, options: ["Yes", "No"] }
            ]
          },
          {
            id: "s4_2", title: "1.1.2.2.1 Experience & References", children: [],
            fields: [
              { id: "expYears", label: "Years of Experience in this Business", type: "number", required: false },
              { id: "deliveryCount", label: "How Many Companies delivered goods/services?", type: "number", required: false },
              { id: "clientList", label: "Company Details Information", type: "text", required: false }, // textarea
              { id: "references", label: "References", type: "text", required: false }, // textarea
              { id: "achievements", label: "Achievements and Recognition", type: "text", required: false }, // textarea
              { id: "finDocuments", label: "Latest Financial Statements (Balance Sheet/P&L/ITR)", type: "file", required: false }
            ]
          },
          {
            id: "s4_3", title: "1.1.2.2.6.1 Equipment - Plant Operation", children: [],
            fields: genEquipFields("plant")
          },
          {
            id: "s4_4", title: "1.1.2.2.6.2 Equipment - Laying Equipment", children: [],
            fields: genEquipFields("laying")
          },
          {
            id: "s4_5", title: "1.1.2.2.6.3 Equipment - Transportation", children: [],
            fields: genEquipFields("trans")
          },
          {
            id: "s4_6", title: "1.1.2.2.6.4 Equipment - Misc. (Hydra, JCB, Crane, etc.)", children: [],
            fields: genEquipFields("miscEquip")
          },
          {
            id: "s4_7", title: "1.1.2.2.6.5 Equipment - Excavation / Earthwork", children: [],
            fields: genEquipFields("excavation")
          },
          {
            id: "s4_8", title: "1.1.2.2.6.6 Equipment - Crusher", children: [],
            fields: genEquipFields("crusher")
          },
          {
            id: "s4_9", title: "1.1.2.2.6.7 Equipment - LMVs", children: [],
            fields: genEquipFields("lmv")
          },
          {
            id: "s4_10", title: "1.1.2.2.7 Manpower Count", children: [],
            fields: [
              { id: "staffManagerial", label: "Office Staff - Managerial", type: "number", required: false },
              { id: "staffSupervisory", label: "Office Staff - Supervisory", type: "number", required: false },
              { id: "staffTechnical", label: "Office Staff - Technical", type: "number", required: false },
              { id: "staffNonTech", label: "Office Staff - Non-Technical", type: "number", required: false },
              { id: "labourSkilled", label: "Labour Skilled", type: "number", required: false },
              { id: "labourSemiSkilled", label: "Labour Semi-Skilled", type: "number", required: false },
            ]
          },
          {
            id: "s4_11", title: "1.1.2.2.8 Quality & Certification", children: [],
            fields: [
              { id: "labEquipName", label: "Lab Equipment Name", type: "text", required: false },
              { id: "labAuth", label: "Lab Issuing Authority", type: "text", required: false },
              { id: "labYear", label: "Lab Purchase/Achievement Year", type: "text", required: false },
              { id: "certName", label: "Certification Name", type: "text", required: false },
              { id: "certAuth", label: "Certification Issuing Authority", type: "text", required: false },
              { id: "certYear", label: "Certification Year", type: "text", required: false },
            ]
          },
          {
            id: "s4_12", title: "1.1.2.2.9 Key Supplier List", children: [],
            fields: [
              { id: "sup1Name", label: "Supplier 1 Name", type: "text", required: false },
              { id: "sup1Mat", label: "Supplier 1 Material", type: "text", required: false },
              { id: "sup1Qty", label: "Supplier 1 Quantity", type: "text", required: false },
              { id: "sup2Name", label: "Supplier 2 Name", type: "text", required: false },
              { id: "sup2Mat", label: "Supplier 2 Material", type: "text", required: false },
              { id: "sup2Qty", label: "Supplier 2 Quantity", type: "text", required: false },
            ]
          },
          {
            id: "s4_13", title: "1.1.2.2.10 Export Details", children: [],
            fields: [
              { id: "export1Prod", label: "Product 1", type: "text", required: false },
              { id: "export1Country", label: "Country 1", type: "text", required: false },
              { id: "export1Value", label: "Value 1", type: "text", required: false },
              { id: "export2Prod", label: "Product 2", type: "text", required: false },
              { id: "export2Country", label: "Country 2", type: "text", required: false },
              { id: "export2Value", label: "Value 2", type: "text", required: false },
              { id: "export3Prod", label: "Product 3", type: "text", required: false },
              { id: "export3Country", label: "Country 3", type: "text", required: false },
              { id: "export3Value", label: "Value 3", type: "text", required: false },
            ]
          }
        ]
      }
    ];

    // 3. Insert the new TreeForm
    const newForm = await TreeForm.create({
      code: "DEFAULT_VENDOR_REGISTRATION_V1",
      name: "Enterprise Vendor Registration Form",
      categoryName: "General Vendors",
      version: 1,
      status: "published",
      structure: structure
    });

    console.log("Successfully seeded Deep TreeForm!");
    console.log("Form ID:", newForm._id);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding TreeForm:", error);
    process.exit(1);
  }
}

seedDeepMaster();
