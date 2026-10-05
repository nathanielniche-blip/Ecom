const { z } = require("zod");

const registerSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2, "Name must be at least 2 characters")
                .max(100, "Name cannot exceed 100 characters"),

            email: z
                .string()
                .trim()
                .toLowerCase()
                .email("Invalid email address")
                .max(254, "Email is too long"),

            password: z
                .string()
                .min(8, "Password must be at least 8 characters")
                .max(128, "Password cannot exceed 128 characters")
        })
        .strict(),

    params: z.object({}).strict(),

    query: z.object({}).strict()
});

const loginSchema = z.object({
    body: z
        .object({
            email: z
                .string()
                .trim()
                .toLowerCase()
                .email("Invalid email address")
                .max(254, "Email is too long"),

            password: z
                .string()
                .min(1, "Password is required")
                .max(128, "Password is too long")
        })
        .strict(),

    params: z.object({}).strict(),

    query: z.object({}).strict()
});

module.exports = {
    registerSchema,
    loginSchema
};