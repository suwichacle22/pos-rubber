import {
	boolean,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const transactionStatusEnum = pgEnum("transaction_status", [
	"pending",
	"submitted",
]);
export const paidTypeEnum = pgEnum("transaction_types", [
	"cash",
	"bank transfer",
]);
export const customerTypeEnum = pgEnum("customer_type", ["farmer", "employee"]);

//percentage for latex and rubber (0.6 farmer and 0.4 employee)
//per_kg for palm (0.6 from weight(kg))
export const productSplitTypeEnum = pgEnum("product_split_type_enum", [
	"percentage",
	"per_kg",
]);

export const productSplitFarmerEmployeeTypeEnum = pgEnum(
	"product_split_farmer_employee_type_enum",
	["none", "6/4", "55/45", "1/2", "58/42", "custom"],
);

export const farmers = pgTable("farmers", {
	farmerId: uuid("farmer_id").primaryKey().notNull().defaultRandom(),
	displayName: text("display_name").notNull().unique(),
	phone: text("phone"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const employees = pgTable("employees", {
	employeeId: uuid("employee_id").primaryKey().defaultRandom(),
	farmerId: uuid("farmer_id")
		.notNull()
		.references(() => farmers.farmerId),
	displayName: text("display_name").notNull(),
	address: text("address"),
	phone: text("phone"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const products = pgTable("products", {
	productId: uuid("product_id").primaryKey().defaultRandom(),
	productName: text("product_name").notNull().unique(),
	defaultSplitType: productSplitTypeEnum("default_split_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const productPrices = pgTable("product_prices", {
	productPriceId: uuid("product_price_id").primaryKey().defaultRandom(),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.productId),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const splitDefaults = pgTable("split_defaults", {
	splitDefaultId: uuid("split_default_id").primaryKey().defaultRandom(),
	employeeId: uuid("employee_id")
		.notNull()
		.references(() => employees.employeeId),
	productId: uuid("product_id")
		.notNull()
		.references(() => products.productId),
	splitType: productSplitTypeEnum("split_type").notNull(),
	farmerSplitRatio: numeric("farmer_split_ratio", {
		precision: 3,
		scale: 2,
	}),
	employeeSplitRatio: numeric("employee_split_ratio", {
		precision: 3,
		scale: 2,
	}),
	harvestRate: numeric("harvest_rate", { precision: 3, scale: 2 }),
	promotionTo: customerTypeEnum("promotion_to").default("employee"),
	transportationFee: numeric("transportation_fee", {
		precision: 3,
		scale: 2,
	}),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const transactionGroups = pgTable("transaction_groups", {
	transactionGroupId: uuid("transaction_group_id").primaryKey().defaultRandom(),
	farmerId: uuid("farmer_id").references(() => farmers.farmerId), // Nullable for auto-save before farmer selected
	groupName: text("group_name"),
	status: transactionStatusEnum("status").notNull().default("pending"),
	printCount: integer("print_count").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
	isDeleted: boolean("is_deleted").notNull().default(false),
	deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete
});

export const transactionLines = pgTable("transaction_lines", {
	transactionLinesId: uuid("transaction_lines_id").primaryKey().defaultRandom(),
	transactionLineNo: integer("transaction_line_no").notNull(),
	transactionGroupId: uuid("transaction_group_id")
		.notNull()
		.references(() => transactionGroups.transactionGroupId),
	employeeId: uuid("employee_id").references(() => employees.employeeId),
	productId: uuid("product_id")
		.references(() => products.productId)
		.notNull(),
	isVehicle: boolean("is_vehicle").notNull().default(false),
	carLicense: text("car_license"),
	weightVehicleIn: numeric("weight_vehicle_in", {
		precision: 10,
		scale: 2,
	}),
	weightVehicleOut: numeric("weight_vehicle_out", {
		precision: 10,
		scale: 2,
	}),
	weight: numeric("weight", {
		precision: 10,
		scale: 2,
	}), // Nullable for auto-save
	price: numeric("price", {
		precision: 10,
		scale: 2,
	}), // Nullable for auto-save
	totalAmount: numeric("total_amount", {
		precision: 10,
		scale: 2,
	}), // Nullable for auto-save
	isSplit: productSplitFarmerEmployeeTypeEnum("is_split").default("none"),
	farmerRatio: numeric("farmer_ratio", {
		precision: 3,
		scale: 2,
	}),
	employeeRatio: numeric("employee_ratio", {
		precision: 3,
		scale: 2,
	}),
	farmerAmount: numeric("farmer_amount", {
		precision: 10,
		scale: 2,
	}),
	employeeAmount: numeric("employee_amount", {
		precision: 10,
		scale: 2,
	}),
	isTransportationFee: boolean("is_transportation_fee")
		.notNull()
		.default(false),
	transportationFee: numeric("transportation_fee", {
		precision: 3,
		scale: 2,
	}),
	transportationFeeAmount: numeric("transportation_fee_amount", {
		precision: 10,
		scale: 2,
	}),
	transportationFeeFarmerAmount: numeric("transportation_fee_farmer_amount", {
		precision: 10,
		scale: 2,
	}),
	transportationFeeEmployeeAmount: numeric(
		"transportation_fee_employee_amount",
		{
			precision: 10,
			scale: 2,
		},
	),
	farmerPaidType: paidTypeEnum("farmer_paid_type").notNull().default("cash"),
	employeePaidType: paidTypeEnum("employee_paid_type")
		.notNull()
		.default("cash"),
	isHarvestRate: boolean("is_harvest_rate").notNull().default(false),
	harvestRate: numeric("harvest_rate", {
		precision: 3,
		scale: 2,
	}),
	promotionRate: numeric("promotion_rate", {
		precision: 3,
		scale: 2,
	}),
	promotionTo: customerTypeEnum("promotion_to"),
	promotionAmount: numeric("promotion_amount", {
		precision: 10,
		scale: 2,
	}),
	totalNetAmount: numeric("total_net_amount", {
		precision: 10,
		scale: 2,
	}),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date()),
	printCount: integer("print_count").notNull().default(0),
	isDeleted: boolean("is_deleted").notNull().default(false),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
