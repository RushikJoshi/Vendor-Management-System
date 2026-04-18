const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: './.env' });
const PurchaseOrder = require('../models/PurchaseOrder');

async function fixOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        const result = await PurchaseOrder.updateMany(
            { orderType: { $exists: false } },
            { $set: { orderType: 'PO' } }
        );
        
        console.log("Migration complete:", result);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

fixOrders();
