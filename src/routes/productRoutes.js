const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
    productCreateSchema,
    productUpdateSchema,
    productIdSchema
} = require("../validators/productValidator");

const router = express.Router();

// Public routes

router.get(
    "/",
    getProducts
);

router.get(
    "/:id",
    validate(productIdSchema),
    getProductById
);


// Admin routes

router.post(
    "/",
    protect,
    authorize("admin"),
    validate(productCreateSchema),
    createProduct
);

router.patch(
    "/:id",
    protect,
    authorize("admin"),
    validate(productUpdateSchema),
    updateProduct
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    validate(productIdSchema),
    deleteProduct
);

module.exports = router;