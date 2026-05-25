require('dotenv').config();
const mongoose = require('mongoose');
const SalesOrder = require('../models/SalesOrder');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const result = await SalesOrder.updateOne({ soNumber: 'SO-2026-0002' }, { $set: { status: 'Invoiced' } });
    console.log("Status updated:", result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
