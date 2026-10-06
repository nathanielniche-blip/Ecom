const Address = require("../models/Address");

const createAddress = async (req, res) => {
    try {
        const address = await Address.create({
            user: req.user._id,

            fullName: req.body.fullName,
            phone: req.body.phone,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country
        });

        return res.status(201).json({
            success: true,
            message: "Address created successfully",
            address
        });

    } catch (error) {
        console.error("Create address error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            addresses
        });

    } catch (error) {
        console.error("Get addresses error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getAddressById = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            address
        });

    } catch (error) {
        console.error("Get address error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        const allowedFields = [
            "fullName",
            "phone",
            "addressLine1",
            "addressLine2",
            "city",
            "state",
            "postalCode",
            "country"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                address[field] = req.body[field];
            }
        }

        await address.save();

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        });

    } catch (error) {
        console.error("Update address error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.error("Delete address error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    createAddress,
    getMyAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
};