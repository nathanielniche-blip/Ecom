const { z } = require("zod");

const objectIdRegex = /^[a-f\d]{24}$/i;

const productCreateSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2, "Product name must be at least 2 characters")
                .max(200, "Product name cannot exceed 200 characters"),

            description: z
                .string()
                .trim()
                .min(1, "Product description is required")
                .max(5000, "Product description cannot exceed 5000 characters"),

            priceInPaise: z
                .number()
                .int("Price must be a whole number of paise")
                .min(0, "Price cannot be negative")
                .max(100000000000, "Price is too large"),

            stock: z
                .number()
                .int("Stock must be a whole number")
                .min(0, "Stock cannot be negative")
                .max(1000000, "Stock is too large"),

            sku: z
                .string()
                .trim()
                .toUpperCase()
                .min(2, "SKU must be at least 2 characters")
                .max(100, "SKU cannot exceed 100 characters")
                .regex(
                    /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/,
                    "SKU can only contain letters, numbers, hyphens and underscores"
                ),

            category: z
                .string()
                .regex(objectIdRegex, "Invalid category ID"),

            images: z
                .array(
                    z
                        .string()
                        .trim()
                        .url("Image must be a valid URL")
                        .max(2048, "Image URL is too long")
                )
                .max(10, "A product cannot have more than 10 images")
                .optional()
        })
        .strict(),

    params: z.object({}).strict(),
    query: z.object({}).strict()
});

const productUpdateSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2)
                .max(200)
                .optional(),

            description: z
                .string()
                .trim()
                .min(1)
                .max(5000)
                .optional(),

            priceInPaise: z
                .number()
                .int("Price must be a whole number of paise")
                .min(0)
                .max(100000000000)
                .optional(),

            stock: z
                .number()
                .int("Stock must be a whole number")
                .min(0)
                .max(1000000)
                .optional(),

            sku: z
                .string()
                .trim()
                .toUpperCase()
                .min(2)
                .max(100)
                .regex(
                    /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/,
                    "Invalid SKU"
                )
                .optional(),

            category: z
                .string()
                .regex(objectIdRegex, "Invalid category ID")
                .optional(),

            images: z
                .array(
                    z
                        .string()
                        .trim()
                        .url("Image must be a valid URL")
                        .max(2048)
                )
                .max(10)
                .optional(),

            isActive: z
                .boolean()
                .optional()
        })
        .strict(),

    params: z.object({
        id: z
            .string()
            .regex(objectIdRegex, "Invalid product ID")
    }).strict(),

    query: z.object({}).strict()
});

const productIdSchema = z.object({
    body: z
        .object({})
        .strict()
        .optional(),

    params: z.object({
        id: z
            .string()
            .regex(objectIdRegex, "Invalid product ID")
    }).strict(),

    query: z.object({}).strict()
});

module.exports = {
    productCreateSchema,
    productUpdateSchema,
    productIdSchema
};