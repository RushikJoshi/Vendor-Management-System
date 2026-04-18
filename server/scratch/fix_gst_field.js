const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const TreeForm = require('../models/TreeForm');

async function fix() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("MONGO_URI not found in .env");
        process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for fixing GST field");
    
    // The specific form ID from user's URL
    const targetId = '69cf5cdca2c114fd8faf37e2';
    const form = await TreeForm.findById(targetId);
    
    if (!form) {
      console.log(`Form with ID ${targetId} not found. Checking all forms...`);
      const allForms = await TreeForm.find({});
      console.log("Found forms:", allForms.map(f => ({ id: f._id, name: f.name })));
      process.exit(1);
    }

    // Find Section 2 (id: s2) -> Child Statutory (id: s2_1)
    let updated = false;
    for (const section of form.structure) {
        if (section.id === 's2' || section.title.includes("Statutory")) {
            const statutoryNode = section.children.find(c => c.id === 's2_1' || c.title.includes("Statutory"));
            if (statutoryNode) {
                if (!statutoryNode.fields.find(f => f.id === 'gstNum' || f.id === 'gstin')) {
                    const gstFields = [
                        { id: "gstStatus", label: "GST Registration Status", type: "dropdown", required: true, options: ["Registered", "Unregistered", "Composition Scheme", "Export/SEZ"] },
                        { id: "gstNum", label: "GST Number", type: "text", required: true, validation: { pattern: "gst" } }
                    ];
                    statutoryNode.fields.unshift(...gstFields);
                    updated = true;
                    console.log("GST fields added to statutoryNode");
                }
            }
        }
    }

    if (updated) {
      form.markModified('structure');
      await form.save();
      console.log("Form updated successfully!");
    } else {
      console.log("No update needed or statutory section not found.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fix();
