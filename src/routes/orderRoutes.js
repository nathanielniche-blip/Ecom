const express = require("express");

const {
    createOrder,getOrderById,getMyOrders,cancelOrder,updateOrderStatus
} = require("../controllers/orderController");

const { protect,authorize } = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
    createOrderSchema,
    orderIdSchema,
    emptyRequestSchema,
    updateOrderStatusSchema,

} = require("../validators/orderValidator");

const router = express.Router();

router.get(
    "/",
    protect,
    validate(emptyRequestSchema),
    getMyOrders
);



router.patch(
    "/:id/cancel",
    protect,
    validate(orderIdSchema),
    cancelOrder
);
router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    validate(updateOrderStatusSchema),
    updateOrderStatus
);

router.get(
    "/:id",
    protect,
    validate(orderIdSchema),
    getOrderById
);

router.post(
    "/",
    protect,
    validate(createOrderSchema),
    createOrder
);

module.exports = router;