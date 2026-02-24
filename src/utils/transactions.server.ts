import {
	printer as ThermalPrinter,
	types as PrinterTypes,
} from "node-thermal-printer";
import type { FunctionReturnType } from "convex/server";
import type { api } from "convex/_generated/api";
import {
	formatDateThaiConvex,
	summaryTransactionTextFromConvex,
} from "./utils";

/** Return type from Convex action getPrintSummaryData — use for printing */
export type PrintSummaryData = FunctionReturnType<
	typeof api.transactions.actions.getPrintSummaryData
>;

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

const printer = new ThermalPrinter({
	type: PrinterTypes.EPSON,
	interface: "tcp://192.168.1.181",
	width: 42,
});

/**
 * Print receipt — receives data from Convex action getPrintSummaryData.
 * Implement your printing logic using transactionData.farmer, transactionData.lines, etc.
 */
export async function printReceipt(
	transactionData: PrintSummaryData,
): Promise<
	| { result: "print done" }
	| { result: "print fail"; error: { message: string } }
> {
	const { dateThai, time } = formatDateThaiConvex(
		transactionData.transactionGroup._creationTime,
	);

	for (const line of transactionData.lines) {
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
			harvestRateText,
			promotionRateText,
			promotionAmountText,
		} = summaryTransactionTextFromConvex(line);
		//farmer
		printer.println("ทรัพย์ทวี");
		printer.println("โทร: 089-474-0467");
		printer.println("เปิดทุกวัน 7.00 - 17.00 น.");
		printer.println("------------------------------------------");
		printer.println(`ชื่อ: ${transactionData.farmer?.displayName}`);
		printer.println(`วันที่และเวลา: ${dateThai} ${time}`);
		printer.println(`สินค้า: ${line.productName}`);
		printer.println("------------------------------------------");
		if (line.isVehicle) {
			printer.println(`ทะเบียนรถยนต์:    ${line.carLicense}`);
			printer.println(`น้ำหนักรถยนต์เข้า:  ${line.weightVehicleIn}`);
			printer.println(`น้ำหนักรถยนต์ออก:  ${line.weightVehicleOut}`);
			printer.println(`น้ำหนักสินค้า:      ${line.weight}`);
			printer.println(``);
		}
		printer.setTextSize(1, 1);
		printer.println(summaryCalculateText);
		printer.println("");
		printer.println("");
		if (line.isSplit !== "none") {
			if (!line.isTransportationFee) {
				printer.println(farmerAmountText);
				printer.println("");
				printer.setTextSize(0, 0);
				printer.println(employeeAmountText);
			} else if (line.isTransportationFee) {
				printer.println(farmerCalculateTransportationFeeText);
				printer.println(
					`${" ".repeat(13)}${farmerAmountTransportationFeeText}`,
				);
				printer.println("");
				printer.setTextSize(0, 0);
				printer.println(employeeAllTransportationFeeText);
			}
			printer.println("");
		}
		if (line.isHarvestRate) {
			printer.println(`ยอดค่าตัด:  ${line.employeeAmount}`);
			printer.setTextSize(1, 1);
			printer.println(`เหลือ:     ${line.farmerAmount}`);
			printer.setTextSize(0, 0);
			printer.println("");
		}
		printer.println(`คนตัด: ${line.employeeDisplayName}`);
		printer.partialCut();
		printer.println("ทรัพย์ทวี");
		printer.println("โทร: 089-474-0467");
		printer.println("เปิดทุกวัน 7.00 - 17.00 น.");
		printer.println("------------------------------------------");
		printer.println(`ชื่อ: ${transactionData.farmer?.displayName}`);
		printer.println(`วันที่และเวลา: ${dateThai} ${time}`);
		printer.println(`สินค้า: ${line.productName}`);
		printer.println("------------------------------------------");
		if (line.isVehicle) {
			printer.println(`ทะเบียนรถยนต์:    ${line.carLicense}`);
			printer.println(`น้ำหนักรถยนต์เข้า:  ${line.weightVehicleIn}`);
			printer.println(`น้ำหนักรถยนต์ออก:  ${line.weightVehicleOut}`);
			printer.bold(true);
			printer.println(`น้ำหนักสินค้า:      ${line.weight}`);
			printer.bold(false);
			printer.println(``);
		}
		printer.setTextSize(1, 1);
		printer.println(summaryCalculateText);
		printer.println("");
		printer.println("");
		if (line.isSplit !== "none") {
			if (!line.isTransportationFee) {
				printer.println(employeeAmountText);
			} else if (line.isTransportationFee) {
				printer.println(employeeAllTransportationFeeText);
			}
			printer.println("");
		}
		if (line.isHarvestRate) {
			printer.println(`ยอดค่าตัด:  ${line.employeeAmount}`);
		}
		printer.println(`คนตัด: ${line.employeeDisplayName}`);
		printer.partialCut();
	}
	try {
		await printer.execute();
		return { result: "print done" };
	} catch (e) {
		return {
			result: "print fail",
			error: { message: e instanceof Error ? e.message : String(e) },
		};
	}
}
