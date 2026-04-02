const Joi = require("joi");

const vendorRegistrationSchema = Joi.object({
    companyName: Joi.string().required().messages({
        "string.empty": "Company name is required",
    }),
    contactPerson: Joi.string().required().messages({
        "string.empty": "Contact person is required",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required",
    }),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "Password is required",
    }),
    phone: Joi.string()
        .pattern(/^[0-9+\- ]{10,20}$/)
        .required()
        .messages({
            "string.pattern.base": "Please provide a valid phone number (e.g. +91 9898...)",
            "string.empty": "Phone number is required",
        }),
    serviceType: Joi.string().required().messages({
        "string.empty": "Service type is required",
    }),
    address: Joi.string().required().messages({
        "string.empty": "Address is required",
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = {
    vendorRegistrationSchema,
    loginSchema,
};
