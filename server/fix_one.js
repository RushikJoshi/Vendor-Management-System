const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function fix() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGO_URI not found in .env");
        process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const result = await db.collection('invoices').updateOne(
      { _id: new mongoose.Types.ObjectId('6a080c7b775ab49ab8402df8') },
      { $set: { status: 'approved' } }
    );
    
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
