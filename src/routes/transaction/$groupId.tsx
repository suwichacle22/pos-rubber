import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transaction/$groupId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { groupId } = Route.useParams();
	return <div>Hello {`/transaction/${groupId}`}!</div>;
}
