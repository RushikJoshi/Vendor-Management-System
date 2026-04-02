const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).json({
            success: false,
            message: errorMessages[0], // First error as main message
            errors: errorMessages,
        });
    }
    next();
};

module.exports = validate;
