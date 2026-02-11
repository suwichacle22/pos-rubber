import { TransactionMainForm } from "@/components/transactions/TransactionMainFormNew";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<p>transactions</p>
		</div>
	);
}
