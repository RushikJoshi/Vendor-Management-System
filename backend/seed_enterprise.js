const mongoose = require("mongoose");
const Role = require("./models/Role");
const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connect to DB for seeding...");

        // 1) Seed Roles
        const roles = [
            { name: "Super Admin", permissions: ["all"] },
            { name: "Technical Reviewer", permissions: ["review_technical"] },
            { name: "Finance Reviewer", permissions: ["review_finance"] },
            { name: "Compliance Officer", permissions: ["review_compliance"] },
            { name: "Procurement Manager", permissions: ["manage_all", "issue_invites"] },
        ];

        await Role.deleteMany();
        const createdRoles = await Role.insertMany(roles);
        console.log("✅ Roles seeded");

        // 2) Seed Super Admin
        const superAdminRole = createdRoles.find(r => r.name === "Super Admin");
        const hashedPassword = await bcrypt.hash("admin123", 12);

        await Admin.deleteMany();
        await Admin.create({
            email: "admin@sap-ariba-clone.com",
            password: hashedPassword,
            role: superAdminRole._id,
        });
        console.log("✅ Super Admin created: admin@sap-ariba-clone.com / admin123");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
