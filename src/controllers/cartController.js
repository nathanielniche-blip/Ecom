const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { product, quantity } = req.body;

        const productData = await Product.findOne({
            _id: product,
            isActive: true
        })
            .select("name priceInPaise stock sku images category")
            .lean();

        if (!productData) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (productData.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity is not available"
            });
        }

        let cart = await Cart.findOne({
            user: userId
        });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [
                    {
                        product,
                        quantity
                    }
                ]
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.product.toString() === product
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                if (newQuantity > productData.stock) {
                    return res.status(400).json({
                        success: false,
                        message: "Requested quantity exceeds available stock"
                    });
                }

                if (newQuantity > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "Cart quantity cannot exceed 100"
                    });
                }

                existingItem.quantity = newQuantity;
            } else {
                cart.items.push({
                    product,
                    quantity
                });
            }

            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: "items.product",
                select: "name priceInPaise stock sku images category"
            })
            .lean();

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart: populatedCart
        });

    } catch (error) {
        console.error("Add cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({
            user: userId
        })
            .populate({
                path: "items.product",
                select: "name priceInPaise stock sku images category"
            })
            .lean();

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: []
                }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });

    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        const product = await Product.findOne({
            _id: productId,
            isActive: true
        })
            .select("stock")
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock"
            });
        }

        const cart = await Cart.findOne({
            user: userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (cartItem) =>
                cartItem.product.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: "items.product",
                select: "name priceInPaise stock sku images category"
            })
            .lean();

        res.status(200).json({
            success: true,
            message: "Cart item updated",
            cart: populatedCart
        });

    } catch (error) {
        console.error("Update cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const removeCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: userId
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const originalLength = cart.items.length;

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== productId
        );

        if (cart.items.length === originalLength) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart"
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        await Cart.findOneAndUpdate(
            {
                user: userId
            },
            {
                $set: {
                    items: []
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully"
        });

    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    addCartItem,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
};