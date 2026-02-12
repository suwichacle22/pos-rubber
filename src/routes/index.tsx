import { createFileRoute } from "@tanstack/react-router";
import SummaryProducts from "@/components/dashboard/SummaryProducts";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div>
			<SummaryProducts />
		</div>
	);
}
