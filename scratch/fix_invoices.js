const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Fix all auto-generated invoices to approved status
    const result = await mongoose.connection.db.collection('invoices').updateMany(
      { invoiceNumber: { $regex: /^INV-AUTO-/ }, status: 'submitted' },
      { $set: { status: 'approved' } }
    );
    
    console.log(`Updated ${result.modifiedCount} invoices to approved`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
