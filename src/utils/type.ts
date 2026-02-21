import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";

export type FieldOrientation = "horizontal" | "vertical" | "responsive";

export type ProductSplitTypeEnum = "percentage" | "per_kg";

export type TransactionStatusEnum = "pending" | "submitted";

export type FarmerWithEmployees = FunctionReturnType<
	typeof api.transactions.queries.getFarmersWithEmployees
>;

export type FarmerWithEmployeesById = FunctionReturnType<
	typeof api.transactions.queries.getFarmersWithEmployeesById
>;
