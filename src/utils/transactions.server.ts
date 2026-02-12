import { db } from "@/db";
import {
	products,
	farmers,
	employees,
	transactionGroups,
	transactionLines,
} from "@/db/schema";
import type { ProductSplitTypeEnum, TransactionStatusEnum } from "./type";
import { asc, eq } from "drizzle-orm";
import {
	TransactionGroupNewType,
	TransactionLineDBSchema,
	TransactionNewLineType,
} from "./transaction.schema";
import {
	printer as ThermalPrinter,
	types as PrinterTypes,
	characterSet,
} from "node-thermal-printer";

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

export async function addTransactionLinesDB(data: TransactionNewLineType) {
	const newTransactionLines = await db
		.insert(transactionLines)
		.values(data)
		.returning();
	return newTransactionLines;
}

export type TransactionLineDBType = typeof transactionLines.$inferSelect;

//data: TransactionLineDBType
export async function printTransactionLine() {
	console.log("print test");
	let printer = new ThermalPrinter({
		type: PrinterTypes.EPSON,
		interface: "tcp://192.168.1.181",
	});

	printer.println("ทรัพย์ทวี");
	try {
		let execute = await printer.execute();
		return { result: "print done" };
	} catch (e) {
		return { result: "print fail" };
	}
}
