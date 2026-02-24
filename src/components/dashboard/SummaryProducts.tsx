import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";

export default function SummaryProducts({ date }: { date: string }) {
	const { data, isLoading } = useQuery(
		convexQuery(api.transactions.queries.getDailySummary, { date }),
	);

	return (
		<Card className="">
			<CardHeader>
				<CardTitle>สรุปรายวัน</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-muted-foreground">กำลังโหลด...</p>
				) : !data || data.length === 0 ? (
					<p className="text-muted-foreground">ไม่มีรายการในวันนี้</p>
				) : (
					<div className="space-y-2">
						{data.map((row: any) => (
							<div
								key={row.productName}
								className="flex items-center justify-between gap-4"
							>
								<span className="font-medium">{row.productName}:</span>
								<span>
									{formatNumber(row.totalWeight)} kg ×{" "}
									{formatNumber(row.averagePrice)} ={" "}
									{formatNumber(row.totalAmount)}
								</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
