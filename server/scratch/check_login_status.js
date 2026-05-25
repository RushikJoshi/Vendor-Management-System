const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const dns = require('dns');
dns.setServers(['8.8.8.8']);
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function check() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB');

    const users = await User.find({}).limit(5);
    console.log('Users in DB (first 5):', users.map(u => ({ email: u.email, role: u.role, tenantId: u.tenantId })));

    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (admin) {
        console.log('Admin user found');
    } else {
        console.log('Admin user NOT found');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  }
}

check();
