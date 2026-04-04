const mongoose = require('mongoose');
const TreeForm = require('./models/TreeForm');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const forms = await TreeForm.find({});
  console.log('Total TreeForms:', forms.length);
  for (const f of forms) {
    console.log(`- ID: ${f._id}, Code: ${f.code}, Status: ${f.status}, Name: ${f.name}`);
  }
  process.exit();
}
check();
