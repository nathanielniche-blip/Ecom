const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async ({
    amountInPaise,
    currency,
    receipt
}) => {
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
        throw new Error("Invalid payment amount");
    }

    if (currency !== "INR") {
        throw new Error("Unsupported payment currency");
    }

    if (!receipt || typeof receipt !== "string") {
        throw new Error("Invalid payment receipt");
    }

    const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt
    });

    return razorpayOrder;
};

module.exports = {
    createRazorpayOrder
};