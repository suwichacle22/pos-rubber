import { TransactionMainFormNew } from "@/components/transactions/TransactionMainFormNew";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transaction/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<TransactionMainFormNew />
		</div>
	);
}
