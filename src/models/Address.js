const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        phone: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            maxlength: 20
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 200
        },

        addressLine2: {
            type: String,
            trim: true,
            maxlength: 200
        },

        city: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        state: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 20
        },

        country: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
            default: "India"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

addressSchema.index({
    user: 1,
    createdAt: -1
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;