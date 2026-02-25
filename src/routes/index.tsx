import { createFileRoute } from "@tanstack/react-router";
import SummaryProducts from "@/components/dashboard/SummaryProducts";
import { useState } from "react";
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
	const today = getTodayString();
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);

	return (
		<div className="flex flex-col gap-8 p-6">
			{/* Date range filter */}
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					<label
						htmlFor="startDate"
						className="text-sm font-medium whitespace-nowrap"
					>
						ตั้งแต่
					</label>
					<Input
						id="startDate"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="w-auto"
					/>
				</div>
				<div className="flex items-center gap-2">
					<label
						htmlFor="endDate"
						className="text-sm font-medium whitespace-nowrap"
					>
						ถึง
					</label>
					<Input
						id="endDate"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="w-auto"
					/>
				</div>
			</div>
			<SummaryProducts startDate={startDate} endDate={endDate} />
		</div>
	);
}
