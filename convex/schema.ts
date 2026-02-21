import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const paidType = v.union(v.literal("cash"), v.literal("bank transfer"));
export const customerType = v.union(v.literal("farmer"), v.literal("employee"));
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
	}).index("by_display_name", ["displayName"]),
	employees: defineTable({
		farmerId: v.id("farmers"),
		displayName: v.string(),
		address: v.optional(v.string()),
		phone: v.optional(v.string()),
	})
		.index("by_farmerId", ["farmerId"])
		.index("by_farmer_display_name", ["farmerId", "displayName"]),
	products: defineTable({
		productName: v.string(),
	}).index("by_product_name", ["productName"]),
	productPrices: defineTable({
		productId: v.id("products"),
		price: v.number(),
	}).index("by_product", ["productId"]),

	splitDefaults: defineTable({
		employeeId: v.id("employees"),
		productId: v.id("products"),
		splitType: productSplitType,
		farmerSplitRatio: v.optional(v.number()),
		employeeSplitRatio: v.optional(v.number()),
		harvestRate: v.optional(v.number()),
		promotionTo: v.optional(customerType),
		transportationFee: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_employee", ["employeeId"])
		.index("by_product", ["productId"])
		.index("by_employee_product", ["employeeId", "productId"])
		.index("by_created_at", ["createdAt"]),

	transactionGroups: defineTable({
		farmerId: v.optional(v.id("farmers")),
		groupName: v.optional(v.string()),
		status: transactionStatus,
		submittedAt: v.optional(v.number()),
	})
		.index("by_farmer", ["farmerId"])
		.index("by_status", ["status"]),
	carlicenses: defineTable({
		farmerId: v.id("farmers"),
		licensePlate: v.string(),
		licensePlateNormalized: v.string(),
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
		lastUsedAt: v.optional(v.number()),
	})
		.index("by_farmer", ["farmerId"])
		.index("by_farmer_license_normalized", [
			"farmerId",
			"licensePlateNormalized",
		])
		.index("by_license_normalized", ["licensePlateNormalized"])
		.index("by_created_at", ["createdAt"]),

	transactionLines: defineTable({
		transactionLineNo: v.number(),
		transactionGroupId: v.id("transactionGroups"),
		employeeId: v.optional(v.id("employees")),
		productId: v.optional(v.id("products")),
		isVehicle: v.optional(v.boolean()),
		carLicense: v.optional(v.string()),
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
		promotionTo: v.optional(customerType),
		promotionAmount: v.optional(v.number()),
		totalNetAmount: v.optional(v.number()),
	})
		.index("by_group", ["transactionGroupId"])
		.index("by_group_line_no", ["transactionGroupId", "transactionLineNo"])
		.index("by_employee", ["employeeId"])
		.index("by_product", ["productId"]),
});
