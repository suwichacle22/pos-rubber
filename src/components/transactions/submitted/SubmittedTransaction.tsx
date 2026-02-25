import { Card, CardAction, CardDescription } from "@/components/ui/card";
import { api } from "convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateThaiConvex } from "@/utils/utils";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrashIcon } from "lucide-react";
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

	const [isDeleting, setIsDeleting] = useState(false);
	const deleteTransactionGroup = useMutation(
		api.transactions.mutations.deleteTransactionGroup,
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
					<div className="flex items-center gap-2">
						<Badge variant="secondary">จ่ายแล้ว</Badge>
						<Button
							variant="outline"
							size="sm"
							className="hover:bg-red-500 flex flex-row gap-2"
							disabled={isDeleting}
							onClick={async (e) => {
								e.stopPropagation();
								setIsDeleting(true);
								try {
									await deleteTransactionGroup({
										transactionGroupId: transactionGroup._id,
									});
								} finally {
									setIsDeleting(false);
								}
							}}
						>
							{isDeleting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<TrashIcon className="h-4 w-4" />
							)}
							ยกเลิก
						</Button>
					</div>
				</CardAction>
			</CardHeader>
			<CardContent>
				<TransactionGroupProductSummary groupId={transactionGroup._id} />
			</CardContent>
		</Card>
	);
}
