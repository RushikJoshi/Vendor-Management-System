const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

const dns = require('dns');
dns.setServers(['8.8.8.8']);

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" match:', isMatch);

    const isMatch2 = await bcrypt.compare('admin', user.password);
    console.log('Password "admin" match:', isMatch2);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
