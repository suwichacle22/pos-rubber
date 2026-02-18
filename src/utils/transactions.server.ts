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
import type {
	TransactionGroupNewType,
	TransactionNewLineType,
	TransactionGroupLinesType,
} from "./transaction.schema";
import {
	printer as ThermalPrinter,
	types as PrinterTypes,
} from "node-thermal-printer";
import { formatDateThai, summaryTransactionText } from "./utils";

// --- Print types ---

/** Params for printing receipt header (farmer name, date, product, summary) */
export interface PrintReceiptHeaderParams {
	farmerDisplayName: string | null | undefined;
	createdAt: Date | null;
	productName: string | null | undefined;
	summaryCalculateText: string;
}

/** Params for printing split section (farmer/employee breakdown) */
export interface PrintSplitSectionParams {
	farmerAmountText: string;
	employeeAmountText: string;
	farmerCalculateTransportationFeeText: string;
	farmerAmountTransportationFeeText: string;
	employeeAllTransportationFeeText: string;
	employeeDisplayName: string | null | undefined;
	isTransportationFee: boolean;
}

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

// export async function getTransactionGroupDB(transactionGroupId: string) {
// 	return await db.query.transactionGroups.findFirst({
// 		where: { transactionGroupId },
// 		with: {
// 			transactionLines: true,
// 			products: true,
// 			farmers: true,
// 			employees: true,
// 		},
// 	});
// }

//print section
//data: TransactionLineDBType
let printer = new ThermalPrinter({
	type: PrinterTypes.EPSON,
	interface: "tcp://192.168.1.181",
	width: 42,
});

/**
 * print all transaction lines in a group
 * @param transactionGroupID
 * @returns
 */
export async function printTransactionGroupDB(
	transactionGroupID: string,
): Promise<
	| { result: "print done" }
	| { result: "print fail"; error: { message: string } }
> {
	const transactionGroup = await db.query.transactionGroups.findFirst({
		where: { transactionGroupId: transactionGroupID },
	});
	if (!transactionGroup) {
		throw Error("Transaction group not found");
	}
	const farmer = await db.query.farmers.findFirst({
		where: { farmerId: transactionGroup.farmerId as string },
	});
	const transactionLines = await db.query.transactionLines.findMany({
		where: { transactionGroupId: transactionGroupID },
		orderBy: { transactionLineNo: "asc" },
		with: {
			employees: true,
			products: true,
		},
	});

	printer.setPrinterDriver(printer);
	printer.setCharacterSet("TIS18_THAI");
	for (const transactionLine of transactionLines) {
		const {
			summaryCalculateText,
			farmerAmountText,
			employeeAmountText,
			farmerCalculateTransportationFeeText,
			farmerAmountTransportationFeeText,
			farmerAllTransportationFeeText,
			employeeCalculateTransportationFeeText,
			employeeAmountTransportationFeeText,
			employeeAllTransportationFeeText,
		} = summaryTransactionText(transactionLine);
		const { dateThai, time } = formatDateThai(
			transactionLine.createdAt ?? new Date(),
		);
		//header
		printer.println("ทรัพย์ทวี");
		printer.println("โทร: 089-474-0467");
		printer.println("เปิดทุกวัน 7.00 - 17.00 น.");
		printer.println("------------------------------------------");
		printer.println(`ชื่อ: ${farmer?.displayName}`);
		printer.println(`วันที่และเวลา: ${dateThai} ${time}`);
		printer.println(`สินค้า: ${transactionLine.products?.productName}`);
		printer.println("------------------------------------------");
		//header
		if (transactionLine.isVehicle) {
			printer.println(`ทะเบียนรถยนต์:    ${transactionLine.carLicense}`);
			printer.println(`น้ำหนักรถยนต์เข้า:  ${transactionLine.weightVehicleIn}`);
			printer.println(`น้ำหนักรถยนต์ออก:  ${transactionLine.weightVehicleOut}`);
			printer.println(`น้ำหนักสินค้า:      ${transactionLine.weight}`);
			printer.println(``);
		}
		printer.setTextSize(1, 1);
		printer.println(summaryCalculateText);
		printer.println("");
		printer.println("");
		if (transactionLine.isSplit !== "none") {
			if (!transactionLine.isTransportationFee) {
				printer.println(farmerAmountText);
				printer.println("");
				printer.setTextSize(0, 0);
				printer.println(employeeAmountText);
			} else if (transactionLine.isTransportationFee) {
				printer.println(farmerCalculateTransportationFeeText);
				printer.println(
					`${" ".repeat(13)}${farmerAmountTransportationFeeText}`,
				);
				printer.println("");
				printer.setTextSize(0, 0);
				printer.println(employeeAllTransportationFeeText);
			}
			printer.println("");
			printer.println(`คนตัด: ${transactionLine.employees?.displayName}`);
		}
		if (transactionLine.isHarvestRate) {
			printer.println(`อัตราค่าตัด: ${transactionLine.harvestRate}`);
			printer.println(`ยอดค่าตัด: ${transactionLine.employeeAmount}`);
		}
		printer.partialCut();
		// if (transactionLine.isSplit !== "none") {
		// 	printer.println("ทรัพย์ทวี");
		// 	printer.println("โทร: 089-474-0467");
		// 	printer.println("เปิดทุกวัน 7.00 - 17.00 น.");
		// 	printer.println("--------------");
		// 	printer.println(`ชื่อ: ${farmer?.displayName}`);
		// 	printer.println(
		// 		`ใบเสร็จวันที่และเวลา: ${formatDateThai(transactionLine.createdAt ?? new Date()).dateThai} ${formatDateThai(transactionLine.createdAt ?? new Date()).time}`,
		// 	);
		// 	printer.println(`สินค้า: ${transactionLine.products?.productName}`);
		// 	printer.println("--------------");
		// 	//header
		// 	printer.setTextSize(1, 1);
		// 	printer.println(summaryCalculateText);
		// 	printer.println(summaryTotalAmountText);
		// 	printer.println("");
		// 	printer.println(employeeAmountText);
		// 	printer.println("");
		// 	printer.println(`คนตัด: ${transactionLine.employees?.displayName}`);
		// 	printer.cut();
		// }
	}

	try {
		let execute = await printer.execute();
		return { result: "print done" };
	} catch (e) {
		return {
			result: "print fail",
			error: { message: e instanceof Error ? e.message : String(e) },
		};
	}
}
