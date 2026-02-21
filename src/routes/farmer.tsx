import FarmerCard from "@/components/farmer/FarmerCard";
import { FarmerForm } from "@/components/farmer/FarmerForm";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/farmer")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: farmers } = useSuspenseQuery(
		convexQuery(api.transactions.queries.getFarmersWithEmployees),
	);
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
				<FarmerForm />
			</div>
			<div className="flex flex-col gap-4 w-full max-w-2xl">
				<div className="flex text-2xl font-bold justify-items-start items-start">
					เกษตรกร
				</div>
				<div className="flex flex-col gap-2">
					{farmers?.map((farmer) => (
						<FarmerCard key={farmer._id} farmerData={farmer} />
					))}
				</div>
			</div>
		</div>
	);
}
