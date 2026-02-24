import { Card, CardAction, CardDescription } from "@/components/ui/card";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateThaiConvex } from "@/utils/utils";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import TransactionGroupProductSummary from "@/components/transactions/TransactionGroupProductSummary";

type TransactionGroup = FunctionReturnType<
	typeof api.transactions.queries.getTransactionGroup
>[number];

export default function SubmittedTransaction({
	transactionGroup,
}: {
	transactionGroup: TransactionGroup;
}) {
	const navigate = useNavigate();
	const handleNavigateTransactionGroup = async () => {
		navigate({
			to: "/transaction/$groupId",
			params: { groupId: transactionGroup._id },
		});
	};
	const farmer = useQuery(
		api.transactions.queries.getFarmerById,
		transactionGroup.farmerId
			? {
					farmerId: transactionGroup.farmerId as Id<"farmers">,
				}
			: "skip",
	);

	const { dateThai, time } = formatDateThaiConvex(
		transactionGroup._creationTime,
	);

	return (
		<Card
			onClick={handleNavigateTransactionGroup}
			className="cursor-pointer hover:bg-gray-600"
		>
			<CardHeader>
				<CardTitle>รายการของ {farmer?.displayName ?? "ยังไม่มีชื่อ"}</CardTitle>
				<CardDescription>
					{dateThai} {time}
				</CardDescription>
				<CardAction>
					<Badge variant="secondary">จ่ายแล้ว</Badge>
				</CardAction>
			</CardHeader>
			<CardContent>
				<TransactionGroupProductSummary groupId={transactionGroup._id} />
			</CardContent>
		</Card>
	);
}
