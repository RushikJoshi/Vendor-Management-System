const Joi = require("joi");
const { errorResponse } = require("../utils/responseHandler");

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return errorResponse(res, "Validation Error", errorMessages, 400);
    }
    next();
};

const schemas = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
    registerVendor: Joi.object({
        companyName: Joi.string().required().min(3),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
        phone: Joi.string().required(),
        address: Joi.string().required(),
    }),
    updateStatus: Joi.object({
        status: Joi.string().required().valid("approved", "rejected", "changes_requested"),
        remarks: Joi.string().optional().max(500),
    })
};

module.exports = {
    validate,
    schemas
};
