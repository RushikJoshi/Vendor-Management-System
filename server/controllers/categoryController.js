const Category = require("../models/Category");
const AuditService = require("../services/AuditService");

// Create Category (Admin Only)
exports.createCategory = async (req, res) => {
    try {
        const { name, description, status, criteria } = req.body;
        const category = await Category.create({ name, description, status, criteria });
        await AuditService.logCreate(req, "Category", category);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const Vendor = require("../models/vendor.model");
const VendorApplication = require("../models/VendorApplication");

// Get All Categories (Master Module)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });

        // 🛠️ HEALING 4.0: Forgiving Global Sync
        const TreeSubmission = require("../models/TreeSubmission");
        const allVendors = await Vendor.find({});
        const allSubmissions = await TreeSubmission.find({});
        
        for (const v of allVendors) {
            const currentCatId = v.category?.toString();
            const categoryExists = categories.some(c => c._id.toString() === currentCatId);
            
            if (!categoryExists) {
                // This vendor is orphaned or linked to a TreeForm. Find its submission.
                const sub = allSubmissions.find(s => 
                    (s.vendorEmail && v.email && s.vendorEmail.toLowerCase() === v.email.toLowerCase()) ||
                    (s.vendorName && v.companyName && s.vendorName.toLowerCase() === v.companyName.toLowerCase()) ||
                    (s.vendorName && v.name && s.vendorName.toLowerCase() === v.name.toLowerCase())
                );

                if (sub) {
                    // Determine the category name from submission
                    let targetName = sub.categoryName || "";
                    
                    // Fallback to searching submission data for Category fields
                    if (!targetName || targetName.toLowerCase() === "general") {
                        const catField = sub.data?.find(d => /category/i.test(d.label));
                        if (catField?.value) targetName = catField.value;
                    }

                    if (targetName) {
                        // If it's a breadcrumb, get the last part
                        if (targetName.includes(">")) {
                            const parts = targetName.split(">");
                            targetName = parts[parts.length - 1].split("(")[0].trim();
                        }

                        // Match against existing categories (case-insensitive)
                        const matchingCat = categories.find(c => {
                            if (!c || !c.name) return false;
                            const cn = c.name.trim().toLowerCase();
                            const tn = targetName.trim().toLowerCase();
                            return cn === tn || tn.includes(cn) || cn.includes(tn);
                        });

                        if (matchingCat) {
                            await Vendor.findByIdAndUpdate(v._id, { category: matchingCat._id });
                            console.log(`✅ Healed vendor ${v.companyName || v.name || 'Unknown'} -> ${matchingCat.name}`);
                        }
                    }
                }
            }
        }
        
        // Enrich with vendor and applicant counts
        const enriched = await Promise.all(categories.map(async (cat) => {
            const vendorCount = await Vendor.countDocuments({ category: cat._id });
            // Fix: status is lowercase in model
            const applicantCount = await VendorApplication.countDocuments({ 
                category: cat._id, 
                status: { $nin: ["approved", "rejected"] } 
            });
            
            const obj = cat.toObject();
            obj.vendorCount = vendorCount;
            obj.applicantCount = applicantCount;
            return obj;
        }));

        res.status(200).json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get Single Category for Public/Vendor (By ID)
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        // 🛠️ TARGETED SELF-HEALING: Find vendors that SHOULD be in this category
        const TreeSubmission = require("../models/TreeSubmission");
        
        // Find vendors with this email pattern or name who have a submission matching this category
        const submissions = await TreeSubmission.find({
            $or: [
                { categoryName: { $regex: new RegExp(category.name, "i") } },
                { formName: { $regex: new RegExp(category.name, "i") } }
            ]
        });

        if (submissions.length > 0) {
            const emails = submissions.map(s => s.vendorEmail).filter(Boolean);
            const names = submissions.map(s => s.vendorName).filter(Boolean);
            
            const result = await Vendor.updateMany(
                { 
                    $or: [
                        { email: { $in: emails } },
                        { companyName: { $in: names } }
                    ],
                    category: { $ne: category._id } // Not already linked
                },
                { $set: { category: category._id } }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ Targeted Healed ${result.modifiedCount} vendors for category: ${category.name}`);
            }
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "Category not found" });

        const beforeData = category.toObject();
        category.set(req.body);
        await category.save();

        const afterData = category.toObject();
        await AuditService.logUpdate(req, "Category", category._id, beforeData, afterData);

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            const beforeData = category.toObject();
            await Category.findByIdAndDelete(req.params.id);
            await AuditService.log({
                req,
                actionType: "RECORD_DELETED",
                entityType: "Category",
                entityId: category._id,
                beforeData
            });
        }
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
