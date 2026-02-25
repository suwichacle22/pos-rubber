import { useState } from "react";
import {
	type ColumnDef,
	type RowSelectionState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import { formatDateThaiConvex } from "@/utils/utils";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export type TransactionLineRow = {
	_id: string;
	transactionGroupId: string;
	groupCreationTime: number | null;
	groupStatus: string | null;
	farmerName: string;
	productName: string;
	weight: number | null;
	price: number | null;
	totalAmount: number | null;
	totalNetAmount: number | null;
};

const columns: ColumnDef<TransactionLineRow>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="เลือกทั้งหมด"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="เลือกรายการ"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "groupCreationTime",
		header: "วันที่/เวลา",
		cell: ({ row }) => {
			const val = row.getValue<number | null>("groupCreationTime");
			if (val == null) return "-";
			const { dateThai, time } = formatDateThaiConvex(val);
			return `${dateThai} ${time}`;
		},
	},
	{
		accessorKey: "farmerName",
		header: "ลูกค้า",
	},
	{
		accessorKey: "productName",
		header: "สินค้า",
	},
	{
		accessorKey: "weight",
		header: "น้ำหนัก",
		cell: ({ row }) => {
			const val = row.getValue<number | null>("weight");
			return val != null ? val : "-";
		},
	},
	{
		accessorKey: "price",
		header: "ราคา",
		cell: ({ row }) => {
			const val = row.getValue<number | null>("price");
			return val != null ? val : "-";
		},
	},
	{
		id: "totalNetAmount",
		header: "ยอดรวม",
		cell: ({ row }) => {
			const val = row.original.totalNetAmount ?? row.original.totalAmount;
			return val != null ? val : "-";
		},
	},
];

export default function TransactionDataTable({
	data,
}: {
	data: TransactionLineRow[];
}) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const products = useQuery(api.transactions.queries.getProductForm);

	const table = useReactTable({
		data,
		columns,
		state: { rowSelection },
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	// ── Summary: selected rows or all rows ──
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const hasSelection = selectedRows.length > 0;
	const summaryRows = hasSelection
		? selectedRows
		: table.getCoreRowModel().rows;

	const productGroups = new Map<
		string,
		{ totalWeight: number; price: number; totalAmount: number }
	>();
	for (const row of summaryRows) {
		const { productName, weight, price, totalAmount, totalNetAmount } = row.original;
		if (!productName || productName === "-") continue;
		const existing = productGroups.get(productName) ?? {
			totalWeight: 0,
			price: 0,
			totalAmount: 0,
		};
		existing.totalWeight += weight ?? 0;
		existing.price = price ?? 0;
		existing.totalAmount += totalNetAmount ?? totalAmount ?? 0;
		productGroups.set(productName, existing);
	}

	let grandTotal = 0;
	for (const agg of productGroups.values()) {
		// Calculate average price from totalAmount / totalWeight
		agg.price = agg.totalWeight > 0 ? agg.totalAmount / agg.totalWeight : 0;
		grandTotal += agg.totalAmount;
	}

	return (
		<div className="flex flex-col gap-4">
			{/* ── Product Summary Card ── */}
			<Card>
				<CardHeader>
					<CardTitle>
						{hasSelection ? "สรุปรายการที่เลือก" : "สรุปรายการทั้งหมด"}
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<p className="text-sm text-muted-foreground">
						{hasSelection
							? `เลือก ${selectedRows.length} จาก ${data.length} รายการ`
							: `ทั้งหมด ${data.length} รายการ`}
					</p>
					{productGroups.size > 0 ? (
						<>
							{[...productGroups.entries()]
							.sort(([a], [b]) => {
								const aIdx = products?.findIndex((p) => p.label === a) ?? 0;
								const bIdx = products?.findIndex((p) => p.label === b) ?? 0;
								return aIdx - bIdx;
							})
							.map(([productName, agg]) => (
									<div
										key={productName}
										className="flex justify-between text-sm"
									>
										<span>
											{productName}: {agg.totalWeight} x{" "}
											{agg.price.toFixed(2)}
										</span>
										<span>{agg.totalAmount.toFixed(2)}</span>
									</div>
								),
							)}
							<div className="flex justify-between font-semibold border-t pt-2 mt-1">
								<span>ยอดรวม:</span>
								<span>{grandTotal.toFixed(2)}</span>
							</div>
						</>
					) : (
						<p className="text-sm text-muted-foreground">
							ไม่มีรายการสินค้า
						</p>
					)}
				</CardContent>
			</Card>

			{/* ── Data Table ── */}
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									ไม่มีรายการ
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end gap-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					ก่อนหน้า
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					ถัดไป
				</Button>
			</div>
		</div>
	);
}
