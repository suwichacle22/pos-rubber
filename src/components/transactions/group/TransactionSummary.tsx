import type { TransactionLinesType } from "@/utils/transaction.schema";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardAction,
	CardFooter,
} from "@/components/ui/card";
import { summaryTransactionText, formatNumber } from "@/utils/utils";

interface ProductData {
	value: string;
	label: string;
}

export default function TransactionSummary({
	lines,
	productsData,
}: {
	lines: TransactionLinesType[];
	productsData: ProductData[];
}) {
	const getProductName = (productId: string) =>
		productsData.find((p) => p.value === productId)?.label ?? "";

	// Group lines by productId for summary
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

	// Grand totals
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
			<div className="w-full border-t gap-2 p-6 pt-4">
				<h3 className="font-semibold mb-2">สรุปยอดซื้อ</h3>
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
			{/* Grouped product summary + grand total */}
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
