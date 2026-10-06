const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 200
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        // Price stored in paise.
        // Example: ₹999.99 = 99999
        priceInPaise: {
            type: Number,
            required: true,
            min: 0,
            max: 100000000000,
            validate: {
                validator: Number.isInteger,
                message: "Price must be a whole number of paise"
            }
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            max: 1000000,
            validate: {
                validator: Number.isInteger,
                message: "Stock must be a whole number"
            }
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            minlength: 2,
            maxlength: 100
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },

        images: [
            {
                type: String,
                trim: true,
                maxlength: 2048
            }
        ],

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

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 1 });
productSchema.index({ sku: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;