import type { TransactionLinesType } from "@/utils/transaction.schema";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardAction,
	CardFooter,
} from "@/components/ui/card";
import { summaryTransactionText } from "@/utils/utils";
import { useGetEmployees, useGetProducts } from "@/utils/transaction.hooks";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { config } from "@/utils/config";

export default function TransactionSummary({
	lines,
}: {
	lines: TransactionLinesType[];
}) {
	const palmProductIds = config.product.palmProductId;
	return (
		<Card>
			<CardHeader>
				<CardTitle>สรุปรายการ</CardTitle>
			</CardHeader>
			<CardContent>
				{lines.map((line, index) => {
					const { summaryCalculateText } = summaryTransactionText(line);
					return (
						<div key={index} className="flex flex-col p-2">
							<Card>
								<CardHeader>
									<CardTitle></CardTitle>
									<CardAction>รายการที่ {index + 1}</CardAction>
								</CardHeader>
								<CardContent>
									<h2 className="">สินค้า: </h2>
									<h2 className="">{summaryCalculateText}</h2>
								</CardContent>
							</Card>
						</div>
					);
				})}
			</CardContent>
			<CardFooter className="flex flex-col justify-end items-end">
				{/* <p>รวมรายการ: {lines.length}</p>
				<p>
					รวมน้ำหนัก:{" "}
					{lines.reduce((acc, line) => acc + parseFloat(line.weight || "0"), 0)}
				</p>
				<p>
					ยอดรวม:{" "}
					{lines.reduce(
						(acc, line) => acc + parseFloat(line.totalAmount || "0"),
						0,
					)}
				</p>
				{lines.some((line) =>
					palmProductIds?.some((id) => id === line.productId),
				) && (
					<>
						<p>ค่าตัดปาล์ม: {totalHarvestRate.toLocaleString()}</p>
						<p>เหลือ: {remaining.toLocaleString()}</p>
						<p>ค่านำส่ง: {totalPromotionAmount.toLocaleString()}</p>
					</>
				)} */}
			</CardFooter>
		</Card>
	);
}
