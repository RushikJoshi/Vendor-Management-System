const mongoose = require("mongoose");
require("./backend/models/User");
const User = mongoose.model("User");
mongoose.connect("mongodb+srv://mediamarek2025_db_user:gtpl2026@vendor.7hkgxdu.mongodb.net/vendorDB?retryWrites=true&w=majority")
.then(async () => {
    const users = await User.find({}).limit(10);
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
