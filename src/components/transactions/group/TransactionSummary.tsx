import type { TransactionLinesType } from "@/utils/transaction.schema";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

interface LookupData {
	value: string;
	label: string;
}

export default function TransactionSummary({
	lines,
	productsData,
	employeesData,
}: {
	lines: TransactionLinesType[];
	productsData: LookupData[];
	employeesData: LookupData[];
}) {
	const getProductName = (productId: string) =>
		productsData.find((p) => p.value === productId)?.label ?? "";
	const getEmployeeName = (employeeId: string) =>
		employeesData.find((e) => e.value === employeeId)?.label ?? "";

	// ── Group by product ──
	const productGroups = new Map<
		string,
		{
			productName: string;
			totalWeight: number;
			price: number;
			totalAmount: number;
			farmerAmount: number;
			employeeAmount: number;
			promotionAmount: number;
		}
	>();

	for (const line of lines) {
		if (!line.productId) continue;
		const name = getProductName(line.productId);
		const existing = productGroups.get(line.productId) ?? {
			productName: name,
			totalWeight: 0,
			price: 0,
			totalAmount: 0,
			farmerAmount: 0,
			employeeAmount: 0,
			promotionAmount: 0,
		};
		existing.totalWeight += parseFloat(line.weight) || 0;
		existing.price = parseFloat(line.price) || 0;
		existing.totalAmount += parseFloat(line.totalAmount) || 0;
		existing.farmerAmount +=
			line.isTransportationFee && line.transportationFeeFarmerAmount
				? parseFloat(line.transportationFeeFarmerAmount) || 0
				: parseFloat(line.farmerAmount) || 0;
		existing.employeeAmount +=
			line.isTransportationFee && line.transportationFeeEmployeeAmount
				? parseFloat(line.transportationFeeEmployeeAmount) || 0
				: parseFloat(line.employeeAmount) || 0;
		existing.promotionAmount += parseFloat(line.promotionAmount) || 0;
		productGroups.set(line.productId, existing);
	}

	// ── Group by employee → product ──
	const employeeGroups = new Map<
		string,
		{
			employeeName: string;
			products: Map<
				string,
				{
					productName: string;
					totalWeight: number;
					price: number;
					totalAmount: number;
					employeeAmount: number;
				}
			>;
			totalEmployeeAmount: number;
		}
	>();

	for (const line of lines) {
		if (!line.employeeId || !line.productId) continue;
		const empName = getEmployeeName(line.employeeId);
		const existing = employeeGroups.get(line.employeeId) ?? {
			employeeName: empName,
			products: new Map(),
			totalEmployeeAmount: 0,
		};

		const prodName = getProductName(line.productId);
		const existingProd = existing.products.get(line.productId) ?? {
			productName: prodName,
			totalWeight: 0,
			price: 0,
			totalAmount: 0,
			employeeAmount: 0,
		};

		existingProd.totalWeight += parseFloat(line.weight) || 0;
		existingProd.price = parseFloat(line.price) || 0;
		existingProd.totalAmount += parseFloat(line.totalAmount) || 0;
		const empAmt =
			line.isTransportationFee && line.transportationFeeEmployeeAmount
				? parseFloat(line.transportationFeeEmployeeAmount) || 0
				: parseFloat(line.employeeAmount) || 0;
		existingProd.employeeAmount += empAmt;
		existing.products.set(line.productId, existingProd);

		existing.totalEmployeeAmount += empAmt;
		employeeGroups.set(line.employeeId, existing);
	}

	// ── Grand totals ──
	let grandTotalAmount = 0;
	let grandFarmerAmount = 0;
	let grandEmployeeAmount = 0;
	let grandPromotionAmount = 0;
	for (const agg of productGroups.values()) {
		grandTotalAmount += agg.totalAmount;
		grandFarmerAmount += agg.farmerAmount;
		grandEmployeeAmount += agg.employeeAmount;
		grandPromotionAmount += agg.promotionAmount;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>สรุปรายการ</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-4"></CardContent>

			{/* ── By Product ── */}
			<div className="w-full border-t gap-2 p-6 pt-4">
				<h3 className="font-semibold mb-2">สรุปยอดซื้อ (ตามสินค้า)</h3>
				{[...productGroups.entries()].map(([productId, agg]) => (
					<div key={productId} className="mb-3">
						<p className="font-medium">{agg.productName}</p>
						<p className="text-sm text-muted-foreground ml-2">
							{agg.totalWeight} x {agg.price} = {agg.totalAmount}
						</p>
						<div className="flex justify-between ml-2">
							<span className="text-sm">ยอดเถ้าแก่:</span>
							<span className="text-sm">{agg.farmerAmount}</span>
						</div>
						{agg.employeeAmount > 0 && (
							<div className="flex justify-between ml-2">
								<span className="text-sm">ยอดคนตัด:</span>
								<span className="text-sm">{agg.employeeAmount}</span>
							</div>
						)}
						{agg.promotionAmount > 0 && (
							<div className="flex justify-between ml-2">
								<span className="text-sm">ค่านำส่ง:</span>
								<span className="text-sm">{agg.promotionAmount}</span>
							</div>
						)}
					</div>
				))}
			</div>

			{/* ── By Employee ── */}
			{employeeGroups.size > 0 && (
				<div className="w-full border-t gap-2 p-6 pt-4">
					<h3 className="font-semibold mb-2">สรุปยอดซื้อ (ตามคนตัด)</h3>
					{[...employeeGroups.entries()].map(([employeeId, emp]) => (
						<div key={employeeId} className="mb-3">
							<p className="font-medium">{emp.employeeName}</p>
							{[...emp.products.entries()].map(([productId, prod]) => (
								<div key={productId} className="ml-2">
									<p className="text-sm text-muted-foreground">
										{prod.productName}: {prod.totalWeight} x {prod.price} ={" "}
										{prod.totalAmount}
									</p>
									<div className="flex justify-between">
										<span className="text-sm">ยอดคนตัด:</span>
										<span className="text-sm">{prod.employeeAmount}</span>
									</div>
								</div>
							))}
							{emp.products.size > 1 && (
								<div className="flex justify-between ml-2 border-t mt-1 pt-1">
									<span className="text-sm font-medium">รวม:</span>
									<span className="text-sm font-medium">
										{emp.totalEmployeeAmount}
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* ── Grand Total ── */}
			<CardFooter className="flex flex-col gap-4 pt-4">
				<div className="w-full border-t gap-2 p-4 pt-4">
					<div className="flex justify-between font-semibold">
						<span>ยอดซื้อรวม:</span>
						<span>{grandTotalAmount}</span>
					</div>
					<div className="flex justify-between">
						<span>ยอดเถ้าแก่รวม:</span>
						<span>{grandFarmerAmount}</span>
					</div>
					{grandEmployeeAmount > 0 && (
						<div className="flex justify-between">
							<span>ยอดคนตัดรวม:</span>
							<span>{grandEmployeeAmount}</span>
						</div>
					)}
					{grandPromotionAmount > 0 && (
						<div className="flex justify-between">
							<span>ค่านำส่งรวม:</span>
							<span>{grandPromotionAmount}</span>
						</div>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
