const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 2,
            maxlength: 120
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000
        },

        image: {
            type: String,
            trim: true,
            maxlength: 2048
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;