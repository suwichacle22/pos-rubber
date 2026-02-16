import { createFileRoute } from "@tanstack/react-router";
import SummaryProducts from "@/components/dashboard/SummaryProducts";
import { useState } from "react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({ component: App });

function getTodayString() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function App() {
	const [date, setDate] = useState(getTodayString);

	return (
		<div className="flex flex-col space-y-4 p-4">
			<div className="flex flex-col w-1/5">
				<FieldGroup>
					<Field>
						<FieldLabel>วันที่และเวลา</FieldLabel>
						<Input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							placeholder="วันที่และเวลา"
						/>
					</Field>
				</FieldGroup>
			</div>
			<SummaryProducts date={date} />
		</div>
	);
}
