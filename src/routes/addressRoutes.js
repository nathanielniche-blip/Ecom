const express = require("express");

const {
    createAddress,
    getMyAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
    createAddressSchema,
    updateAddressSchema,
    addressIdSchema
} = require("../validators/addressValidator");

const router = express.Router();

router.get(
    "/",
    protect,
    getMyAddresses
);

router.get(
    "/:id",
    protect,
    validate(addressIdSchema),
    getAddressById
);

router.post(
    "/",
    protect,
    validate(createAddressSchema),
    createAddress
);

router.patch(
    "/:id",
    protect,
    validate(updateAddressSchema),
    updateAddress
);

router.delete(
    "/:id",
    protect,
    validate(addressIdSchema),
    deleteAddress
);

module.exports = router;