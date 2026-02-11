import FarmerCard from "@/components/farmer/FarmerCard";
import { FarmerForm } from "@/components/farmer/FarmerForm";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { getFarmer } from "@/utils/transaction.functions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/farmer")({
	component: RouteComponent,
	loader: async () => {
		const farmers = await getFarmer();
		return { farmers };
	},
});

function RouteComponent() {
	const { farmers } = Route.useLoaderData();
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
				<FarmerForm />
				<EmployeeForm />
			</div>
			<div className="flex flex-col gap-4 w-full max-w-2xl">
				<div className="flex text-2xl font-bold justify-items-start items-start">
					เกษตรกร
				</div>
				<div className="flex flex-col gap-2">
					{farmers?.map((farmer) => (
						<FarmerCard key={farmer.farmerId} farmerData={farmer} />
					))}
				</div>
			</div>
		</div>
	);
}
