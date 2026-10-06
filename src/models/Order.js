const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 100
        },

        priceInPaise: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Price must be a whole number of paise"
            }
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 100,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be a whole number"
            }
        }
    },
    {
        _id: false
    }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item"
            }
        },

        totalAmountInPaise: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Total amount must be a whole number of paise"
            }
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending",
            index: true
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending",
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

orderSchema.index({
    user: 1,
    createdAt: -1
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;