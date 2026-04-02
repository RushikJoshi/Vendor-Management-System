const Department = require("../models/Department");
const asyncHandler = require("../utils/asyncHandler");

exports.getDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find({ tenantId: req.tenantId });
    res.status(200).json({ success: true, data: departments });
});

exports.createDepartment = asyncHandler(async (req, res, next) => {
    req.body.tenantId = req.tenantId;
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
});
