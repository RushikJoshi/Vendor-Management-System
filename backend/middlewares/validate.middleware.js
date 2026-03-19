/**
 * Reusable Joi validation middleware
 * @param {Joi.Schema} schema - The Joi schema to validate against
 */
const validate = (schema) => {
    return (req, res, next) => {
        const options = {
            abortEarly: false, // Include all errors, not just the first one
            allowUnknown: true, // Allow fields not defined in schema (like __v etc)
            stripUnknown: true, // Remove extra fields that are not in schema
        };

        const { error, value } = schema.validate(req.body, options);

        if (error) {
            // Format the error into the requested professional format
            const formattedErrors = error.details.map((detail) => ({
                field: detail.path[detail.path.length - 1], // Last key in path
                message: detail.message.replace(/"/g, ""), // Cleaner message
            }));

            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: formattedErrors,
            });
        }

        // Replace req.body with validated and sanitized values
        req.body = value;
        next();
    };
};

module.exports = validate;
