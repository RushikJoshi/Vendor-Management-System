const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "admin@gmail.com";
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("User already exists. Updating password...");
            existingUser.password = "admin123"; // Updated to satisfy minlength 6
            existingUser.role = "admin";
            await existingUser.save();
        } else {
            console.log("Creating new admin user...");
            await User.create({
                name: "System Admin",
                email: "admin@gmail.com",
                password: "admin123",
                role: "admin"
            });
        }

        console.log("Admin user seeded successfully! Email: admin@gmail.com, Password: admin123");
        process.exit(0);
    } catch (error) {
        console.log("SEED ERROR:", error.message);
        console.dir(error, { depth: null });
        process.exit(1);
    }
};

seedUser();
