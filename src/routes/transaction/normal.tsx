import { TransactionMainFormNew } from "@/components/transactions/TransactionMainFormNew";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transaction/normal")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<TransactionMainFormNew />
		</div>
	)
}
