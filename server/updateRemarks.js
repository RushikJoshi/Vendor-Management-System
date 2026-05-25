const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gt_vendor_management").then(async () => {
  const db = mongoose.connection.db;
  const settings = await db.collection("procurementsettings").findOne({});
  if (settings && settings.SO) {
     settings.SO.remarks = "ALL terms followed/mentioned as per mutual service agreement\n(Master Service Agreement).";
     await db.collection("procurementsettings").updateOne({ _id: settings._id }, { $set: { "SO.remarks": settings.SO.remarks } });
     console.log("Updated SO remarks!");
  }
  process.exit(0);
});
