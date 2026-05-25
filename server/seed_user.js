const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Company = require("./models/Company");

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Ensure a default company exists
        let company = await Company.findOne();
        if (!company) {
            console.log("Creating default company...");
            company = await Company.create({
                name: "Gitakshmi Tech",
                email: "admin@gitakshmitech.com",
            });
        }

        const email = "admin@gmail.com";
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("User already exists. Updating password and tenantId...");
            existingUser.password = "admin";
            existingUser.role = "admin";
            existingUser.tenantId = company._id;
            await existingUser.save();
        } else {
            console.log("Creating new admin user with tenantId...");
            await User.create({
                name: "System Admin",
                email: "admin@gmail.com",
                password: "admin",
                role: "admin",
                tenantId: company._id,
            });
        }

        console.log("Admin user seeded successfully! Email: admin@gmail.com, Tenant:", company.name);
        process.exit(0);
    } catch (error) {
        console.log("SEED ERROR:", error.message);
        console.dir(error, { depth: null });
        process.exit(1);
    }
};

seedUser();
