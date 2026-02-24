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

type PrintLine = PrintSummaryData["lines"][number];
type SummaryTexts = ReturnType<typeof summaryTransactionTextFromConvex>;

const printer = new ThermalPrinter({
	type: PrinterTypes.EPSON,
	interface: "tcp://192.168.1.181",
	width: 42,
});

// ─── Helper functions ────────────────────────────────────────

function printShopHeader(
	p: ThermalPrinter,
	opts: {
		farmerName: string | null | undefined;
		dateThai: string;
		time: string;
		productName?: string;
		groupName?: string;
	},
) {
	p.println("ทรัพย์ทวี");
	p.println("โทร: 089-474-0467");
	p.println("เปิดทุกวัน 7.00 - 17.00 น.");
	p.println("------------------------------------------");
	p.println(`ชื่อ: ${opts.farmerName}`);
	if (opts.groupName) {
		p.println(`หมายเหตุ: ${opts.groupName}`);
	}
	p.println(`วันที่และเวลา: ${opts.dateThai} ${opts.time}`);
	if (opts.productName) {
		p.println(`สินค้า: ${opts.productName}`);
	}
	p.println("------------------------------------------");
}

function printVehicleSection(
	p: ThermalPrinter,
	line: PrintLine,
	opts?: { boldWeight?: boolean },
) {
	p.println(`ทะเบียนรถยนต์:    ${line.carLicense}`);
	p.println(`น้ำหนักรถยนต์เข้า:  ${line.weightVehicleIn}`);
	p.println(`น้ำหนักรถยนต์ออก:  ${line.weightVehicleOut}`);
	if (opts?.boldWeight) {
		p.bold(true);
		p.println(`น้ำหนักสินค้า:      ${line.weight}`);
		p.bold(false);
	} else {
		p.println(`น้ำหนักสินค้า:      ${line.weight}`);
	}
	p.println(``);
}

function printSummaryAmount(p: ThermalPrinter, summaryCalculateText: string) {
	p.setTextSize(1, 1);
	p.println(summaryCalculateText);
	p.println("");
	p.println("");
}

function printFarmerBreakdown(
	p: ThermalPrinter,
	line: PrintLine,
	texts: SummaryTexts,
) {
	if (line.isSplit !== "none") {
		if (!line.isTransportationFee) {
			p.println(texts.farmerAmountText);
			p.println("");
			p.setTextSize(0, 0);
			p.println(texts.employeeAmountText);
		} else {
			p.println(texts.farmerCalculateTransportationFeeText);
			p.println(`${" ".repeat(13)}${texts.farmerAmountTransportationFeeText}`);
			p.println("");
			p.setTextSize(0, 0);
			p.println(texts.employeeAllTransportationFeeText);
		}
		p.println("");
	}
	if (line.isHarvestRate) {
		p.println(`ยอดค่าตัด:  ${line.employeeAmount}`);
		p.setTextSize(1, 1);
		p.println(`เหลือ:     ${line.farmerAmount}`);
		p.setTextSize(0, 0);
		p.println("");
	}
}

function printEmployeeBreakdown(
	p: ThermalPrinter,
	line: PrintLine,
	texts: SummaryTexts,
) {
	if (line.isSplit !== "none") {
		if (!line.isTransportationFee) {
			p.println(texts.employeeAmountText);
		} else {
			p.println(texts.employeeAllTransportationFeeText);
		}
		p.println("");
	}
	if (line.isHarvestRate) {
		p.println(`ยอดค่าตัด:  ${line.employeeAmount}`);
	}
}

function printPromotionSummary(
	p: ThermalPrinter,
	lines: PrintLine[],
	opts: {
		farmerName: string | null | undefined;
		dateThai: string;
		time: string;
		groupName?: string;
	},
) {
	const splitLines = lines.filter(
		(line) => line.promotionTo === "split" && line.promotionAmount,
	);
	if (splitLines.length === 0) return;

	const totalPromotionAmount = splitLines.reduce(
		(sum, line) => sum + (line.promotionAmount ?? 0),
		0,
	);
	const totalWeight = splitLines.reduce(
		(sum, line) => sum + (line.weight ?? 0),
		0,
	);

	printShopHeader(p, opts);
	p.println("ใบค่านำส่ง");
	p.println("");
	// Use rate from first line (typically same for all palm lines in a group)
	const rate = splitLines[0]?.promotionRate;
	if (rate) {
		p.println(`อัตราค่านำส่ง: ${rate * 100}`);
	}
	p.println(`น้ำหนักรวม:    ${totalWeight}`);
	p.setTextSize(1, 1);
	p.println(`ยอดค่านำส่ง:  ${totalPromotionAmount}`);
	p.setTextSize(0, 0);
	p.println("");
	const employeeName = splitLines[0]?.employeeDisplayName;
	if (employeeName) {
		p.println(`คนตัด: ${employeeName}`);
	}
	p.partialCut();
}

function printProductSummary(
	p: ThermalPrinter,
	lines: PrintLine[],
	opts: {
		farmerName: string | null | undefined;
		dateThai: string;
		time: string;
	},
) {
	// Group lines by productName
	const productGroups = new Map<
		string,
		{
			totalWeight: number;
			price: number;
			totalAmount: number;
			farmerAmount: number;
			employeeAmount: number;
			promotionAmount: number;
		}
	>();

	for (const line of lines) {
		const name = line.productName || "Unknown";
		const existing = productGroups.get(name) ?? {
			totalWeight: 0,
			price: 0,
			totalAmount: 0,
			farmerAmount: 0,
			employeeAmount: 0,
			promotionAmount: 0,
		};
		existing.totalWeight += line.weight ?? 0;
		existing.price = line.price ?? 0;
		existing.totalAmount += line.totalAmount ?? 0;
		existing.farmerAmount += line.farmerAmount ?? 0;
		existing.employeeAmount += line.employeeAmount ?? 0;
		if (line.promotionTo === "sum") {
			existing.promotionAmount += line.promotionAmount ?? 0;
		}
		productGroups.set(name, existing);
	}

	// Print header
	printShopHeader(p, { ...opts });
	p.println("สรุปยอดซื้อ");
	p.println("");

	// Print each product group
	let grandTotalAmount = 0;
	let grandFarmerAmount = 0;
	let grandEmployeeAmount = 0;
	let grandPromotionAmount = 0;

	for (const [productName, agg] of productGroups) {
		p.println(productName);
		p.println(`  ${agg.totalWeight} x ${agg.price} = ${agg.totalAmount}`);
		p.bold(true);
		p.println(`  ยอดเถ้าแก่:  ${agg.farmerAmount}`);
		p.bold(false);
		p.println(`  ยอดคนตัด:  ${agg.employeeAmount}`);
		if (agg.promotionAmount > 0) {
			p.println(`  ค่านำส่ง:    ${agg.promotionAmount}`);
		}
		p.println("");

		grandTotalAmount += agg.totalAmount;
		grandFarmerAmount += agg.farmerAmount;
		grandEmployeeAmount += agg.employeeAmount;
		grandPromotionAmount += agg.promotionAmount;
	}

	// Print grand total
	p.println("------------------------------------------");
	p.println("รวม");
	p.println(`  ยอดซื้อ:     ${grandTotalAmount}`);
	p.bold(true);
	p.setTextSize(1, 1);
	p.println(`  ยอดเถ้าแก่:  ${grandFarmerAmount}`);
	p.setTextSize(0, 0);
	p.bold(false);
	p.println(`  ยอดคนตัด:  ${grandEmployeeAmount}`);
	if (grandPromotionAmount > 0) {
		p.println(`  ค่านำส่ง:    ${grandPromotionAmount}`);
	}
	p.println("------------------------------------------");
	p.partialCut();
}

// ─── Main orchestrator ───────────────────────────────────────

/**
 * Print receipt — receives data from Convex action getPrintSummaryData.
 * Prints farmer receipt for every line, employee receipt only when split/harvestRate,
 * and a product summary receipt when there are multiple lines.
 */
export async function printReceipt(
	transactionData: PrintSummaryData,
): Promise<
	| { result: "print done" }
	| { result: "print fail"; error: { message: string } }
> {
	// Clear buffer from previous print jobs to prevent reprinting old receipts
	printer.clear();
	printer.setCharacterSet("TIS18_THAI");
	const { dateThai, time } = formatDateThaiConvex(
		transactionData.transactionGroup._creationTime,
	);
	const farmerName = transactionData.farmer?.displayName;
	const groupName = transactionData.transactionGroup.groupName;
	const headerBase = { farmerName, dateThai, time, groupName };

	for (const line of transactionData.lines) {
		const texts = summaryTransactionTextFromConvex(line);
		const hasEmployee = line.isSplit !== "none" || line.isHarvestRate;

		// Farmer receipt (always printed)
		printShopHeader(printer, { ...headerBase, productName: line.productName });
		if (line.isVehicle) {
			printVehicleSection(printer, line);
		}
		printSummaryAmount(printer, texts.summaryCalculateText);
		printFarmerBreakdown(printer, line, texts);
		if (line.promotionTo === "sum" && line.promotionAmount) {
			printer.println(texts.promotionRateText);
			printer.println(texts.promotionAmountText);
			printer.setTextSize(1, 1);
			printer.println(
				`รวมค่านำส่ง:  ${(line.farmerAmount ?? 0) + (line.promotionAmount ?? 0)}`,
			);
			printer.setTextSize(0, 0);
			printer.println("");
		}
		if (hasEmployee) {
			printer.println(`คนตัด: ${line.employeeDisplayName}`);
		}
		printer.partialCut();

		// Employee receipt (only when employee is involved)
		if (hasEmployee) {
			printShopHeader(printer, {
				...headerBase,
				productName: line.productName,
			});
			if (line.isVehicle) {
				printVehicleSection(printer, line, { boldWeight: true });
			}
			printSummaryAmount(printer, texts.summaryCalculateText);
			printEmployeeBreakdown(printer, line, texts);
			printer.println(`คนตัด: ${line.employeeDisplayName}`);
			printer.partialCut();
		}
	}

	// Product summary receipt (only when more than 1 line)
	if (transactionData.lines.length > 1) {
		printProductSummary(printer, transactionData.lines, headerBase);
	}

	// Aggregated promotion receipt for "split" lines (printed after summary)
	printPromotionSummary(printer, transactionData.lines, headerBase);

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

/**
 * Print only the product summary receipt (no individual line receipts).
 * Marks transaction as submitted, then prints grouped product totals.
 */
export async function printSummaryOnly(
	transactionData: PrintSummaryData,
): Promise<
	| { result: "print done" }
	| { result: "print fail"; error: { message: string } }
> {
	printer.clear();
	printer.setCharacterSet("TIS18_THAI");
	const { dateThai, time } = formatDateThaiConvex(
		transactionData.transactionGroup._creationTime,
	);
	const farmerName = transactionData.farmer?.displayName;
	const groupName = transactionData.transactionGroup.groupName;
	const headerBase = { farmerName, dateThai, time, groupName };

	printProductSummary(printer, transactionData.lines, headerBase);

	// Aggregated promotion receipt for "split" lines (printed after summary)
	printPromotionSummary(printer, transactionData.lines, headerBase);

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
