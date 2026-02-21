import { Card, CardDescription } from "@/components/ui/card";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateThaiConvex } from "@/utils/utils";

type TransactionGroup = FunctionReturnType<
	typeof api.transactions.queries.getTransactionGroup
>[number];

export default function PendingTransaction({
	transactionGroup,
}: {
	transactionGroup: TransactionGroup;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					รายการของ {transactionGroup.groupName ?? "ยังไม่มีชื่อ"}
				</CardTitle>
				<CardDescription>
					{formatDateThaiConvex(transactionGroup._creationTime)}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p>รายการที่ยังไม่เสร็จสิ้น</p>
			</CardContent>
		</Card>
	);
}
