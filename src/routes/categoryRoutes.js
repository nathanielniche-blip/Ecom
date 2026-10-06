const express = require("express");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryIdSchema
} = require("../validators/categoryValidator");

const router = express.Router();


// Public routes

router.get("/", getCategories);

router.get(
    "/:id",
    validate(categoryIdSchema),
    getCategoryById
);


// Admin routes

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(categoryCreateSchema),
    createCategory
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    validate(categoryUpdateSchema),
    updateCategory
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    validate(categoryIdSchema),
    deleteCategory
);


module.exports = router;