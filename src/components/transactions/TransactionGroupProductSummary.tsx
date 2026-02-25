import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";

export default function TransactionGroupProductSummary({
	groupId,
}: {
	groupId: string;
}) {
	const lines = useQuery(api.transactions.queries.getTransactionLinesByGroupId, {
		groupId: groupId as Id<"transactionGroups">,
	});
	const products = useQuery(api.transactions.queries.getProductForm);

	if (lines === undefined || products === undefined) {
		return <p className="text-xs text-muted-foreground">กำลังโหลด...</p>;
	}

	const getProductName = (productId: string) =>
		products.find((p) => p.value === productId)?.label ?? "-";

	const productGroups = new Map<
		string,
		{ productName: string; totalWeight: number; totalAmount: number }
	>();

	for (const line of lines) {
		if (!line.productId) continue;
		const name = getProductName(line.productId);
		const existing = productGroups.get(line.productId) ?? {
			productName: name,
			totalWeight: 0,
			totalAmount: 0,
		};
		existing.totalWeight += line.weight ?? 0;
		existing.totalAmount += line.totalNetAmount ?? line.totalAmount ?? 0;
		productGroups.set(line.productId, existing);
	}

	if (productGroups.size === 0) {
		return (
			<p className="text-xs text-muted-foreground">ยังไม่มีรายการสินค้า</p>
		);
	}

	let grandTotal = 0;
	for (const agg of productGroups.values()) {
		grandTotal += agg.totalAmount;
	}

	return (
		<div className="flex flex-col gap-1">
			{[...productGroups.entries()]
			.sort(([, a], [, b]) => {
				const aLines = products.find((p) => p.label === a.productName)?.productLines ?? Infinity;
				const bLines = products.find((p) => p.label === b.productName)?.productLines ?? Infinity;
				return aLines - bLines;
			})
			.map(([productId, agg]) => (
				<div key={productId} className="flex justify-between text-sm">
					<span className="text-muted-foreground">{agg.productName}</span>
					<span>
						{agg.totalWeight} x{" "}
						{agg.totalWeight > 0
							? (agg.totalAmount / agg.totalWeight).toFixed(2)
							: 0}{" "}
						= {agg.totalAmount.toFixed(2)}
					</span>
				</div>
			))}
			{productGroups.size > 1 && (
				<div className="flex justify-between text-sm font-semibold border-t pt-1 mt-1">
					<span>รวม</span>
					<span>{grandTotal.toFixed(2)}</span>
				</div>
			)}
		</div>
	);
}
