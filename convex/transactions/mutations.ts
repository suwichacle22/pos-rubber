import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import {
	paidType,
	productSplitFarmerEmployeeType,
	customerType,
} from "../schema";

export const createFarmer = mutation({
	args: {
		displayName: v.string(),
		phone: v.optional(v.string()),
	},
	handler: async ({ db }, args) => {
		const isFarmerExist = await db
			.query("farmers")
			.withIndex("by_display_name", (q) =>
				q.eq("displayName", args.displayName),
			)
			.first();
		if (isFarmerExist) {
			throw new ConvexError("Farmer already exists");
		}
		const newFarmerId = await db.insert("farmers", {
			displayName: args.displayName,
			phone: args.phone,
		});
		const newFarmer = await db.get(newFarmerId);
		return newFarmer;
	},
});

export const createEmployee = mutation({
	args: {
		farmerId: v.id("farmers"),
		displayName: v.string(),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
	},
	handler: async ({ db }, args) => {
		const newEmployeeId = await db.insert("employees", {
			farmerId: args.farmerId,
			displayName: args.displayName,
			address: args.address,
			phone: args.phone,
		});
		const newEmployee = await db.get(newEmployeeId);
		return newEmployee;
	},
});

export const createProduct = mutation({
	args: {
		productName: v.string(),
	},
	handler: async ({ db }, args) => {
		const productName = args.productName.trim();
		if (!productName) {
			throw new Error("Product name is required");
		}

		const allProducts = await db.query("products").collect();
		const duplicated = allProducts.find(
			(product) =>
				product.productName.trim().toLowerCase() === productName.toLowerCase(),
		);
		if (duplicated) {
			throw new Error("Product name already exists");
		}

		return await db.insert("products", { productName });
	},
});

export const createProductPrice = mutation({
	args: {
		productId: v.id("products"),
		price: v.number(),
	},
	handler: async ({ db }, args) => {
		if (args.price <= 0) {
			throw new Error("Price must be greater than 0");
		}

		const product = await db.get(args.productId);
		if (!product) {
			throw new Error("Product not found");
		}

		return await db.insert("productPrices", {
			productId: args.productId,
			price: args.price,
		});
	},
});

export const createTransactionGroup = mutation({
	args: {
		farmerId: v.optional(v.id("farmers")),
		groupName: v.optional(v.string()),
		status: v.union(v.literal("pending"), v.literal("submitted")),
	},
	handler: async ({ db }, args) => {
		const newTransactionGroupId = await db.insert("transactionGroups", {
			farmerId: args.farmerId,
			status: args.status,
			groupName: args.groupName,
		});
		return newTransactionGroupId;
	},
});

export const addTransactionLine = mutation({
	args: {
		transactionLineNo: v.number(),
		transactionGroupId: v.id("transactionGroups"),
	},
	handler: async ({ db }, args) => {
		const newTransactionLineId = await db.insert("transactionLines", {
			transactionGroupId: args.transactionGroupId,
			transactionLineNo: args.transactionLineNo,
		});
		return newTransactionLineId;
	},
});

export const deleteTransactionLine = mutation({
	args: {
		transactionLineId: v.id("transactionLines"),
	},
	handler: async ({ db }, args) => {
		await db.delete(args.transactionLineId);
	},
});
