const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");
const Vendor = require("./models/Vendor");
const Role = require("./models/Role");
const Permission = require("./models/Permission");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await Admin.deleteMany({});
    await Vendor.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    console.log("✓ Cleared existing data");

    // 1. Create Permissions Matrix
    const permissionsList = [
      { name: "APPLICATION_VIEW_BASIC", module: "APPLICATION", description: "View basic application data" },
      { name: "APPLICATION_VIEW_TECHNICAL", module: "APPLICATION", description: "View technical dossiers" },
      { name: "APPLICATION_VIEW_FINANCIAL", module: "APPLICATION", description: "View financial/turnover data" },
      { name: "APPLICATION_VIEW_COMPLIANCE", module: "APPLICATION", description: "View compliance certificates" },
      { name: "APPLICATION_APPROVE_BASIC", module: "APPLICATION", description: "Authorize individual stages" },
      { name: "APPLICATION_APPROVE_TECHNICAL", module: "APPLICATION", description: "Authorize stage 1 (Technical)" },
      { name: "APPLICATION_APPROVE_FINANCE", module: "APPLICATION", description: "Authorize stage 2 (Finance)" },
      { name: "APPLICATION_APPROVE_COMPLIANCE", module: "APPLICATION", description: "Authorize stage 3 (Compliance)" },
      { name: "APPLICATION_APPROVE_FINAL", module: "APPLICATION", description: "Final procurement sign-off" },
      { name: "VIEW_AUDIT_LOGS", module: "AUDIT", description: "Read forensic audit logs" },
      { name: "MANAGE_VENDORS", module: "SLM", description: "Update vendor lifecycle and status" },
      { name: "MANAGE_CONTRACTS", module: "SLM", description: "Create and terminate contracts" },
      { name: "BLACKLIST_VENDOR", module: "SLM", description: "Completely bar vendors from system" },
      { name: "MANAGE_CATEGORIES", module: "CATEGORIES", description: "Configure sourcing categories" },
      { name: "VIEW_NOTIFICATIONS", module: "SYSTEM", description: "Read in-app alerts" }
    ];

    const createdPermissions = await Permission.insertMany(permissionsList);
    console.log(`✓ ${createdPermissions.length} Permissions created`);

    const getP = (name) => createdPermissions.find(p => p.name === name)._id;

    // 2. Define Roles and assign Permissions
    const roles = [
      {
        name: "Super Admin",
        permissions: createdPermissions.map(p => p._id)
      },
      {
        name: "Technical Reviewer",
        permissions: [getP("APPLICATION_VIEW_BASIC"), getP("APPLICATION_VIEW_TECHNICAL"), getP("APPLICATION_APPROVE_BASIC"), getP("APPLICATION_APPROVE_TECHNICAL")]
      },
      {
        name: "Finance Reviewer",
        permissions: [getP("APPLICATION_VIEW_BASIC"), getP("APPLICATION_VIEW_FINANCIAL"), getP("APPLICATION_APPROVE_BASIC"), getP("APPLICATION_APPROVE_FINANCE")]
      },
      {
        name: "Compliance Officer",
        permissions: [getP("APPLICATION_VIEW_BASIC"), getP("APPLICATION_VIEW_COMPLIANCE"), getP("APPLICATION_APPROVE_BASIC"), getP("APPLICATION_APPROVE_COMPLIANCE")]
      },
      {
        name: "Procurement Manager",
        permissions: [
          getP("APPLICATION_VIEW_BASIC"), getP("APPLICATION_VIEW_TECHNICAL"), getP("APPLICATION_VIEW_FINANCIAL"),
          getP("APPLICATION_VIEW_COMPLIANCE"), getP("APPLICATION_APPROVE_BASIC"), getP("APPLICATION_APPROVE_FINAL"), getP("MANAGE_VENDORS"),
          getP("MANAGE_CONTRACTS"), getP("MANAGE_CATEGORIES")
        ]
      },
      {
        name: "Vendor",
        permissions: [getP("VIEW_NOTIFICATIONS")]
      }
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log("✓ Roles created with permission links");

    const superAdminRole = createdRoles.find(r => r.name === "Super Admin");

    // 3. Create Demo Users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const vendorPassword = await bcrypt.hash("vendor123", 10);

    await Admin.create({
      email: "admin@example.com",
      password: adminPassword,
      role: superAdminRole._id,
    });
    console.log("✓ Super Admin: admin@example.com / admin123");

    await Vendor.create({
      email: "vendor@example.com",
      password: vendorPassword,
      companyName: "VMS Global Logistic Solutions",
      contactPerson: "Sarah Logistics",
      phone: "+1 (555) 777-8888",
      serviceType: "Logistics",
      address: "Logistics Hub 4, West Pier",
      status: "approved",
      lifecycleStatus: "active"
    });
    console.log("✓ Generic Vendor: vendor@example.com / vendor123");

    console.log("\n✅ Database seeded successfully with PBAC!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDB();
