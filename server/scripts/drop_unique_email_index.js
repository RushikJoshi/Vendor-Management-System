const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vendorDB";

async function dropIndex() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB:", mongoURI.split('@').pop());
        
        // Try both common casings
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log("Collections in DB:", collectionNames);
        
        const targetCollection = collectionNames.find(c => c.toLowerCase() === "vendorapplications") || "vendorapplications";
        console.log(`Using collection: ${targetCollection}`);
        const collection = mongoose.connection.db.collection(targetCollection);
        
        // List indexes
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes.map(i => i.name));
        
        const hasEmailIndex = indexes.some(i => i.name === "email_1");
        
        if (hasEmailIndex) {
            console.log("Dropping index 'email_1'...");
            await collection.dropIndex("email_1");
            console.log("Successfully dropped unique email index.");
        } else {
            console.log("Index 'email_1' not found, it might have a different name or is already gone.");
            // Check for other unique email indexes
            const otherEmailIndex = indexes.find(i => i.key.email === 1 && i.unique);
            if (otherEmailIndex) {
                console.log(`Dropping unique index '${otherEmailIndex.name}'...`);
                await collection.dropIndex(otherEmailIndex.name);
                console.log("Successfully dropped.");
            }
        }
    } catch (err) {
        console.error("Error dropping index:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

dropIndex();
