const mongoose = require("mongoose");

const formTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        sections: [
            {
                sectionTitle: String,
                order: Number,
                fields: [
                    {
                        fieldId: String,
                        label: String,
                        type: {
                            type: String,
                            enum: ["text", "number", "email", "date", "textarea", "dropdown", "checkbox", "file"],
                            default: "text",
                        },
                        placeholder: String,
                        required: { type: Boolean, default: false },
                        validation: {
                            minLength: Number,
                            maxLength: Number,
                            regex: String,
                            min: Number,
                            max: Number
                        },
                        options: [String], // only for dropdown
                        order: Number,
                        dependsOn: String,    // ID/Label of the parent field
                        dependsOnValue: String // Value of parent field that triggers this field
                    },
                ],
            },
        ],
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        version: {
            type: Number,
            default: 1,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        publishedAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("FormTemplate", formTemplateSchema);
