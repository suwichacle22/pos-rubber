import { pgEnum, pgTable, uuid, text, numeric, timestamp, boolean, integer, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const customerType = pgEnum("customer_type", ["farmer", "employee"])
export const transactionTypes = pgEnum("transaction_types", ["cash", "bank transfer"])
export const productSplitFarmerEmployeeTypeEnum = pgEnum("product_split_farmer_employee_type_enum", ["none", "6/4", "55/45", "1/2", "58/42", "custom"])
export const productSplitTypeEnum = pgEnum("product_split_type_enum", ["percentage", "per_kg"])
export const transactionStatus = pgEnum("transaction_status", ["pending", "submitted"])


export const employees = pgTable("employees", {
	employeeId: uuid("employee_id").defaultRandom().primaryKey(),
	farmerId: uuid("farmer_id").notNull().references(() => farmers.farmerId),
	displayName: text("display_name").notNull(),
	address: text(),
	phone: text(),
	createdAt: timestamp("created_at").default(sql`now()`),
	updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const farmers = pgTable("farmers", {
	farmerId: uuid("farmer_id").defaultRandom().primaryKey(),
	displayName: text("display_name").notNull(),
	phone: text(),
	createdAt: timestamp("created_at").default(sql`now()`),
	updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => [
	unique("farmers_display_name_unique").on(table.displayName),]);

export const productPrices = pgTable("product_prices", {
	productPriceId: uuid("product_price_id").defaultRandom().primaryKey(),
	productId: uuid("product_id").notNull().references(() => products.productId),
	price: numeric({ precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at").default(sql`now()`),
});

export const products = pgTable("products", {
	productId: uuid("product_id").defaultRandom().primaryKey(),
	productName: text("product_name").notNull(),
	defaultSplitType: productSplitTypeEnum("default_split_type").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`),
	updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => [
	unique("products_product_name_unique").on(table.productName),]);

export const splitDefaults = pgTable("split_defaults", {
	splitDefaultId: uuid("split_default_id").defaultRandom().primaryKey(),
	employeeId: uuid("employee_id").notNull().references(() => employees.employeeId),
	productId: uuid("product_id").notNull().references(() => products.productId),
	splitType: productSplitTypeEnum("split_type").notNull(),
	farmerSplitRatio: numeric("farmer_split_ratio", { precision: 3, scale: 2 }),
	employeeSplitRatio: numeric("employee_split_ratio", { precision: 3, scale: 2 }),
	harvestRate: numeric("harvest_rate", { precision: 3, scale: 2 }),
	promotionTo: customerType("promotion_to").default("employee"),
	transportationFee: numeric("transportation_fee", { precision: 3, scale: 2 }),
	createdAt: timestamp("created_at").default(sql`now()`),
	updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const transactionGroups = pgTable("transaction_groups", {
	transactionGroupId: uuid("transaction_group_id").defaultRandom().primaryKey(),
	farmerId: uuid("farmer_id").references(() => farmers.farmerId),
	groupName: text("group_name"),
	status: transactionStatus().default("pending").notNull(),
	printCount: integer("print_count").default(0).notNull(),
	createdAt: timestamp("created_at").default(sql`now()`),
	submittedAt: timestamp("submitted_at"),
	updatedAt: timestamp("updated_at").default(sql`now()`),
	deletedAt: timestamp("deleted_at"),
});

export const transactionLines = pgTable("transaction_lines", {
	transactionId: uuid("transaction_id").defaultRandom().primaryKey(),
	transactionGroupId: uuid("transaction_group_id").notNull().references(() => transactionGroups.transactionGroupId),
	employeeId: uuid("employee_id").references(() => employees.employeeId),
	productId: uuid("product_id").notNull().references(() => products.productId),
	isVehicle: boolean("is_vehicle").default(false).notNull(),
	weightVehicleIn: numeric("weight_vehicle_in", { precision: 10, scale: 2 }),
	weightVehicleOut: numeric("weight_vehicle_out", { precision: 10, scale: 2 }),
	weight: numeric({ precision: 10, scale: 2 }),
	price: numeric({ precision: 10, scale: 2 }),
	farmerAmount: numeric("farmer_amount", { precision: 10, scale: 2 }),
	employeeAmount: numeric("employee_amount", { precision: 10, scale: 2 }),
	transportationFeeFarmerAmount: numeric("transportation_fee_farmer_amount", { precision: 10, scale: 2 }),
	transportationFeeEmployeeAmount: numeric("transportation_fee_employee_amount", { precision: 10, scale: 2 }),
	totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
	isSplit: productSplitFarmerEmployeeTypeEnum("is_split").default("none"),
	farmerRatio: numeric("farmer_ratio", { precision: 3, scale: 2 }),
	employeeRatio: numeric("employee_ratio", { precision: 3, scale: 2 }),
	farmerPaidType: transactionTypes("farmer_paid_type").default("cash").notNull(),
	employeePaidType: transactionTypes("employee_paid_type").default("cash").notNull(),
	harvestRate: numeric("harvest_rate", { precision: 3, scale: 2 }),
	transportationFee: numeric("transportation_fee", { precision: 3, scale: 2 }),
	carLicense: text("car_license"),
	promotionRate: numeric("promotion_rate", { precision: 3, scale: 2 }),
	promotionTo: customerType("promotion_to"),
	createdAt: timestamp("created_at").default(sql`now()`),
	updatedAt: timestamp("updated_at").default(sql`now()`),
	deletedAt: timestamp("deleted_at"),
	transactionLineNo: integer("transaction_line_no").notNull(),
	isTransportationFee: boolean("is_transportation_fee").default(false).notNull(),
	isHarvestRate: boolean("is_harvest_rate").default(false).notNull(),
	promotionAmount: numeric("promotion_amount", { precision: 10, scale: 2 }),
	totalNetAmount: numeric("total_net_amount", { precision: 10, scale: 2 }),
	printCount: integer("print_count").default(0).notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
});
