require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB for PDF Regeneration...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Models (Using existing ones)
const PurchaseOrder = require('../models/PurchaseOrder');
const ProcurementSettings = require('../models/ProcurementSettings');
const Vendor = require('../models/Vendor');
const rfqModel = require('../models/RFQ'); // Might need this for item names
const { generatePO, generateSO } = require('../utils/pdfGenerator');

async function migrate() {
    try {
        const orders = await PurchaseOrder.find().populate('vendorId').populate('rfqId');
        console.log(`Found ${orders.length} orders to process.`);

        for (const order of orders) {
            console.log(`Processing ${order.orderNumber || order.poNumber}...`);
            
            // Fetch settings for the tenant
            let settings = await ProcurementSettings.findOne({ tenantId: order.tenantId });
            if (!settings) {
                settings = await ProcurementSettings.create({ tenantId: order.tenantId });
            }

            const vendorData = order.vendorId;
            const poItems = order.items.map(item => ({
                name: item.name || "Operational Requirement",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0
            }));

            let pdfUrl = "";
            if (order.orderType === "SO") {
                pdfUrl = await generateSO({
                    soNumber: order.orderNumber || order.poNumber,
                    vendorName: vendorData?.companyName || vendorData?.name || "Vendor",
                    items: poItems,
                    totalAmount: order.totalAmount,
                    location: order.serviceLocation || "As per Site Requirement",
                    startDate: order.servicePeriod?.startDate || new Date(),
                    endDate: order.servicePeriod?.endDate || new Date()
                }, settings);
            } else {
                pdfUrl = await generatePO({
                    poNumber: order.orderNumber || order.poNumber,
                    vendorName: vendorData?.companyName || vendorData?.name || "Vendor",
                    items: poItems,
                    totalAmount: order.totalAmount
                }, settings);
            }

            order.pdfUrl = pdfUrl;
            await order.save();
            console.log(`Successfully updated PDF for ${order.orderNumber || order.poNumber}`);
        }

        console.log('--- ALL OLD ORDERS UPDATED WITH NEW DESIGN ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
