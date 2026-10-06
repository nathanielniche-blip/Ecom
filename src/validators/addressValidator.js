const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const postalCodeRegex = /^[A-Za-z0-9\s-]{3,20}$/;

const createAddressSchema = z.object({
    body: z.object({
        fullName: z.string()
            .trim()
            .min(2, "Full name must be at least 2 characters")
            .max(100, "Full name cannot exceed 100 characters"),

        phone: z.string()
            .trim()
            .regex(phoneRegex, "Invalid phone number"),

        addressLine1: z.string()
            .trim()
            .min(3, "Address line 1 must be at least 3 characters")
            .max(200, "Address line 1 cannot exceed 200 characters"),

        addressLine2: z.string()
            .trim()
            .max(200, "Address line 2 cannot exceed 200 characters")
            .optional(),

        city: z.string()
            .trim()
            .min(2, "City must be at least 2 characters")
            .max(100, "City cannot exceed 100 characters"),

        state: z.string()
            .trim()
            .min(2, "State must be at least 2 characters")
            .max(100, "State cannot exceed 100 characters"),

        postalCode: z.string()
            .trim()
            .regex(postalCodeRegex, "Invalid postal code"),

        country: z.string()
            .trim()
            .min(2, "Country must be at least 2 characters")
            .max(100, "Country cannot exceed 100 characters")
    }).strict(),

    params: z.object({}).strict(),

    query: z.object({}).strict()
});


const updateAddressSchema = z.object({
    body: z.object({
        fullName: z.string()
            .trim()
            .min(2, "Full name must be at least 2 characters")
            .max(100, "Full name cannot exceed 100 characters")
            .optional(),

        phone: z.string()
            .trim()
            .regex(phoneRegex, "Invalid phone number")
            .optional(),

        addressLine1: z.string()
            .trim()
            .min(3, "Address line 1 must be at least 3 characters")
            .max(200, "Address line 1 cannot exceed 200 characters")
            .optional(),

        addressLine2: z.string()
            .trim()
            .max(200, "Address line 2 cannot exceed 200 characters")
            .optional(),

        city: z.string()
            .trim()
            .min(2, "City must be at least 2 characters")
            .max(100, "City cannot exceed 100 characters")
            .optional(),

        state: z.string()
            .trim()
            .min(2, "State must be at least 2 characters")
            .max(100, "State cannot exceed 100 characters")
            .optional(),

        postalCode: z.string()
            .trim()
            .regex(postalCodeRegex, "Invalid postal code")
            .optional(),

        country: z.string()
            .trim()
            .min(2, "Country must be at least 2 characters")
            .max(100, "Country cannot exceed 100 characters")
            .optional()
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field must be provided"
        }
    ),

    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid address ID")
    }).strict(),

    query: z.object({}).strict()
});


const addressIdSchema = z.object({
    body: z.object({}).strict().optional(),

    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid address ID")
    }).strict(),

    query: z.object({}).strict()
});


module.exports = {
    createAddressSchema,
    updateAddressSchema,
    addressIdSchema
};