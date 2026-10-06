const { z } = require("zod");

const categoryCreateSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2, "Category name must be at least 2 characters")
                .max(100, "Category name cannot exceed 100 characters"),

            slug: z
                .string()
                .trim()
                .toLowerCase()
                .regex(
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    "Slug can only contain lowercase letters, numbers and hyphens"
                )
                .min(2, "Slug must be at least 2 characters")
                .max(120, "Slug cannot exceed 120 characters"),

            description: z
                .string()
                .trim()
                .max(1000, "Description cannot exceed 1000 characters")
                .optional(),

            image: z
                .string()
                .trim()
                .url("Image must be a valid URL")
                .max(2048, "Image URL is too long")
                .optional()
        })
        .strict(),

    params: z.object({}).strict(),
    query: z.object({}).strict()
});


const categoryUpdateSchema = z.object({
    body: z
        .object({
            name: z
                .string()
                .trim()
                .min(2)
                .max(100)
                .optional(),

            slug: z
                .string()
                .trim()
                .toLowerCase()
                .regex(
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    "Invalid slug"
                )
                .max(120)
                .optional(),

            description: z
                .string()
                .trim()
                .max(1000)
                .optional(),

            image: z
                .string()
                .trim()
                .url("Image must be a valid URL")
                .max(2048)
                .optional(),

            isActive: z
                .boolean()
                .optional()
        })
        .strict(),

    params: z.object({
        id: z
            .string()
            .regex(
                /^[a-f\d]{24}$/i,
                "Invalid category ID"
            )
    }).strict(),

    query: z.object({}).strict()
});


const categoryIdSchema = z.object({
    body: z
        .object({})
        .strict()
        .optional(),

    params: z.object({
        id: z
            .string()
            .regex(
                /^[a-f\d]{24}$/i,
                "Invalid category ID"
            )
    }).strict(),

    query: z.object({}).strict()
});

module.exports = {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryIdSchema
};