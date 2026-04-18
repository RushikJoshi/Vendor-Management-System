const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const count = await Category.countDocuments();
        console.log('Total categories:', count);
        const samples = await Category.find().limit(5);
        console.log('Samples:', JSON.stringify(samples, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
