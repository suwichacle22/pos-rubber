import { action, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { ConvexError, v } from "convex/values";
import {
	paidType,
	productSplitFarmerEmployeeType,
	productSplitType,
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

export const updateProduct = mutation({
	args: {
		productId: v.id("products"),
		productLines: v.optional(v.number()),
	},
	returns: v.null(),
	handler: async ({ db }, args) => {
		const product = await db.get(args.productId);
		if (!product) {
			throw new Error("Product not found");
		}
		await db.patch(args.productId, {
			productLines: args.productLines,
		});
		return null;
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
		// Delete all associated transaction lines first
		const lines = await db
			.query("transactionLines")
			.withIndex("by_transactionGroupId", (q) =>
				q.eq("transactionGroupId", args.transactionGroupId),
			)
			.collect();
		for (const line of lines) {
			await db.delete(line._id);
		}
		// Then delete the group
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
				employeeId: v.optional(v.union(v.id("employees"), v.null())),
				productId: v.optional(v.union(v.id("products"), v.null())),
				isVehicle: v.optional(v.boolean()),
				carLicenseId: v.optional(v.union(v.id("carlicenses"), v.null())),
				weightVehicleIn: v.optional(v.union(v.number(), v.null())),
				weightVehicleOut: v.optional(v.union(v.number(), v.null())),
				weight: v.optional(v.union(v.number(), v.null())),
				price: v.optional(v.union(v.number(), v.null())),
				totalAmount: v.optional(v.union(v.number(), v.null())),
				isSplit: v.optional(productSplitFarmerEmployeeType),
				farmerRatio: v.optional(v.union(v.number(), v.null())),
				employeeRatio: v.optional(v.union(v.number(), v.null())),
				farmerAmount: v.optional(v.union(v.number(), v.null())),
				employeeAmount: v.optional(v.union(v.number(), v.null())),
				isTransportationFee: v.optional(v.boolean()),
				transportationFee: v.optional(v.union(v.number(), v.null())),
				transportationFeeAmount: v.optional(v.union(v.number(), v.null())),
				transportationFeeFarmerAmount: v.optional(v.union(v.number(), v.null())),
				transportationFeeEmployeeAmount: v.optional(v.union(v.number(), v.null())),
				farmerPaidType: v.optional(paidType),
				employeePaidType: v.optional(paidType),
				isHarvestRate: v.optional(v.boolean()),
				harvestRate: v.optional(v.union(v.number(), v.null())),
				promotionRate: v.optional(v.union(v.number(), v.null())),
				promotionTo: v.optional(v.union(promotionType, v.null())),
				promotionAmount: v.optional(v.union(v.number(), v.null())),
				totalNetAmount: v.optional(v.union(v.number(), v.null())),
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
				if (value === null) {
					// null means "clear this field" — set to undefined to remove from document
					patch[key] = undefined;
				} else if (value !== undefined) {
					patch[key] = value;
				}
			}
			await db.patch(transactionLineId, patch);
			results.push(await db.get(transactionLineId));
		}
		return results;
	},
});

export const upsertSplitDefaultIfMissing = mutation({
	args: {
		employeeId: v.id("employees"),
		productId: v.id("products"),
		splitType: productSplitType,
		isSplit: v.optional(productSplitFarmerEmployeeType),
		farmerSplitRatio: v.optional(v.number()),
		employeeSplitRatio: v.optional(v.number()),
		isHarvestRate: v.optional(v.boolean()),
		harvestRate: v.optional(v.number()),
		isTransportationFee: v.optional(v.boolean()),
		transportationFee: v.optional(v.number()),
		promotionTo: v.optional(promotionType),
		promotionRate: v.optional(v.number()),
		farmerPaidType: v.optional(paidType),
		employeePaidType: v.optional(paidType),
	},
	returns: v.any(),
	handler: async ({ db }, args) => {
		const existing = await db
			.query("splitDefaults")
			.withIndex("by_employeeId_and_productId", (q) =>
				q
					.eq("employeeId", args.employeeId)
					.eq("productId", args.productId),
			)
			.unique();
		if (existing) {
			return { created: false };
		}
		const id = await db.insert("splitDefaults", {
			employeeId: args.employeeId,
			productId: args.productId,
			splitType: args.splitType,
			isSplit: args.isSplit,
			farmerSplitRatio: args.farmerSplitRatio,
			employeeSplitRatio: args.employeeSplitRatio,
			isHarvestRate: args.isHarvestRate,
			harvestRate: args.harvestRate,
			isTransportationFee: args.isTransportationFee,
			transportationFee: args.transportationFee,
			promotionTo: args.promotionTo,
			promotionRate: args.promotionRate,
			farmerPaidType: args.farmerPaidType,
			employeePaidType: args.employeePaidType,
		});
		return { created: true, id };
	},
});

export const updateSplitDefault = mutation({
	args: {
		splitDefaultId: v.id("splitDefaults"),
		isSplit: v.optional(productSplitFarmerEmployeeType),
		farmerSplitRatio: v.optional(v.number()),
		employeeSplitRatio: v.optional(v.number()),
		isHarvestRate: v.optional(v.boolean()),
		harvestRate: v.optional(v.number()),
		isTransportationFee: v.optional(v.boolean()),
		transportationFee: v.optional(v.number()),
		promotionTo: v.optional(promotionType),
		promotionRate: v.optional(v.number()),
		farmerPaidType: v.optional(paidType),
		employeePaidType: v.optional(paidType),
	},
	returns: v.null(),
	handler: async ({ db }, args) => {
		const { splitDefaultId, ...fields } = args;
		const existing = await db.get(splitDefaultId);
		if (!existing) throw new Error("Split default not found");
		const splitType = fields.isHarvestRate ? "per_kg" as const : "percentage" as const;
		await db.patch(splitDefaultId, { ...fields, splitType });
		return null;
	},
});

export const deleteSplitDefault = mutation({
	args: {
		splitDefaultId: v.id("splitDefaults"),
	},
	returns: v.null(),
	handler: async ({ db }, args) => {
		await db.delete(args.splitDefaultId);
		return null;
	},
});
