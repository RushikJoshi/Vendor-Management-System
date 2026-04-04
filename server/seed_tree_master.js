const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Adjust if .env is not in root of server

const TreeForm = require('./models/TreeForm');

const dns = require('dns');
dns.setServers(['8.8.8.8']);

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vendorDB";

// Helper for generating unique basic ids
const gid = () => Math.random().toString(36).substr(2, 6);

async function seedTreeMaster() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // 1. Delete previous versions of "Enterprise Vendor Registration Form"
    await TreeForm.deleteMany({ name: "Enterprise Vendor Registration" });
    console.log("Old TreeForms deleted.");

    // 2. Build the deeply nested structure based on Ariba standards and User Screenshot
    const structure = [
      {
        id: "sec_supp_info",
        title: "1. Supplier Information",
        fields: [],
        children: [
          {
            id: "subsec_comp_basic",
            title: "1.1 Company Basic Details",
            children: [],
            fields: [
              { id: "f_title", label: "Title", type: "dropdown", required: true, options: ["Mr", "Ms", "Mrs", "Dr", "M/s"] },
              { id: "f_comp_name", label: "Company Name", type: "text", required: true },
              { id: "f_legal_name", label: "Legal Name", type: "text", required: true },
              { id: "f_trade_name", label: "Trade Name", type: "text", required: false },
              { id: "f_vend_cat", label: "Vendor Category", type: "dropdown", required: true, options: ["Raw Material", "Civil Contractor", "Mechanical", "Electrical", "Services"] },
              { id: "f_reg_num", label: "Registration Number", type: "text", required: true },
              { id: "f_gst_num", label: "GST Number", type: "text", required: true },
            ]
          },
          {
            id: "subsec_contact",
            title: "1.2 Primary Contact Details",
            children: [],
            fields: [
              { id: "f_auth_first", label: "First Name (Authorized Person)", type: "text", required: true },
              { id: "f_auth_last", label: "Last Name (Authorized Person)", type: "text", required: true },
              { id: "f_mobile", label: "Mobile No.", type: "text", required: true },
              { id: "f_email", label: "Email ID", type: "email", required: true },
              { id: "f_designation", label: "Designation", type: "text", required: true }
            ]
          },
          {
            id: "subsec_address",
            title: "1.3 Address Details (Billing)",
            children: [],
            fields: [
              { id: "f_addr_type", label: "Address Type", type: "dropdown", required: true, options: ["Domestic", "International"] },
              { id: "f_street", label: "Street", type: "text", required: true },
              { id: "f_district", label: "District", type: "text", required: false },
              { id: "f_city", label: "City", type: "text", required: true },
              { id: "f_postal", label: "Postal Code", type: "text", required: true },
              { id: "f_country", label: "Country", type: "text", required: true }
            ]
          }
        ]
      },
      {
        id: "sec_statutory",
        title: "2. Statutory Compliances",
        fields: [],
        children: [
          {
            id: "subsec_pan",
            title: "2.1 Tax Information",
            children: [],
            fields: [
              { id: "f_pan_status", label: "PAN Status", type: "dropdown", required: true, options: ["Available", "Not Available"] },
              { id: "f_pan_num", label: "PAN Number", type: "text", required: true },
              { id: "f_einvoice", label: "E-Invoice Applicable?", type: "dropdown", required: true, options: ["Yes", "No"] }
            ]
          },
          {
            id: "subsec_pf",
            title: "2.2 PF & ESI Details",
            children: [],
            fields: [
              { id: "f_pf_status", label: "PF Status", type: "dropdown", required: true, options: ["Yes", "No"] },
              { id: "f_pf_num", label: "PF Number", type: "text", required: false },
              { id: "f_esi_status", label: "ESI Status", type: "dropdown", required: true, options: ["Yes", "No"] },
              { id: "f_esi_num", label: "ESI Number", type: "text", required: false }
            ]
          }
        ]
      },
      {
        id: "sec_finance",
        title: "3. Financial & Bank Details",
        fields: [],
        children: [
          {
            id: "subsec_bank",
            title: "3.1 Bank Information",
            children: [],
            fields: [
              { id: "f_acc_type", label: "Account Type", type: "dropdown", required: true, options: ["Savings", "Current", "OD", "CC"] },
              { id: "f_bank_name", label: "Bank Name", type: "text", required: true },
              { id: "f_bank_branch", label: "Bank Branch", type: "text", required: true },
              { id: "f_acc_num", label: "Account Number", type: "text", required: true },
              { id: "f_ifsc", label: "Bank Key (IFSC Code)", type: "text", required: true },
              { id: "f_acc_holder", label: "Account Holder Name", type: "text", required: true }
            ]
          }
        ]
      },
      {
        id: "sec_docs",
        title: "4. Document Uploads",
        fields: [],
        children: [
          {
            id: "subsec_kyc",
            title: "4.1 KYC Documents",
            children: [],
            fields: [
              { id: "f_doc_pan", label: "Upload PAN Card", type: "file", required: true },
              { id: "f_doc_gst", label: "Upload GST Certificate", type: "file", required: true },
              { id: "f_doc_cheque", label: "Upload Cancelled Cheque", type: "file", required: true }
            ]
          }
        ]
      },
      {
        id: "sec_add",
        title: "5. Additional Details",
        fields: [],
        children: [
          {
            id: "subsec_exp",
            title: "5.1 Experience & References",
            children: [],
            fields: [
              { id: "f_exp_years", label: "Years of Experience", type: "number", required: false },
              { id: "f_clients", label: "Major Clients (Top 3)", type: "text", required: false },
              { id: "f_turnover", label: "Last Year Turnover (INR)", type: "number", required: false }
            ]
          }
        ]
      }
    ];

    // 3. Insert the new TreeForm
    const newForm = await TreeForm.create({
      code: "ENT-REG-101",
      name: "Enterprise Vendor Registration",
      categoryName: "General Vendors",
      version: 1,
      status: "published",
      structure: structure
    });

    console.log("Successfully seeded TreeForm!");
    console.log("Form ID:", newForm._id);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding TreeForm:", error);
    process.exit(1);
  }
}

seedTreeMaster();
