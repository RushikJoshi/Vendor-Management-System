const Joi = require("joi");

/**
 * Custom GST Validator Regex
 */
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const vendorValidationSchema = {
    createVendor: Joi.object({
        name: Joi.string().min(3).required().messages({
            "string.min": "Name must be at least 3 characters long",
            "any.required": "Name is required",
        }),
        email: Joi.string().email().required().messages({
            "string.email": "Please provide a valid email format",
            "any.required": "Email is required",
        }),
        phone: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
                "string.pattern.base": "Please provide a valid 10-digit Indian mobile number",
                "any.required": "Phone number is required",
            }),
        companyName: Joi.string().required().messages({
            "any.required": "Company name is required",
        }),
        gstNumber: Joi.string().uppercase().pattern(gstRegex).required().messages({
            "string.pattern.base": "Invalid Indian GST format. Example: 22AAAAA0000A1Z5",
            "any.required": "GST number is required",
        }),
        address: Joi.object({
            city: Joi.string().required().messages({
                "any.required": "City is required",
            }),
            state: Joi.string().required().messages({
                "any.required": "State is required",
            }),
            pincode: Joi.string()
                .length(6)
                .pattern(/^[0-9]+$/)
                .required()
                .messages({
                    "string.length": "Pincode must be exactly 6 digits",
                    "string.pattern.base": "Pincode must contain only digits",
                    "any.required": "Pincode is required",
                }),
        }).required(),
        status: Joi.string().valid("active", "inactive").default("active"),
        rating: Joi.number().min(0).max(5).optional(),
    }),

    updateVendor: Joi.object({
        name: Joi.string().min(3),
        email: Joi.string().email(),
        phone: Joi.string().pattern(/^\d{10,12}$/),
        companyName: Joi.string(),
        gstNumber: Joi.string().uppercase().pattern(gstRegex),
        address: Joi.object({
            city: Joi.string(),
            state: Joi.string(),
            pincode: Joi.string().length(6).pattern(/^[0-9]+$/),
        }),
        status: Joi.string().valid("active", "inactive", "suspended", "blacklisted"),
        category: Joi.string().allow("", null),
        lifecycleStatus: Joi.string().valid("active", "inactive", "suspended", "blacklisted"),
        rating: Joi.number().min(0).max(5),
    }).min(1), // At least one field should be provided for update
};

module.exports = vendorValidationSchema;
