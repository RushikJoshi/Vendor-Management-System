const defaultVendorTemplate = {
  code: "DEFAULT_VENDOR_REGISTRATION_V1",
  name: "Enterprise Vendor Registration Form",
  categoryName: "General Vendors",
  version: 1,
  status: "published",
  structure: [
    {
      id: "sec_supplier_information",
      title: "Supplier Information",
      children: [
        {
          id: "sub_company_basic_details",
          title: "Company Basic Details",
          children: [],
          fields: [
            { id: "gst_number", label: "GST Number", type: "text", required: true, options: [], validation: { pattern: "gst", apiIntegration: { enabled: true, provider: "GST_API", trigger: "onBlur", autofillTargets: ["company_name", "legal_name"] } } },
            { id: "company_name", label: "Company Name", type: "text", required: true, options: [], validation: { pattern: "none", minLength: 2, maxLength: 150 } },
            { id: "legal_name", label: "Legal Name", type: "text", required: true, options: [], validation: { pattern: "none", minLength: 2, maxLength: 150 } },
            { id: "trade_name", label: "Trade Name", type: "text", required: false, options: [], validation: { pattern: "none", maxLength: 150 } },
            { id: "vendor_category", label: "Vendor Category", type: "dropdown", required: true, options: ["Raw Material", "Civil Contractor", "Mechanical", "Electrical", "IT", "Consultancy", "Transport", "Other"], validation: { pattern: "none" } },
            { id: "registration_number", label: "Registration Number", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 50 } },
            { id: "pan_number", label: "PAN Number", type: "text", required: true, options: [], validation: { pattern: "pan", minLength: 10, maxLength: 10 } },
            { id: "msme_number", label: "MSME Number", type: "text", required: false, options: [], validation: { pattern: "none", maxLength: 30 } },
            { id: "cin_number", label: "CIN Number", type: "text", required: false, options: [], validation: { pattern: "none", maxLength: 21 } }
          ]
        },
        {
          id: "sub_communication_details",
          title: "Communication Details",
          children: [],
          fields: [
            { id: "contact_person_name", label: "Contact Person Name", type: "text", required: true, options: [], validation: { pattern: "none", minLength: 2, maxLength: 100 } },
            { id: "email", label: "Email", type: "email", required: true, options: [], validation: { pattern: "email", maxLength: 120 } },
            { id: "mobile", label: "Mobile", type: "text", required: true, options: [], validation: { pattern: "phone", minLength: 10, maxLength: 15 } },
            { id: "alternate_mobile", label: "Alternate Mobile", type: "text", required: false, options: [], validation: { pattern: "phone", minLength: 10, maxLength: 15 } }
          ]
        },
        {
          id: "sub_address_details",
          title: "Address Details",
          children: [],
          fields: [
            { id: "street", label: "Street", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 200 } },
            { id: "city", label: "City", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 80 } },
            { id: "state", label: "State", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 80 } },
            { id: "country", label: "Country", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 80 } },
            { id: "pincode", label: "Pincode", type: "text", required: true, options: [], validation: { pattern: "pincode", minLength: 6, maxLength: 10 } }
          ]
        },
        {
          id: "sub_other_details",
          title: "Other Details",
          children: [],
          fields: [
            { id: "nature_of_business", label: "Nature of Business", type: "dropdown", required: true, options: ["Manufacturer", "Trader", "Service Provider", "Contractor"], validation: { pattern: "none" } },
            { id: "years_in_business", label: "Years in Business", type: "number", required: false, options: [], validation: { pattern: "none", min: 0, max: 100 } },
            { id: "annual_turnover", label: "Annual Turnover", type: "number", required: false, options: [], validation: { pattern: "none", min: 0 } }
          ]
        }
      ],
      fields: []
    },
    {
      id: "sec_statutory_compliances",
      title: "Statutory Compliances",
      children: [
        {
          id: "sub_gst_details",
          title: "GST Details",
          children: [],
          fields: [
            { id: "gst_registered", label: "GST Registered", type: "radio", required: true, options: ["Yes", "No"], validation: { pattern: "none" } },
            { id: "gst_registration_type", label: "GST Registration Type", type: "dropdown", required: false, options: ["Regular", "Composition", "Unregistered"], validation: { pattern: "none" } }
          ]
        },
        {
          id: "sub_pan_details",
          title: "PAN Details",
          children: [],
          fields: [
            { id: "pan_holder_name", label: "PAN Holder Name", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 120 } }
          ]
        },
        {
          id: "sub_pf_esic",
          title: "PF / ESIC Details",
          children: [],
          fields: [
            { id: "pf_status", label: "PF Status", type: "radio", required: true, options: ["Yes", "No"], validation: { pattern: "none" } },
            { id: "pf_number", label: "PF Number", type: "text", required: false, options: [], validation: { pattern: "none", maxLength: 40 } },
            { id: "esic_status", label: "ESIC Status", type: "radio", required: true, options: ["Yes", "No"], validation: { pattern: "none" } },
            { id: "esic_number", label: "ESIC Number", type: "text", required: false, options: [], validation: { pattern: "none", maxLength: 40 } }
          ]
        },
        {
          id: "sub_msme_cin",
          title: "MSME / CIN",
          children: [],
          fields: [
            { id: "msme_registered", label: "MSME Registered", type: "radio", required: true, options: ["Yes", "No"], validation: { pattern: "none" } },
            { id: "cin_applicable", label: "CIN Applicable", type: "radio", required: false, options: ["Yes", "No"], validation: { pattern: "none" } }
          ]
        }
      ],
      fields: []
    },
    {
      id: "sec_financial_bank",
      title: "Financial & Bank Details",
      children: [
        {
          id: "sub_account_details",
          title: "Account Details",
          children: [],
          fields: [
            { id: "account_holder_name", label: "Account Holder Name", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 120 } },
            { id: "account_number", label: "Account Number", type: "text", required: true, options: [], validation: { pattern: "bankAccount", minLength: 6, maxLength: 30 } },
            { id: "ifsc_code", label: "IFSC Code", type: "text", required: true, options: [], validation: { pattern: "ifsc", apiIntegration: { enabled: true, provider: "IFSC_API", trigger: "onBlur", autofillTargets: ["bank_name", "branch"] } } },
            { id: "bank_name", label: "Bank Name", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 120 } },
            { id: "branch", label: "Branch", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 120 } }
          ]
        }
      ],
      fields: []
    },
    {
      id: "sec_documents",
      title: "Document Uploads",
      children: [
        {
          id: "sub_mandatory_documents",
          title: "Mandatory Documents",
          children: [],
          fields: [
            { id: "gst_certificate", label: "GST Certificate", type: "file", required: true, options: [], validation: { pattern: "none", allowedFileTypes: ["pdf", "jpg", "jpeg", "png"], maxFileSizeMB: 5 } },
            { id: "pan_card", label: "PAN Card", type: "file", required: true, options: [], validation: { pattern: "none", allowedFileTypes: ["pdf", "jpg", "jpeg", "png"], maxFileSizeMB: 5 } },
            { id: "cancelled_cheque", label: "Cancelled Cheque", type: "file", required: true, options: [], validation: { pattern: "none", allowedFileTypes: ["pdf", "jpg", "jpeg", "png"], maxFileSizeMB: 5 } },
            { id: "incorporation_certificate", label: "Incorporation Certificate", type: "file", required: true, options: [], validation: { pattern: "none", allowedFileTypes: ["pdf", "jpg", "jpeg", "png"], maxFileSizeMB: 10 } },
            { id: "other_uploads", label: "Other Uploads", type: "file", required: false, options: [], validation: { pattern: "none", allowedFileTypes: ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"], maxFileSizeMB: 15 } }
          ]
        }
      ],
      fields: []
    },
    {
      id: "sec_additional_details",
      title: "Additional Details",
      children: [],
      fields: [
        { id: "declaration_acceptance", label: "I confirm all information provided is accurate", type: "radio", required: true, options: ["Yes"], validation: { pattern: "none" } },
        { id: "authorized_signatory", label: "Authorized Signatory", type: "text", required: true, options: [], validation: { pattern: "none", maxLength: 120 } },
        { id: "authorized_signatory_date", label: "Authorized Signatory Date", type: "date", required: true, options: [], validation: { pattern: "none" } }
      ]
    }
  ]
};

module.exports = defaultVendorTemplate;
