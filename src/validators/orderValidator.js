const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const orderIdSchema = z.object({
    body: z.object({}).strict().optional(),

    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid order ID")
    }).strict(),

    query: z.object({}).strict()
});

const emptyRequestSchema = z.object({
    body: z.object({}).strict().optional(),
    params: z.object({}).strict(),
    query: z.object({}).strict()
});

const updateOrderStatusSchema = z.object({
    body: z.object({
        status: z.enum([
            "confirmed",
            "processing",
            "shipped",
            "delivered"
        ])
    }).strict(),
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid order ID")
    }).strict(),
    query: z.object({}).strict()
});

module.exports = {
    orderIdSchema,
    emptyRequestSchema,
    updateOrderStatusSchema
};