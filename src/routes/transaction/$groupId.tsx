import { createFileRoute } from "@tanstack/react-router";
import { TransactionMainFormNew } from "@/components/transactions/TransactionMainForm";

export const Route = createFileRoute("/transaction/$groupId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	return (
		<div>
			<TransactionMainFormNew groupId={groupId} />
		</div>
	);
}
