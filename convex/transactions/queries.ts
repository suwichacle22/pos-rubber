import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";
import { getManyFrom } from "convex-helpers/server/relationships";
import { Id } from "../_generated/dataModel";

export const getFarmers = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		return await db.query("farmers").collect();
	},
});

export const getFarmerById = query({
	args: { farmerId: v.id("farmers") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		return await db.get("farmers", args.farmerId);
	},
});

export const getFarmersForm = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const farmers = await db.query("farmers").collect();
		return farmers.map((farmer) => ({
			value: farmer._id as string,
			label: farmer.displayName,
		}));
	},
});

export const getFarmersWithEmployees = query({
	args: {},
	returns: v.any(),
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
	returns: v.any(),
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
	returns: v.any(),
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
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		const sorted = products.sort(
			(a, b) => (a.productLines ?? Infinity) - (b.productLines ?? Infinity),
		);
		return sorted.map((product) => ({
			value: product._id as string,
			label: product.productName,
			productLines: product.productLines ?? null,
		}));
	},
});

export const getCarlicensesForm = query({
	args: { farmerId: v.id("farmers") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		const carlicenses = await db
			.query("carlicenses")
			.withIndex("by_farmerId", (q) => q.eq("farmerId", args.farmerId))
			.collect();
		return carlicenses.map((carlicense) => ({
			value: carlicense._id as string,
			label: carlicense.licensePlate,
		}));
	},
});

/** Returns product IDs whose name contains "ปาล์ม" (Palm). Use for filtering palm lines in the form. */
export const getProductPalmIds = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		return products.filter((product) => product.productName.includes("ปาล์ม"));
	},
});

export const listProductsWithLatestPrice = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const products = await db.query("products").collect();
		const productsWithPrice = await asyncMap(products, async (product) => {
			const sortedPrices = await db
				.query("productPrices")
				.withIndex("by_productId", (q) => q.eq("productId", product._id))
				.order("desc")
				.take(5);

			const latest = sortedPrices[0] ?? null;

			return {
				...product,
				latestPrice: latest?.price ?? null,
				latestPriceAt: latest?._creationTime ?? null,
				priceHistory: sortedPrices,
			};
		});

		return productsWithPrice.sort(
			(a, b) => (a.productLines ?? Infinity) - (b.productLines ?? Infinity),
		);
	},
});

export const getTransactionGroup = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const transactionGroups = await db
			.query("transactionGroups")
			.order("desc")
			.collect();

		return transactionGroups;
	},
});

export const getPendingTransactionGroup = query({
	args: {},
	returns: v.any(),
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
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionGroup = await db.get(args.groupId);
		return transactionGroup;
	},
});

export const getTransactionLinesByGroupId = query({
	args: { groupId: v.id("transactionGroups") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionLines = await db
			.query("transactionLines")
			.withIndex("by_transactionGroupId", (q) =>
				q.eq("transactionGroupId", args.groupId),
			)
			.collect();
		return transactionLines;
	},
});

export const getTransactionGroupwithLinesById = query({
	args: { groupId: v.id("transactionGroups") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionGroup = await db.get(args.groupId);
		if (!transactionGroup) {
			throw new Error("Transaction group not found");
		}
		const transactionLines = await db
			.query("transactionLines")
			.withIndex("by_transactionGroupId", (q) =>
				q.eq("transactionGroupId", args.groupId),
			)
			.collect();
		return { transactionGroup, transactionLines };
	},
});

export const getTransactionLineById = query({
	args: { lineId: v.id("transactionLines") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionLine = await db.get("transactionLines", args.lineId);
		return transactionLine;
	},
});

/** Get product by ID for print actions */
export const getProductById = query({
	args: { productId: v.id("products") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		return await db.get("products", args.productId);
	},
});

/** Get employee by ID for print actions */
export const getEmployeeById = query({
	args: { employeeId: v.id("employees") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		return await db.get("employees", args.employeeId);
	},
});

/** Get car license by ID for print actions */
export const getCarlicenseById = query({
	args: { carlicenseId: v.id("carlicenses") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		return await db.get("carlicenses", args.carlicenseId);
	},
});

// print section

export const readGroupLines = internalQuery({
	args: { transactionGroupId: v.id("transactionGroups") },
	returns: v.any(),
	handler: async ({ db }, args) => {
		const transactionLines = await db
			.query("transactionLines")
			.withIndex("by_transactionGroupId", (q) =>
				q.eq("transactionGroupId", args.transactionGroupId),
			)
			.collect();

		return transactionLines;
	},
});

// transaction list page — data table

export const getAllTransactionLinesWithDetails = query({
	args: {},
	returns: v.any(),
	handler: async ({ db }) => {
		const lines = await db.query("transactionLines").collect();

		const result = await asyncMap(lines, async (line) => {
			const group = await db.get(line.transactionGroupId);
			const farmer =
				group?.farmerId ? await db.get(group.farmerId) : null;
			const product = line.productId
				? await db.get(line.productId)
				: null;

			return {
				_id: line._id,
				transactionGroupId: line.transactionGroupId,
				groupCreationTime: group?._creationTime ?? null,
				groupStatus: group?.status ?? null,
				farmerName: farmer?.displayName ?? "ยังไม่มีชื่อ",
				productName: product?.productName ?? "-",
				weight: line.weight ?? null,
				price: line.price ?? null,
				totalAmount: line.totalAmount ?? null,
				totalNetAmount: line.totalNetAmount ?? null,
			};
		});

		return result.sort(
			(a, b) => (b.groupCreationTime ?? 0) - (a.groupCreationTime ?? 0),
		);
	},
});

// dashboard section

export const getDailySummary = query({
	args: { startDate: v.string(), endDate: v.string() },
	returns: v.any(),
	handler: async ({ db }, { startDate, endDate }) => {
		const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
		const [eYear, eMonth, eDay] = endDate.split("-").map(Number);
		// Thailand UTC+7: subtract 7 hours from local midnight to get UTC ms
		const startOfDay =
			Date.UTC(sYear, sMonth - 1, sDay, 0, 0, 0, 0) - 7 * 60 * 60 * 1000;
		const endOfDay =
			Date.UTC(eYear, eMonth - 1, eDay, 23, 59, 59, 999) - 7 * 60 * 60 * 1000;

		const allLines = await db.query("transactionLines").collect();
		const linesInRange = allLines.filter(
			(line) =>
				line._creationTime >= startOfDay &&
				line._creationTime <= endOfDay &&
				line.productId,
		);

		const groupMap = new Map<
			string,
			{
				totalWeight: number;
				priceSum: number;
				priceCount: number;
				totalAmount: number;
			}
		>();

		for (const line of linesInRange) {
			const pid = line.productId as string;
			const existing = groupMap.get(pid) ?? {
				totalWeight: 0,
				priceSum: 0,
				priceCount: 0,
				totalAmount: 0,
			};
			existing.totalWeight += line.weight ?? 0;
			if (line.price != null) {
				existing.priceSum += line.price;
				existing.priceCount += 1;
			}
			existing.totalAmount += line.totalAmount ?? 0;
			groupMap.set(pid, existing);
		}

		const result = [];
		for (const [productId, agg] of groupMap) {
			const product = await db.get(productId as Id<"products">);
			result.push({
				productName: product?.productName ?? "Unknown",
				productLines: product?.productLines ?? Infinity,
				totalWeight: String(agg.totalWeight),
				averagePrice: String(
					agg.priceCount > 0 ? agg.priceSum / agg.priceCount : 0,
				),
				totalAmount: String(agg.totalAmount),
			});
		}

		result.sort((a, b) => a.productLines - b.productLines);
		return result;
	},
});

export const getLatestPalmPrice = query({
	args: {},
	returns: v.union(v.number(), v.null()),
	handler: async ({ db }) => {
		const palmProductId =
			"jn7fxvxkm44zdsf81tkxajn6wh81hdg5" as Id<"products">;
		const latestPrice = await db
			.query("productPrices")
			.withIndex("by_productId", (q) => q.eq("productId", palmProductId))
			.order("desc")
			.first();
		return latestPrice?.price ?? null;
	},
});
