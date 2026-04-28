const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers(['8.8.8.8']);

// Load models
require("../models/TreeForm");

const MONGO_URI = "mongodb+srv://mediamarek2025_db_user:gtpl2026@vendor.7hkgxdu.mongodb.net/vendorDB?retryWrites=true&w=majority";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const TreeForm = mongoose.model("TreeForm");
    const formId = "69e0a3b081cdd47b054611f6";
    const form = await TreeForm.findById(formId);

    if (!form) {
      console.log("Form not found!");
      process.exit(1);
    }

    let gstField = null;
    let originalSectionIndex = -1;
    let originalSubSectionIndex = -1;
    let originalFieldIndex = -1;

    // Deep search to find the GST Number field and remove it from its current position
    for (let i = 0; i < form.structure.length; i++) {
      const section = form.structure[i];
      for (let j = 0; j < (section.children || []).length; j++) {
        const subSection = section.children[j];
        for (let k = 0; k < (subSection.fields || []).length; k++) {
          const field = subSection.fields[k];
          if (/gst number/i.test(field.label) || /gstin/i.test(field.label)) {
            gstField = field;
            originalSectionIndex = i;
            originalSubSectionIndex = j;
            originalFieldIndex = k;
            break;
          }
        }
        if (gstField) break;
      }
      if (gstField) break;
    }

    if (!gstField) {
      console.log("GST Number field not found in form structure.");
      process.exit(1);
    }

    // Remove it from old location
    form.structure[originalSectionIndex].children[originalSubSectionIndex].fields.splice(originalFieldIndex, 1);
    console.log(`Found GST field at Section ${originalSectionIndex}, SubSection ${originalSubSectionIndex}, Field ${originalFieldIndex}`);

    // Add it to the top of the very first subsection of the first section
    if (form.structure[0] && form.structure[0].children[0] && form.structure[0].children[0].fields) {
      form.structure[0].children[0].fields.unshift(gstField);
      console.log("Successfully moved GST field to the top of the first section!");

      // Save the updated form
      form.markModified('structure');
      await form.save();
      console.log("Form updated in the database!");
    } else {
      console.log("Could not find the first section/subsection to place the field.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
