const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Role = require("./models/Role");
const Permission = require("./models/Permission");

const seed_v2 = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        // 1. Create Default Permissions
        const permissions = [
            { name: "VIEW_DASHBOARD", module: "DASHBOARD", description: "Access to main dashboard" },
            { name: "MANAGE_USERS", module: "USERS", description: "Create and edit users" },
            { name: "MANAGE_ROLES", module: "ROLES", description: "Configure custom levels and limits" },
            { name: "APPROVE_PO", module: "PURCHASE_ORDERS", description: "Approve purchase orders" },
            { name: "VIEW_FINANCE", module: "FINANCE", description: "View financial reports" },
            { name: "MANAGE_VENDORS", module: "VENDORS", description: "Approve/Reject vendors" }
        ];

        await Permission.deleteMany({ name: { $in: permissions.map(p => p.name) } });
        const createdPermissions = await Permission.insertMany(permissions);
        console.log(`✓ ${createdPermissions.length} Permissions created`);

        // 2. Create Default Roles (Levels)
        const roles = [
            {
                name: "admin",
                description: "Full system access with no limits",
                maxLimit: 0, // Unlimited
                accessibleModules: ["Dashboard", "Vendors", "Forms", "Applications", "Categories", "Invitations", "SLM", "Contracts", "RFQs", "Quotations", "Departments", "Purchase Orders", "Users", "Roles", "Audit Logs", "Analytics"],
                permissions: createdPermissions.map(p => p._id)
            },
            {
                name: "hr",
                description: "Human Resources and Vendor Onboarding",
                maxLimit: 50000,
                accessibleModules: ["Dashboard", "Vendors", "Applications", "Departments", "Users"],
                permissions: createdPermissions.filter(p => ["VIEW_DASHBOARD", "MANAGE_VENDORS"].includes(p.name)).map(p => p._id)
            },
            {
                name: "manager",
                description: "Department Manager with Approval Limits",
                maxLimit: 100000,
                accessibleModules: ["Dashboard", "Purchase Orders", "RFQs", "Quotations"],
                permissions: createdPermissions.filter(p => ["VIEW_DASHBOARD", "APPROVE_PO"].includes(p.name)).map(p => p._id)
            }
        ];

        for (const r of roles) {
            await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
        }
        console.log("✓ Default Levels (Roles) created/updated");

        // 3. Update Existing Admin User
        const adminUser = await User.findOne({ role: "admin" });
        if (adminUser) {
            console.log("✓ Found existing admin user, system ready.");
        } else {
            // Create a default admin if none exists
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "System Admin",
                email: "admin@example.com",
                password: "admin123", // User model has pre-save hook for hashing
                role: "admin",
                status: "active"
            });
            console.log("✓ Default Admin created: admin@example.com / admin123");
        }

        console.log("\n✅ Dynamic RBAC system seeded successfully!\n");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

seed_v2();
