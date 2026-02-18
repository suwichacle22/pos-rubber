import type { TransactionLinesType } from "@/utils/transaction.schema";
import { productIds } from "@/config";
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

export default function TransactionSummary({
	lines,
}: {
	lines: TransactionLinesType[];
}) {
	const { data: productsData } = useGetProducts();
	const { data: employeesData } = useGetEmployees();

	const palmLines = lines.filter((line) => line.productId === productIds.palm);
	const totalHarvestRate = palmLines.reduce(
		(acc, line) => acc + parseFloat(line.employeeAmount || "0"),
		0,
	);
	const palmTotalAmount = palmLines.reduce(
		(acc, line) => acc + parseFloat(line.totalAmount || "0"),
		0,
	);
	const totalPromotionAmount = palmLines.reduce(
		(acc, line) => acc + parseFloat(line.promotionAmount || "0"),
		0,
	);
	const remaining = palmTotalAmount - totalHarvestRate;
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
									<CardTitle>
										{
											employeesData?.find(
												(employee) => employee.employeeId === line.employeeId,
											)?.displayName
										}
									</CardTitle>
									<CardAction>รายการที่ {index + 1}</CardAction>
								</CardHeader>
								<CardContent>
									<h2 className="">
										สินค้า:{" "}
										{
											productsData?.find(
												(product) => product.productId === line.productId,
											)?.productName
										}
									</h2>
									<h2 className="">{summaryCalculateText}</h2>
								</CardContent>
							</Card>
						</div>
					);
				})}
			</CardContent>
			<CardFooter className="flex flex-col justify-end items-end">
				<p>รวมรายการ: {lines.length}</p>
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
				{lines.some((line) => line.productId === productIds.palm) && (
					<>
						<p>ค่าตัดปาล์ม: {totalHarvestRate.toLocaleString()}</p>
						<p>เหลือ: {remaining.toLocaleString()}</p>
						<p>ค่านำส่ง: {totalPromotionAmount.toLocaleString()}</p>
					</>
				)}
			</CardFooter>
		</Card>
	);
}
