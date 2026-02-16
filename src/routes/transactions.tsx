import { useGetEmployees, useGetFarmersForm } from "@/utils/transaction.hooks";
import { formatDateThai } from "@/utils/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transactions")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useGetEmployees();
	console.log(data?.[0].createdAt);
	const { dateThai, time } = formatDateThai(data?.[0].createdAt ?? new Date());
	return (
		<div>
			<p>transactions</p>
			<p>{dateThai}</p>
			<p>{time}</p>
		</div>
	);
}
