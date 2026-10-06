const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            priceInPaise,
            stock,
            sku,
            category,
            images
        } = req.body;

        // Make sure the category exists and is active
        const existingCategory = await Category.findOne({
            _id: category,
            isActive: true
        });

        if (!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Invalid or inactive category"
            });
        }

        const existingProduct = await Product.findOne({
            sku
        });

        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        const product = await Product.create({
            name,
            description,
            priceInPaise,
            stock,
            sku,
            category,
            images
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        console.error("Create product error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true
        })
            .populate({
                path: "category",
                select: "name slug"
            })
            .select(
                "name description priceInPaise stock sku category images"
            )
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findOne({
            _id: id,
            isActive: true
        })
            .populate({
                path: "category",
                select: "name slug"
            })
            .select(
                "name description priceInPaise stock sku category images"
            )
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get product error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const allowedUpdates = {};

        if (req.body.name !== undefined) {
            allowedUpdates.name = req.body.name;
        }

        if (req.body.description !== undefined) {
            allowedUpdates.description = req.body.description;
        }

        if (req.body.priceInPaise !== undefined) {
            allowedUpdates.priceInPaise = req.body.priceInPaise;
        }

        if (req.body.stock !== undefined) {
            allowedUpdates.stock = req.body.stock;
        }

        if (req.body.sku !== undefined) {
            allowedUpdates.sku = req.body.sku;
        }

        if (req.body.category !== undefined) {
            const category = await Category.findOne({
                _id: req.body.category,
                isActive: true
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or inactive category"
                });
            }

            allowedUpdates.category = req.body.category;
        }

        if (req.body.images !== undefined) {
            allowedUpdates.images = req.body.images;
        }

        if (req.body.isActive !== undefined) {
            allowedUpdates.isActive = req.body.isActive;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            allowedUpdates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "SKU already exists"
            });
        }

        console.error("Update product error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deactivated successfully"
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};