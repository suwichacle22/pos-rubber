import { z } from "zod";

export const productAddFormSchema = z.object({
	productName: z
		.string("Product name is required")
		.min(1, "Product name is required")
		.transform((value) => value.trim())
		.refine((value) => value.length > 0, "Product name is required"),
});

export const productPriceAddFormSchema = z.object({
	price: z
		.string("Price is required")
		.min(1, "Price is required")
		.transform((value) => value.trim())
		.refine((value) => value.length > 0, "Price is required")
		.refine((value) => !Number.isNaN(Number(value)), "Price must be a number")
		.refine((value) => Number(value) > 0, "Price must be greater than 0"),
});