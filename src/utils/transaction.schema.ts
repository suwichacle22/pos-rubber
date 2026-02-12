import { transactionLines } from "@/db/schema";
import { formOptions } from "@tanstack/react-form";
import { z } from "zod";

export const numericValidator = {
	onChange: ({ value }: { value: string }) => {
		if (!value || value === "") return undefined;
		const isValid = /^[0-9]*\.?[0-9]*$/.test(value);
		return isValid ? undefined : "กรุณากรอกเฉพาะตัวเลข";
	},
};

export const transactionGroupSchema = z.object({
	tranasctionGroupId: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	groupName: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val.trim())),
	farmerId: z.string().min(1),
	status: z.enum(["pending", "submitted"]),
});

export const transactionGroupSchemaNew = transactionGroupSchema.omit({
	tranasctionGroupId: true,
});

export type TransactionGroupNewType = z.infer<typeof transactionGroupSchemaNew>;

export const transactionLineSchema = z.object({
	transactionGroupId: z.string().min(1),
	transactionLinesId: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	transactionLineNo: z.number().int().positive(),
	employeeId: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	productId: z.string().min(1),
	isVehicle: z.boolean(),
	carLicense: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val.trim())),
	weightVehicleIn: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	weightVehicleOut: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	weight: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	price: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	totalAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	isSplit: z
		.enum(["none", "6/4", "55/45", "1/2", "58/42", "custom"])
		.default("none"),
	farmerRatio: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	employeeRatio: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	farmerAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	employeeAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	isTransportationFee: z.boolean().default(false),
	transportationFee: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	transportationFeeFarmerAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	transportationFeeEmployeeAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	farmerPaidType: z.enum(["cash", "bank transfer"]).default("cash"),
	employeePaidType: z.enum(["cash", "bank transfer"]).default("cash"),
	isHarvestRate: z.boolean().default(false),
	harvestRate: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	promotionRate: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	promotionTo: z
		.union([z.enum(["farmer", "employee"]), z.literal(""), z.null()])
		.transform((val) => (val === "" || !val ? null : val)),
	promotionAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
	totalNetAmount: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val)),
});

export const transactionLinesNewFormSchema = z.array(
	transactionLineSchema.omit({
		transactionLinesId: true,
	}),
);

export const transactionLinesDefaultForm = () => {
	return {
		// transactionId is auto-generated, not included in default form
		transactionLinesId: "",
		transactionLineNo: 0,
		employeeId: "",
		productId: "",
		isVehicle: false,
		carLicense: "",
		weightVehicleIn: "",
		weightVehicleOut: "",
		weight: "",
		price: "",
		totalAmount: "",
		isSplit: "none",
		farmerRatio: "",
		employeeRatio: "",
		farmerAmount: "",
		employeeAmount: "",
		isTransportationFee: false,
		transportationFee: "",
		transportationFeeFarmerAmount: "",
		transportationFeeEmployeeAmount: "",
		farmerPaidType: "cash",
		employeePaidType: "cash",
		isHarvestRate: false,
		harvestRate: "",
		promotionRate: "",
		promotionTo: "",
		promotionAmount: "",
	};
};

export const transactionFormOptions = formOptions({
	defaultValues: {
		transactionGroup: {
			transactionGroupId: "",
			groupName: "",
			farmerId: "", //remvoe after test
			status: "pending",
		},
		transactionLines: [transactionLinesDefaultForm()],
	},
});

export const transactionFormSchema = z.object({
	transactionGroup: transactionGroupSchema,
	transactionLines: z.array(transactionLineSchema),
});

export type TransactionNewGroupType = z.infer<typeof transactionGroupSchema>;
export type TransactionNewLineType = z.infer<
	typeof transactionLinesNewFormSchema
>;

export type TransactionLineDBSchema = typeof transactionLines.$inferInsert;

export const addProductSchema = z.object({
	productName: z
		.string("โปรดใส่ชื่อ")
		.min(1)
		.transform((val) => val.trim()),
	defaultSplitType: z.enum(["percentage", "per_kg"]),
});

export type AddProductType = z.infer<typeof addProductSchema>;

export const addFarmerSchema = z.object({
	displayName: z
		.string("โปรดใส่ชื่อ")
		.min(1)
		.transform((val) => val.trim()),
	phone: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val.trim())),
});

export type AddFarmerType = z.infer<typeof addFarmerSchema>;

export const addEmployeeSchema = z.object({
	farmerId: z
		.string("โปรดเลือกเกษตรกร")
		.min(1)
		.transform((val) => val.trim()),
	displayName: z
		.string("โปรดใส่ชื่อ")
		.min(1)
		.transform((val) => val.trim()),
	address: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val.trim())),
	phone: z
		.string()
		.nullable()
		.transform((val) => (val === "" || !val ? null : val.trim())),
});

export type AddEmployeeType = z.infer<typeof addEmployeeSchema>;
