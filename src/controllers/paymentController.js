const Order = require("../models/Order");
const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.body.orderId,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cannot pay for a cancelled order"
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order has already been paid"
            });
        }

        const existingPayment = await Payment.findOne({
            order: order._id,
            status: {
                $in: ["created", "pending", "paid"]
            }
        }).sort({
            createdAt: -1
        });

        if (existingPayment) {
            return res.status(200).json({
                success: true,
                message: "Existing payment found",
                payment: existingPayment
            });
        }

        const payment = await Payment.create({
            order: order._id,
            user: req.user._id,

            // IMPORTANT:
            // Amount comes from the trusted server-side order.
            amountInPaise: order.totalAmountInPaise,

            currency: "INR",

            // Temporary provider until we integrate the real gateway.
            provider: "manual",

            status: "created"
        });

        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            payment
        });

    } catch (error) {
        console.error("Create payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        return res.status(200).json({
            success: true,
            payment
        });

    } catch (error) {
        console.error("Get payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createPayment,
    getPaymentById
};