import { formOptions } from "@tanstack/react-form";
import { z } from "zod";
import type { Id } from "convex/_generated/dataModel";

const emptyStringToNull = (val: string | null | undefined) => (val === "" || !val ? null : val);
const stringToNumberOrNull = (val: string | null | undefined) => {
	if (val === "" || !val) return null;
	const num = parseFloat(val);
	return Number.isNaN(num) ? null : num;
};

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
	transportationFeeAmount: z
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
		.union([z.enum(["sum", "split"]), z.literal(""), z.null()])
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

export const convexUpdateTransactionLineSchema = z.object({
	transactionLinesId: z.string().min(1).transform(val => val as Id<"transactionLines">),
	employeeId: z.string().nullable().transform(val => emptyStringToNull(val) as Id<"employees"> | null),
	productId: z.string().nullable().transform(val => emptyStringToNull(val) as Id<"products"> | null),
	carLicenseId: z.string().nullable().transform(val => emptyStringToNull(val) as Id<"carlicenses"> | null),
	isVehicle: z.boolean(),
	weightVehicleIn: z.string().nullable().transform(stringToNumberOrNull),
	weightVehicleOut: z.string().nullable().transform(stringToNumberOrNull),
	weight: z.string().nullable().transform(stringToNumberOrNull),
	price: z.string().nullable().transform(stringToNumberOrNull),
	totalAmount: z.string().nullable().transform(stringToNumberOrNull),
	isSplit: z.enum(["none", "6/4", "55/45", "1/2", "58/42", "custom"]),
	farmerRatio: z.string().nullable().transform(stringToNumberOrNull),
	employeeRatio: z.string().nullable().transform(stringToNumberOrNull),
	farmerAmount: z.string().nullable().transform(stringToNumberOrNull),
	employeeAmount: z.string().nullable().transform(stringToNumberOrNull),
	isTransportationFee: z.boolean(),
	transportationFee: z.string().nullable().transform(stringToNumberOrNull),
	transportationFeeAmount: z.string().nullable().transform(stringToNumberOrNull),
	transportationFeeFarmerAmount: z.string().nullable().transform(stringToNumberOrNull),
	transportationFeeEmployeeAmount: z.string().nullable().transform(stringToNumberOrNull),
	farmerPaidType: z.enum(["cash", "bank transfer"]),
	employeePaidType: z.enum(["cash", "bank transfer"]),
	isHarvestRate: z.boolean(),
	harvestRate: z.string().nullable().transform(stringToNumberOrNull),
	promotionRate: z.string().nullable().transform(stringToNumberOrNull),
	promotionTo: z.union([z.enum(["sum", "split"]), z.literal(""), z.null()]).transform(val => emptyStringToNull(val) as "sum" | "split" | null),
	promotionAmount: z.string().nullable().transform(stringToNumberOrNull),
	totalNetAmount: z.string().nullable().transform(stringToNumberOrNull),
}).transform(data => {
	const { transactionLinesId, ...rest } = data;
	return {
		transactionLineId: transactionLinesId,
		...rest
	};
});

export type TransactionLineFormValues = {
	transactionGroupId: string;
	transactionLinesId: string;
	employeeId: string;
	productId: string;
	isVehicle: boolean;
	carLicenseId: string;
	weightVehicleIn: string;
	weightVehicleOut: string;
	weight: string;
	price: string;
	totalAmount: string;
	isSplit: "none" | "6/4" | "55/45" | "1/2" | "58/42" | "custom";
	farmerRatio: string;
	employeeRatio: string;
	farmerAmount: string;
	employeeAmount: string;
	isTransportationFee: boolean;
	transportationFee: string;
	transportationFeeAmount: string;
	transportationFeeFarmerAmount: string;
	transportationFeeEmployeeAmount: string;
	farmerPaidType: "cash" | "bank transfer";
	employeePaidType: "cash" | "bank transfer";
	isHarvestRate: boolean;
	harvestRate: string;
	promotionRate: string;
	promotionTo: string;
	promotionAmount: string;
	totalNetAmount: string;
};

export const transactionLinesDefaultForm = (
	override?: Partial<TransactionLineFormValues>,
): TransactionLineFormValues => ({
	transactionGroupId: "",
	transactionLinesId: "",
	employeeId: "",
	productId: "",
	isVehicle: false,
	carLicenseId: "",
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
	transportationFeeAmount: "",
	transportationFeeFarmerAmount: "",
	transportationFeeEmployeeAmount: "",
	farmerPaidType: "cash",
	employeePaidType: "cash",
	isHarvestRate: false,
	harvestRate: "",
	promotionRate: "",
	promotionTo: "",
	promotionAmount: "",
	totalNetAmount: "",
	...override,
});

/** Map a Convex transaction line (with optional fields) to form values matching transactionLinesDefaultForm */
export function convexLineToFormLine(
	line: {
		_id?: string;
		employeeId?: string;
		productId?: string;
		isVehicle?: boolean;
		carLicenseId?: string;
		weightVehicleIn?: number;
		weightVehicleOut?: number;
		weight?: number;
		price?: number;
		totalAmount?: number;
		isSplit?: "none" | "6/4" | "55/45" | "1/2" | "58/42" | "custom";
		farmerRatio?: number;
		employeeRatio?: number;
		farmerAmount?: number;
		employeeAmount?: number;
		isTransportationFee?: boolean;
		transportationFee?: number;
		transportationFeeAmount?: number;
		transportationFeeFarmerAmount?: number;
		transportationFeeEmployeeAmount?: number;
		farmerPaidType?: "cash" | "bank transfer";
		employeePaidType?: "cash" | "bank transfer";
		isHarvestRate?: boolean;
		harvestRate?: number;
		promotionRate?: number;
		promotionTo?: "sum" | "split" | null;
		promotionAmount?: number;
		totalNetAmount?: number;
	},
	transactionGroupId: string,
): TransactionLineFormValues {
	return transactionLinesDefaultForm({
		transactionGroupId,
		transactionLinesId: (line._id as string) ?? "",
		employeeId: (line.employeeId as string) ?? "",
		productId: (line.productId as string) ?? "",
		isVehicle: line.isVehicle ?? false,
		carLicenseId: (line.carLicenseId as string) ?? "",
		weightVehicleIn:
			line.weightVehicleIn != null ? String(line.weightVehicleIn) : "",
		weightVehicleOut:
			line.weightVehicleOut != null ? String(line.weightVehicleOut) : "",
		weight: line.weight != null ? String(line.weight) : "",
		price: line.price != null ? String(line.price) : "",
		totalAmount: line.totalAmount != null ? String(line.totalAmount) : "",
		isSplit: line.isSplit ?? "none",
		farmerRatio: line.farmerRatio != null ? String(line.farmerRatio) : "",
		employeeRatio: line.employeeRatio != null ? String(line.employeeRatio) : "",
		farmerAmount: line.farmerAmount != null ? String(line.farmerAmount) : "",
		employeeAmount:
			line.employeeAmount != null ? String(line.employeeAmount) : "",
		isTransportationFee: line.isTransportationFee ?? false,
		transportationFee:
			line.transportationFee != null ? String(line.transportationFee) : "",
		transportationFeeAmount:
			line.transportationFeeAmount != null
				? String(line.transportationFeeAmount)
				: "",
		transportationFeeFarmerAmount:
			line.transportationFeeFarmerAmount != null
				? String(line.transportationFeeFarmerAmount)
				: "",
		transportationFeeEmployeeAmount:
			line.transportationFeeEmployeeAmount != null
				? String(line.transportationFeeEmployeeAmount)
				: "",
		farmerPaidType: line.farmerPaidType ?? "cash",
		employeePaidType: line.employeePaidType ?? "cash",
		isHarvestRate: line.isHarvestRate ?? false,
		harvestRate: line.harvestRate != null ? String(line.harvestRate) : "",
		promotionRate: line.promotionRate != null ? String(line.promotionRate) : "",
		promotionTo: line.promotionTo ?? "",
		promotionAmount:
			line.promotionAmount != null ? String(line.promotionAmount) : "",
		totalNetAmount:
			line.totalNetAmount != null ? String(line.totalNetAmount) : "",
	});
}

export const transactionFormOptions = formOptions({
	defaultValues: {
		transactionGroup: {
			transactionGroupId: "",
			groupName: "",
			farmerId: "",
			status: "pending" as "pending" | "submitted",
		},
		transactionLines: [transactionLinesDefaultForm()],
		transactionPalmGroup: {
			isHarvestRate: false,
			employeeId: "",
			harvestRate: "",
			promotionRate: "",
			promotionTo: "",
			promotionAmount: "",
			farmerPaidType: "cash",
			employeePaidType: "cash",
		},
	},
});

export const transactionFormSchema = z.object({
	transactionGroup: transactionGroupSchema,
	transactionLines: z.array(transactionLineSchema),
});

/** Form line shape — use TransactionLineFormValues for form/summary display */
export type TransactionLinesType = TransactionLineFormValues;

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

/** Schema for adding employee when farmerId is provided by context (e.g. inside farmer card) */
export const addEmployeeInlineSchema = z.object({
	displayName: z
		.string("โปรดใส่ชื่อ")
		.min(1)
		.transform((val) => val.trim()),
});
