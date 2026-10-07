const mongoose = require("mongoose");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const {
    createRazorpayOrder
} = require("../services/razorpayService");


const allowedPaymentTransitions = {
    created: ["pending", "failed"],
    pending: ["paid", "failed"],
    paid: ["refunded"],
    failed: [],
    refunded: []
};

const canTransitionPayment = (currentStatus, newStatus) => {
    return (
        allowedPaymentTransitions[currentStatus] &&
        allowedPaymentTransitions[currentStatus].includes(newStatus)
    );
};
const updatePaymentStatus = async (
    paymentId,
    newStatus,
    extraFields = {}
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const payment = await Payment.findById(paymentId).session(session);

        if (!payment) {
            throw new Error("Payment not found");
        }

        if (!canTransitionPayment(payment.status, newStatus)) {
            throw new Error(
                `Invalid payment status transition from ${payment.status} to ${newStatus}`
            );
        }

        const order = await Order.findById(payment.order).session(session);

        if (!order) {
            throw new Error("Order linked to payment not found");
        }

        /*
         * Make sure the payment and order currently agree
         * before changing either one.
         */
        if (payment.status !== order.paymentStatus) {
        throw new Error(
            `Payment and order payment status are inconsistent: payment=${payment.status}, order=${order.paymentStatus}`
        );
}

        payment.status = newStatus;

        Object.assign(payment, extraFields);

        order.paymentStatus = newStatus;

        await payment.save({ session });
        await order.save({ session });

        await session.commitTransaction();

        return {
            payment,
            order
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;

    } finally {
        await session.endSession();
    }
};

const markPaymentPending = async (paymentId, extraFields = {}) => {
    return updatePaymentStatus(
        paymentId,
        "pending",
        extraFields
    );
};

const markPaymentPaid = async (paymentId, extraFields = {}) => {
    return updatePaymentStatus(
        paymentId,
        "paid",
        extraFields
    );
};

const markPaymentFailed = async (paymentId, failureReason = null) => {
    const extraFields = {};

    if (failureReason) {
        extraFields.failureReason = failureReason;
    }

    return updatePaymentStatus(
        paymentId,
        "failed",
        extraFields
    );
};

const markPaymentRefunded = async (paymentId, extraFields = {}) => {
    return updatePaymentStatus(
        paymentId,
        "refunded",
        extraFields
    );
};


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

        if (order.status !== "pending" &&
            order.status !== "confirmed" &&
            order.status !== "processing" &&
            order.status !== "shipped") {
            return res.status(400).json({
                success: false,
                message: "Order cannot accept payment in its current status"
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Order has already been paid"
            });
        }

        if (order.paymentStatus === "refunded") {
            return res.status(400).json({
                success: false,
                message: "Order payment has already been refunded"
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

        const razorpayOrder = await createRazorpayOrder({
            amountInPaise: order.totalAmountInPaise,
            currency: "INR",
            receipt: `order_${order._id}`
        });

        const payment = await Payment.create({
            order: order._id,
            user: req.user._id,
            amountInPaise: order.totalAmountInPaise,
            currency: "INR",
            provider: "razorpay",
            providerOrderId: razorpayOrder.id,
            status: "created"
        });

        return res.status(201).json({
                success: true,
                message: "Payment created successfully",
                payment,
                razorpayOrder
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
    getPaymentById,
    markPaymentPending,
    markPaymentPaid,
    markPaymentFailed,
    markPaymentRefunded
};