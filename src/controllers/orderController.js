const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const userId = req.user._id;

        const cart = await Cart.findOne({
            user: userId
        }).session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const orderItems = [];
        let totalAmountInPaise = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findOne({
                _id: cartItem.product,
                isActive: true
            }).session(session);

            if (!product) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: "One or more products are no longer available"
                });
            }

            if (product.stock < cartItem.quantity) {
                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                });
            }

            const itemTotal =
                product.priceInPaise * cartItem.quantity;

            totalAmountInPaise += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                sku: product.sku,
                priceInPaise: product.priceInPaise,
                quantity: cartItem.quantity
            });
        }

        for (const cartItem of cart.items) {
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: cartItem.product,
                    isActive: true,
                    stock: {
                        $gte: cartItem.quantity
                    }
                },
                {
                    $inc: {
                        stock: -cartItem.quantity
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!updatedProduct) {
                await session.abortTransaction();

                return res.status(409).json({
                    success: false,
                    message: "Stock changed while placing the order. Please try again."
                });
            }
        }

        const [order] = await Order.create(
            [
                {
                    user: userId,
                    items: orderItems,
                    totalAmountInPaise,
                    status: "pending",
                    paymentStatus: "pending"
                }
            ],
            {
                session
            }
        );

        cart.items = [];

        await cart.save({
            session
        });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });

    } catch (error) {
        await session.abortTransaction();

        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    } finally {
        await session.endSession();
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 10, 1),
            50
        );

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({
                user: req.user._id
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Order.countDocuments({
                user: req.user._id
            })
        ]);

        return res.status(200).json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).session(session);

        if (!order) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (!["pending", "confirmed"].includes(order.status)) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "This order cannot be cancelled"
            });
        }

        for (const item of order.items) {
            const product = await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity
                    }
                },
                {
                    new: true,
                    session
                }
            );

            if (!product) {
                await session.abortTransaction();

                return res.status(409).json({
                    success: false,
                    message: "Unable to restore stock for one or more products"
                });
            }
        }

        order.status = "cancelled";

        await order.save({
            session
        });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        await session.abortTransaction();

        console.error("Cancel order error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    } finally {
        await session.endSession();
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const currentStatus = order.status;
        const newStatus = req.body.status;

        const allowedTransitions = {
            pending: ["confirmed"],
            confirmed: ["processing"],
            processing: ["shipped"],
            shipped: ["delivered"]
        };

        if (
            !allowedTransitions[currentStatus] ||
            !allowedTransitions[currentStatus].includes(newStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status transition from ${currentStatus} to ${newStatus}`
            });
        }

        order.status = newStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    cancelOrder,
    updateOrderStatus
};