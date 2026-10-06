const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const addCartItemSchema = z.object({
    body: z
        .object({
            product: z
                .string()
                .regex(objectIdRegex, "Invalid product ID"),

            quantity: z
                .number()
                .int("Quantity must be a whole number")
                .min(1, "Quantity must be at least 1")
                .max(100, "Quantity cannot exceed 100")
        })
        .strict(),

    params: z.object({}).strict(),
    query: z.object({}).strict()
});

const updateCartItemSchema = z.object({
    body: z
        .object({
            quantity: z
                .number()
                .int("Quantity must be a whole number")
                .min(1, "Quantity must be at least 1")
                .max(100, "Quantity cannot exceed 100")
        })
        .strict(),

    params: z.object({
        productId: z
            .string()
            .regex(objectIdRegex, "Invalid product ID")
    }).strict(),

    query: z.object({}).strict()
});

const cartProductIdSchema = z.object({
    body: z
        .object({})
        .strict()
        .optional(),

    params: z.object({
        productId: z
            .string()
            .regex(objectIdRegex, "Invalid product ID")
    }).strict(),

    query: z.object({}).strict()
});

const emptyRequestSchema = z.object({
    body: z
        .object({})
        .strict()
        .optional(),

    params: z.object({}).strict(),
    query: z.object({}).strict()
});

module.exports = {
    addCartItemSchema,
    updateCartItemSchema,
    cartProductIdSchema,
    emptyRequestSchema
};