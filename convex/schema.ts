import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const paidType = v.union(v.literal("cash"), v.literal("bank transfer"));
export const customerType = v.union(v.literal("farmer"), v.literal("employee"));
export const promotionType = v.union(v.literal("sum"), v.literal("split"));
export const productSplitType = v.union(
	v.literal("percentage"),
	v.literal("per_kg"),
);
export const productSplitFarmerEmployeeType = v.union(
	v.literal("none"),
	v.literal("6/4"),
	v.literal("55/45"),
	v.literal("1/2"),
	v.literal("58/42"),
	v.literal("custom"),
);
export const transactionStatus = v.union(
	v.literal("pending"),
	v.literal("submitted"),
);

export default defineSchema({
	farmers: defineTable({
		displayName: v.string(),
		phone: v.optional(v.string()),
	}).index("by_displayName", ["displayName"]),
	employees: defineTable({
		farmerId: v.id("farmers"),
		displayName: v.string(),
		address: v.optional(v.string()),
		phone: v.optional(v.string()),
	})
		.index("by_farmerId", ["farmerId"])
		.index("by_farmerId_and_displayName", ["farmerId", "displayName"]),
	products: defineTable({
		productName: v.string(),
		productLines: v.optional(v.number()),
	}).index("by_productName", ["productName"]),
	productPrices: defineTable({
		productId: v.id("products"),
		price: v.number(),
	}).index("by_productId", ["productId"]),

	splitDefaults: defineTable({
		employeeId: v.id("employees"),
		productId: v.id("products"),
		splitType: productSplitType,
		farmerSplitRatio: v.optional(v.number()),
		employeeSplitRatio: v.optional(v.number()),
		harvestRate: v.optional(v.number()),
		promotionTo: v.optional(customerType),
		transportationFee: v.optional(v.number()),
	})
		.index("by_employeeId", ["employeeId"])
		.index("by_productId", ["productId"])
		.index("by_employeeId_and_productId", ["employeeId", "productId"]),

	transactionGroups: defineTable({
		farmerId: v.optional(v.id("farmers")),
		groupName: v.optional(v.string()),
		status: transactionStatus,
		submittedAt: v.optional(v.number()),
	})
		.index("by_farmerId", ["farmerId"])
		.index("by_status", ["status"]),
	carlicenses: defineTable({
		farmerId: v.id("farmers"),
		licensePlate: v.string(),
	}).index("by_farmerId", ["farmerId"]),

	transactionLines: defineTable({
		transactionGroupId: v.id("transactionGroups"),
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
	})
		.index("by_transactionGroupId", ["transactionGroupId"])
		.index("by_employeeId", ["employeeId"])
		.index("by_productId", ["productId"]),
});
