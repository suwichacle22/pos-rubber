import { Spinner } from "@/components/ui/spinner";
import { EmptyTransaction } from "@/components/transactions/EmptyTransaction";
import { formatDateThai } from "@/utils/utils";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import PendingTransaction from "@/components/transactions/pending/PendingTransaction";

export const Route = createFileRoute("/transactions")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			convexQuery(api.transactions.queries.getTransactionGroup),
		);
	},
});

function RouteComponent() {
	const { data: transactionGroups } = useSuspenseQuery(
		convexQuery(api.transactions.queries.getTransactionGroup),
	);

	const pendingTransactionGroups = transactionGroups.filter(
		(group) => group.status === "pending",
	);

	if (transactionGroups.length === 0) return <EmptyTransaction />;
	return (
		<div>
			<div className="">
				<h1>รายการที่ยังไม่เสร็จสิ้น</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
					{pendingTransactionGroups.map((group) => (
						<PendingTransaction key={group._id} transactionGroup={group} />
					))}
				</div>
			</div>
		</div>
	);
}
