const express = require("express");

const {
    addCartItem,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require("../controllers/cartController");

const {
    protect
} = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
    addCartItemSchema,
    updateCartItemSchema,
    cartProductIdSchema,
    emptyRequestSchema
} = require("../validators/cartValidator");

const router = express.Router();

// All cart routes require authentication

router.get(
    "/",
    protect,
    validate(emptyRequestSchema),
    getCart
);

router.post(
    "/items",
    protect,
    validate(addCartItemSchema),
    addCartItem
);

router.patch(
    "/items/:productId",
    protect,
    validate(updateCartItemSchema),
    updateCartItem
);

router.delete(
    "/items/:productId",
    protect,
    validate(cartProductIdSchema),
    removeCartItem
);

router.delete(
    "/",
    protect,
    validate(emptyRequestSchema),
    clearCart
);

module.exports = router;