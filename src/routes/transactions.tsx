import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { Input } from "@/components/ui/input";
import PendingTransaction from "@/components/transactions/pending/PendingTransaction";
import SubmittedTransaction from "@/components/transactions/submitted/SubmittedTransaction";
import TransactionDataTable from "@/components/transactions/TransactionDataTable";

function getTodayString() {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function dateToRange(dateStr: string) {
	const [year, month, day] = dateStr.split("-").map(Number);
	const startMs =
		Date.UTC(year, month - 1, day, 0, 0, 0, 0) - 7 * 60 * 60 * 1000;
	const endMs =
		Date.UTC(year, month - 1, day, 23, 59, 59, 999) - 7 * 60 * 60 * 1000;
	return { startMs, endMs };
}

export const Route = createFileRoute("/transactions")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery(
				convexQuery(api.transactions.queries.getTransactionGroup),
			),
			context.queryClient.prefetchQuery(
				convexQuery(
					api.transactions.queries.getAllTransactionLinesWithDetails,
				),
			),
		]);
	},
});

function RouteComponent() {
	const today = getTodayString();
	const [startDate, setStartDate] = useState(today);
	const [endDate, setEndDate] = useState(today);

	const { data: transactionGroups } = useSuspenseQuery(
		convexQuery(api.transactions.queries.getTransactionGroup),
	);
	const { data: allLines } = useSuspenseQuery(
		convexQuery(api.transactions.queries.getAllTransactionLinesWithDetails),
	);

	const { startMs } = dateToRange(startDate);
	const { endMs } = dateToRange(endDate);

	const filteredGroups = transactionGroups.filter(
		(group) =>
			group._creationTime >= startMs && group._creationTime <= endMs,
	);
	const filteredLines = allLines.filter(
		(line) =>
			line.groupCreationTime != null &&
			line.groupCreationTime >= startMs &&
			line.groupCreationTime <= endMs,
	);

	const pendingGroups = filteredGroups.filter(
		(group) => group.status === "pending",
	);
	const submittedGroups = filteredGroups.filter(
		(group) => group.status === "submitted",
	);

	return (
		<div className="flex flex-col gap-8 p-6">
			{/* Date range filter */}
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					<label htmlFor="startDate" className="text-sm font-medium whitespace-nowrap">
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
					<label htmlFor="endDate" className="text-sm font-medium whitespace-nowrap">
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

			{/* Section 1: Pending — hidden when empty */}
			{pendingGroups.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">
						รายการที่รอดำเนินการ
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{pendingGroups.map((group) => (
							<PendingTransaction
								key={group._id}
								transactionGroup={group}
							/>
						))}
					</div>
				</section>
			)}

			{/* Section 2: Submitted/History */}
			{submittedGroups.length > 0 && (
				<section className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold">ประวัติรายการ</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{submittedGroups.map((group) => (
							<SubmittedTransaction
								key={group._id}
								transactionGroup={group}
							/>
						))}
					</div>
				</section>
			)}

			{/* Section 3: Data Table */}
			<section className="flex flex-col gap-4">
				<h2 className="text-lg font-semibold">รายการทั้งหมด</h2>
				<TransactionDataTable data={filteredLines} />
			</section>
		</div>
	);
}
