const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        amountInPaise: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Payment amount must be a whole number of paise"
            }
        },

        currency: {
            type: String,
            required: true,
            uppercase: true,
            default: "INR",
            enum: ["INR"]
        },

        provider: {
            type: String,
            required: true,
            enum: [
                "razorpay",
                "stripe",
                "manual"
            ]
        },

        providerPaymentId: {
            type: String,
            trim: true,
            maxlength: 200
        },

        providerOrderId: {
            type: String,
            trim: true,
            maxlength: 200
        },

        status: {
            type: String,
            required: true,
            enum: [
                "created",
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "created",
            index: true
        },

        failureReason: {
            type: String,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

paymentSchema.index({
    order: 1,
    createdAt: -1
});

paymentSchema.index(
    { provider: 1, providerPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            providerPaymentId: {
                $exists: true,
                $type: "string"
            }
        }
    }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;