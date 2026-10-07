const express = require("express");

const {
    createPayment,
    getPaymentById
} = require("../controllers/paymentController");

const { protect,authorize } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
    createPaymentSchema,
    paymentIdSchema
} = require("../validators/paymentValidator");

const router = express.Router();

router.post(
    "/",
    protect,
    validate(createPaymentSchema),
    createPayment
);

router.get(
    "/:id",
    protect,
    validate(paymentIdSchema),
    getPaymentById
);

module.exports = router;