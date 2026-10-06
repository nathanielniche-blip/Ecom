const mongoose = require("mongoose");
const Category = require("../models/Category");


const createCategory = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            image
        } = req.body;

        const existingCategory = await Category.findOne({
            $or: [
                { name },
                { slug }
            ]
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category name or slug already exists"
            });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Category name or slug already exists"
        });
    }
    console.error("Create category error:", error);
    return res.status(500).json({
        success: false,
        message: "Server error"
    });
    }
};


const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            isActive: true
        })
            .select("name slug description image")
            .sort({ name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error("Get categories error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findOne({
            _id: id,
            isActive: true
        })
            .select("name slug description image")
            .lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Get category error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const allowedUpdates = {};

        if (req.body.name !== undefined) {
            allowedUpdates.name = req.body.name;
        }

        if (req.body.slug !== undefined) {
            allowedUpdates.slug = req.body.slug;
        }

        if (req.body.description !== undefined) {
            allowedUpdates.description = req.body.description;
        }

        if (req.body.image !== undefined) {
            allowedUpdates.image = req.body.image;
        }

        if (req.body.isActive !== undefined) {
            allowedUpdates.isActive = req.body.isActive;
        }

        const category = await Category.findByIdAndUpdate(
            id,
            allowedUpdates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

} catch (error) {
    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Category name or slug already exists"
        });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
        success: false,
        message: "Server error"
    });
    }
};


const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID"
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deactivated successfully"
        });

    } catch (error) {
        console.error("Delete category error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};