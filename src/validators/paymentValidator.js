const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const createPaymentSchema = z.object({
    body: z.object({
        orderId: z.string().regex(objectIdRegex, "Invalid order ID")
    }).strict(),

    params: z.object({}).strict(),

    query: z.object({}).strict()
});

const paymentIdSchema = z.object({
    body: z.object({}).strict().optional(),

    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid payment ID")
    }).strict(),

    query: z.object({}).strict()
});

module.exports = {
    createPaymentSchema,
    paymentIdSchema
};