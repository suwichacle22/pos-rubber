import { action, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import {
	paidType,
	productSplitFarmerEmployeeType,
	promotionType,
} from "../schema";

export const createFarmer = mutation({
	args: {
		displayName: v.string(),
		phone: v.optional(v.string()),
	},
	returns: v.any(),
	handler: async ({ db }, args) => {
		const isFarmerExist = await db
			.query("farmers")
			.withIndex("by_displayName", (q) => q.eq("displayName", args.displayName))
			.unique();
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

export const createCarlicense = mutation({
	args: {
		farmerId: v.id("farmers"),
		licensePlate: v.string(),
	},
	returns: v.any(),
	handler: async ({ db }, args) => {
		const newCarlicenseId = await db.insert("carlicenses", {
			farmerId: args.farmerId,
			licensePlate: args.licensePlate,
		});
		const newCarlicense = await db.get(newCarlicenseId);
		return newCarlicense;
	},
});

export const createEmployee = mutation({
	args: {
		farmerId: v.id("farmers"),
		displayName: v.string(),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
	},
	returns: v.any(),
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
	returns: v.id("products"),
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
	returns: v.id("productPrices"),
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
	returns: v.id("transactionGroups"),
	handler: async ({ db }, args) => {
		const newTransactionGroupId = await db.insert("transactionGroups", {
			farmerId: args.farmerId,
			status: args.status,
			groupName: args.groupName,
		});
		//autogenerate 1st transaction line
		await db.insert("transactionLines", {
			transactionGroupId: newTransactionGroupId,
		});

		return newTransactionGroupId;
	},
});

export const addTransactionLine = mutation({
	args: {
		transactionGroupId: v.id("transactionGroups"),
	},
	returns: v.id("transactionLines"),
	handler: async ({ db }, args) => {
		const newTransactionLineId = await db.insert("transactionLines", {
			transactionGroupId: args.transactionGroupId,
		});
		return newTransactionLineId;
	},
});

export const deleteTransactionLine = mutation({
	args: {
		transactionLineId: v.id("transactionLines"),
	},
	returns: v.null(),
	handler: async ({ db }, args) => {
		await db.delete(args.transactionLineId);
		return null;
	},
});

export const deleteTransactionGroup = mutation({
	args: {
		transactionGroupId: v.id("transactionGroups"),
	},
	returns: v.null(),
	handler: async ({ db }, args) => {
		await db.delete(args.transactionGroupId);
		return null;
	},
});

export const updateTransactionGroup = mutation({
	args: {
		transactionGroupId: v.id("transactionGroups"),
		farmerId: v.optional(v.id("farmers")),
		groupName: v.optional(v.string()),
		status: v.union(v.literal("pending"), v.literal("submitted")),
	},
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionGroup = await db.get(args.transactionGroupId);
		if (!transactionGroup) {
			throw new Error("Transaction group not found");
		}
		return await db.patch(args.transactionGroupId, {
			farmerId: args.farmerId,
			groupName: args.groupName,
			status: args.status,
		});
	},
});

export const updateTransactionLine = mutation({
	args: {
		transactionLines: v.array(
			v.object({
				transactionLineId: v.id("transactionLines"),
				employeeId: v.optional(v.id("employees")),
				productId: v.optional(v.id("products")),
				isVehicle: v.optional(v.boolean()),
				carLicenseId: v.optional(v.id("carlicenses")),
				weightVehicleIn: v.optional(v.number()),
				weightVehicleOut: v.optional(v.number()),
				weight: v.optional(v.number()),
				price: v.optional(v.number()),
				totalAmount: v.optional(v.number()),
				isSplit: v.optional(productSplitFarmerEmployeeType),
				farmerRatio: v.optional(v.number()),
				employeeRatio: v.optional(v.number()),
				farmerAmount: v.optional(v.number()),
				employeeAmount: v.optional(v.number()),
				isTransportationFee: v.optional(v.boolean()),
				transportationFee: v.optional(v.number()),
				transportationFeeAmount: v.optional(v.number()),
				transportationFeeFarmerAmount: v.optional(v.number()),
				transportationFeeEmployeeAmount: v.optional(v.number()),
				farmerPaidType: v.optional(paidType),
				employeePaidType: v.optional(paidType),
				isHarvestRate: v.optional(v.boolean()),
				harvestRate: v.optional(v.number()),
				promotionRate: v.optional(v.number()),
				promotionTo: v.optional(promotionType),
				promotionAmount: v.optional(v.number()),
				totalNetAmount: v.optional(v.number()),
			}),
		),
	},
	returns: v.array(v.any()),
	handler: async ({ db }, args) => {
		const results = [];
		for (const lineArg of args.transactionLines) {
			const { transactionLineId, ...patchFields } = lineArg;
			const line = await db.get(transactionLineId);
			if (!line) {
				throw new Error(`Transaction line not found: ${transactionLineId}`);
			}
			const patch: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(patchFields)) {
				if (value !== undefined) {
					patch[key] = value;
				}
			}
			await db.patch(transactionLineId, patch);
			results.push(await db.get(transactionLineId));
		}
		return results;
	},
});
