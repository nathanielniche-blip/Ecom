const express = require("express");
const rateLimit = require("express-rate-limit");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");

const {
    registerSchema,
    loginSchema
} = require("../validators/authValidator");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    registerUser
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    loginUser
);

router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

router.get(
    "/admin-test",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "You have admin access"
        });
    }
);

module.exports = router;