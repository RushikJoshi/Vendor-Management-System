const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

const dns = require('dns');
dns.setServers(['8.8.8.8']);

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function reset() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'admin@gmail.com';
    const newPassword = 'admin';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (result) {
      console.log(`Successfully updated password for ${email} to "${newPassword}"`);
    } else {
      console.log(`User ${email} not found.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

reset();
