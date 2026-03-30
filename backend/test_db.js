const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config();

const testConnect = async () => {
    console.log("Testing connection to:", process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("Connection Success!");
        process.exit(0);
    } catch (err) {
        console.error("Connection Failed:", err.message);
        console.error(err);
        process.exit(1);
    }
};

testConnect();
