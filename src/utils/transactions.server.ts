import { db } from "@/db";
import { products, farmers, employees, transactionGroups } from "@/db/schema";
import type { ProductSplitTypeEnum, TransactionStatusEnum } from "./type";
import { asc, eq } from "drizzle-orm";
import { TransactionGroupNewType } from "./transaction.schema";

export async function addProductDB(data: {
	productName: string;
	defaultSplitType: ProductSplitTypeEnum;
}) {
	return await db
		.insert(products)
		.values({
			productName: data.productName,
			defaultSplitType: data.defaultSplitType,
		})
		.returning();
}

export async function getProductsDB() {
	return await db.query.products.findMany();
}

export async function getProductsFormDB() {
	return await db
		.select({ label: products.productName, value: products.productId })
		.from(products)
		.orderBy(asc(products.createdAt));
}

export async function addFarmerDB(data: {
	displayName: string;
	phone: string | null;
}) {
	const [farmer] = await db
		.insert(farmers)
		.values({
			displayName: data.displayName,
			phone: data.phone,
		})
		.returning();
	return farmer;
}

export async function getFarmersDB() {
	return await db.query.farmers.findMany({ with: { employees: true } });
}

export async function getFarmersFormDB() {
	return await db
		.select({ label: farmers.displayName, value: farmers.farmerId })
		.from(farmers)
		.orderBy(asc(farmers.createdAt));
}

export async function addEmployeeDB(data: {
	farmerId: string;
	displayName: string;
	address: string | null;
	phone: string | null;
}) {
	const [employee] = await db
		.insert(employees)
		.values({
			farmerId: data.farmerId,
			displayName: data.displayName,
			address: data.address,
			phone: data.phone,
		})
		.returning();
	return employee;
}

export async function getEmployeesDB() {
	return await db.query.employees.findMany({
		with: {
			farmers: true,
		},
	});
}

export async function getEmployeesFormDB(farmerId: string) {
	return await db
		.select({ label: employees.displayName, value: employees.employeeId })
		.from(employees)
		.where(eq(employees.farmerId, farmerId))
		.orderBy(asc(employees.createdAt));
}

export async function addTransactionGroupDB(data: TransactionGroupNewType) {
	return await db
		.insert(transactionGroups)
		.values({
			farmerId: data.farmerId,
			groupName: data.groupName,
			status: data.status,
		})
		.returning();
}
