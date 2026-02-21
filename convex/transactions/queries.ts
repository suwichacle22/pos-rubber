import { query } from "../_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";
import { getManyFrom } from "convex-helpers/server/relationships";
import { isSameDay } from "date-fns";

export const getFarmers = query({
	handler: async ({ db }) => {
		return await db.query("farmers").collect();
	},
});

export const getFarmersForm = query({
	handler: async ({ db }) => {
		const farmers = await db.query("farmers").collect();
		return farmers.map((farmer) => ({
			value: farmer._id as string,
			label: farmer.displayName,
		}));
	},
});

export const getFarmersWithEmployees = query({
	handler: async ({ db }) => {
		const farmers = await db.query("farmers").collect();
		const result = await asyncMap(farmers, async (farmer) => {
			const employees = await getManyFrom(
				db,
				"employees",
				"by_farmerId",
				farmer._id,
			);
			return { ...farmer, employees };
		});
		return result;
	},
});

export const getFarmersWithEmployeesById = query({
	args: { farmerId: v.id("farmers") },
	handler: async ({ db }, args) => {
		const farmer = await db.get(args.farmerId);
		if (!farmer) {
			throw new Error("Farmer not found");
		}
		const employees = await getManyFrom(
			db,
			"employees",
			"by_farmerId",
			farmer._id,
		);
		return { ...farmer, employees };
	},
});

export const getEmployeesByFarmerIdForm = query({
	args: { farmerId: v.id("farmers") },
	handler: async ({ db }, args) => {
		const employees = await getManyFrom(
			db,
			"employees",
			"by_farmerId",
			args.farmerId,
		);
		return employees.map((employee) => ({
			value: employee._id as string,
			label: employee.displayName,
		}));
	},
});

export const getProductForm = query({
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		return products.map((product) => ({
			value: product._id as string,
			label: product.productName,
		}));
	},
});

/** Returns product IDs whose name contains "ปาล์ม" (Palm). Use for filtering palm lines in the form. */
export const getProductPalmIds = query({
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		return products.filter((product) => product.productName.includes("ปาล์ม"));
	},
});

export const listProductsWithLatestPrice = query({
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		const productsWithPrice = await asyncMap(products, async (product) => {
			const prices = await db
				.query("productPrices")
				.withIndex("by_product", (q) => q.eq("productId", product._id))
				.collect();

			const sortedPrices = prices.sort(
				(a, b) => b._creationTime - a._creationTime,
			);
			const latest = sortedPrices[0] ?? null;

			return {
				...product,
				latestPrice: latest?.price ?? null,
				latestPriceAt: latest?._creationTime ?? null,
				priceHistory: sortedPrices.slice(0, 5),
			};
		});

		return productsWithPrice.sort((a, b) => b._creationTime - a._creationTime);
	},
});

export const getTransactionGroup = query({
	handler: async ({ db }) => {
		const transactionGroups = await db
			.query("transactionGroups")
			.order("desc")
			.collect();

		return transactionGroups;
	},
});

export const getPendingTransactionGroup = query({
	handler: async ({ db }) => {
		const transactionGroups = await db
			.query("transactionGroups")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.order("desc")
			.collect();

		return transactionGroups;
	},
});

export const getTransactionGroupById = query({
	args: { groupId: v.id("transactionGroups") },
	handler: async ({ db }, args) => {
		const transactionGroup = await db.get(args.groupId);
		return transactionGroup;
	},
});

export const getTransactionLinesByGroupId = query({
	args: { groupId: v.id("transactionGroups") },
	handler: async ({ db }, args) => {
		const transactionLines = await db
			.query("transactionLines")
			.withIndex("by_group", (q) => q.eq("transactionGroupId", args.groupId))
			.collect();
		return transactionLines;
	},
});
