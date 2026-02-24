import { action } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { api } from "../_generated/api";

/** Single line data for printing */
const printLineValidator = v.object({
	_id: v.id("transactionLines"),
	_creationTime: v.number(),
	productName: v.string(),
	employeeDisplayName: v.string(),
	carLicense: v.string(),
	isVehicle: v.optional(v.boolean()),
	weight: v.optional(v.number()),
	weightVehicleIn: v.optional(v.number()),
	weightVehicleOut: v.optional(v.number()),
	price: v.optional(v.number()),
	totalAmount: v.optional(v.number()),
	totalNetAmount: v.optional(v.number()),
	isSplit: v.optional(
		v.union(
			v.literal("none"),
			v.literal("6/4"),
			v.literal("55/45"),
			v.literal("1/2"),
			v.literal("58/42"),
			v.literal("custom"),
		),
	),
	farmerRatio: v.optional(v.number()),
	employeeRatio: v.optional(v.number()),
	farmerAmount: v.optional(v.number()),
	employeeAmount: v.optional(v.number()),
	isTransportationFee: v.optional(v.boolean()),
	transportationFeeAmount: v.optional(v.number()),
	transportationFeeFarmerAmount: v.optional(v.number()),
	transportationFeeEmployeeAmount: v.optional(v.number()),
	isHarvestRate: v.optional(v.boolean()),
	harvestRate: v.optional(v.number()),
	promotionTo: v.optional(v.string()),
	promotionRate: v.optional(v.number()),
	promotionAmount: v.optional(v.number()),
});

/** Return type: raw data for you to handle printing */
const getPrintSummaryDataReturns = v.object({
	farmer: v.object({
		displayName: v.union(v.string(), v.null()),
	}),
	transactionGroup: v.object({
		_id: v.id("transactionGroups"),
		groupName: v.optional(v.string()),
		status: v.string(),
		farmerId: v.optional(v.id("farmers")),
		_creationTime: v.number(),
	}),
	lines: v.array(printLineValidator),
});

export type PrintSummaryReturn = {
	farmer: { displayName: string | null };
	transactionGroup: {
		_id: Id<"transactionGroups">;
		groupName?: string;
		status: string;
		farmerId?: Id<"farmers">;
		_creationTime: number;
	};
	lines: Array<{
		_id: Id<"transactionLines">;
		_creationTime: number;
		productName: string;
		employeeDisplayName: string;
		carLicense: string;
		isVehicle?: boolean;
		weight?: number;
		weightVehicleIn?: number;
		weightVehicleOut?: number;
		price?: number;
		totalAmount?: number;
		totalNetAmount?: number;
		isSplit?: "none" | "6/4" | "55/45" | "1/2" | "58/42" | "custom";
		farmerRatio?: number;
		employeeRatio?: number;
		farmerAmount?: number;
		employeeAmount?: number;
		isTransportationFee?: boolean;
		transportationFeeAmount?: number;
		transportationFeeFarmerAmount?: number;
		transportationFeeEmployeeAmount?: number;
		isHarvestRate?: boolean;
		harvestRate?: number;
		promotionTo?: string;
		promotionRate?: number;
		promotionAmount?: number;
	}>;
};

/**
 * Fetch transaction group data as structured object for printing.
 * Returns raw data — you handle the printing part yourself.
 */
export const getPrintSummaryData = action({
	args: {
		transactionGroupId: v.id("transactionGroups"),
	},
	returns: getPrintSummaryDataReturns,
	handler: async (ctx, args): Promise<PrintSummaryReturn> => {
		const queryResult = await ctx.runQuery(
			api.transactions.queries.getTransactionGroupwithLinesById,
			{ groupId: args.transactionGroupId },
		);
		const transactionGroup = queryResult.transactionGroup;
		const transactionLines = queryResult.transactionLines;

		if (!transactionGroup) {
			throw new Error("Transaction group not found");
		}

		let farmer: { displayName: string } | null = null;
		if (transactionGroup.farmerId) {
			farmer = await ctx.runQuery(api.transactions.queries.getFarmerById, {
				farmerId: transactionGroup.farmerId,
			});
		}

		const lines: PrintSummaryReturn["lines"] = [];
		for (const line of transactionLines) {
			const product: { productName: string } | null = line.productId
				? await ctx.runQuery(api.transactions.queries.getProductById, {
						productId: line.productId,
					})
				: null;

			const employee: { displayName: string } | null = line.employeeId
				? await ctx.runQuery(api.transactions.queries.getEmployeeById, {
						employeeId: line.employeeId,
					})
				: null;

			const carLicense: string = line.carLicenseId
				? ((
						await ctx.runQuery(api.transactions.queries.getCarlicenseById, {
							carlicenseId: line.carLicenseId,
						})
					)?.licensePlate ?? "")
				: "";

			lines.push({
				_id: line._id,
				_creationTime: line._creationTime ?? 0,
				productName: product?.productName ?? "",
				employeeDisplayName: employee?.displayName ?? "",
				carLicense,
				isVehicle: line.isVehicle,
				weight: line.weight,
				weightVehicleIn: line.weightVehicleIn,
				weightVehicleOut: line.weightVehicleOut,
				price: line.price,
				totalAmount: line.totalAmount,
				totalNetAmount: line.totalNetAmount,
				isSplit: line.isSplit,
				farmerRatio: line.farmerRatio,
				employeeRatio: line.employeeRatio,
				farmerAmount: line.farmerAmount,
				employeeAmount: line.employeeAmount,
				isTransportationFee: line.isTransportationFee,
				transportationFeeAmount: line.transportationFeeAmount,
				transportationFeeFarmerAmount: line.transportationFeeFarmerAmount,
				transportationFeeEmployeeAmount: line.transportationFeeEmployeeAmount,
				isHarvestRate: line.isHarvestRate,
				harvestRate: line.harvestRate,
				promotionTo: line.promotionTo,
				promotionRate: line.promotionRate,
				promotionAmount: line.promotionAmount,
			});
		}

		return {
			farmer: {
				displayName: farmer?.displayName ?? null,
			},
			transactionGroup: {
				_id: transactionGroup._id,
				groupName: transactionGroup.groupName,
				status: transactionGroup.status,
				farmerId: transactionGroup.farmerId,
				_creationTime: transactionGroup._creationTime,
			},
			lines,
		};
	},
});
