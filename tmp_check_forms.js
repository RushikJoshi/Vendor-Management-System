const mongoose = require('mongoose');
const TreeForm = require('./server/models/TreeForm');
require('dotenv').config({ path: './server/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const forms = await TreeForm.find({});
  console.log('Total TreeForms:', forms.length);
  for (const f of forms) {
    console.log(`- ID: ${f._id}, Code: ${f.code}, Status: ${f.status}, name: ${f.name}`);
  }
  process.exit();
}
check();
