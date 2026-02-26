import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { PencilIcon, TrashIcon, XIcon, CheckIcon } from "lucide-react";

export default function EmployeeSplitDefaults({
	employeeId,
}: {
	employeeId: Id<"employees">;
}) {
	const defaults = useQuery(
		api.transactions.queries.getSplitDefaultsByEmployeeId,
		{ employeeId },
	);
	const updateSplitDefault = useMutation(
		api.transactions.mutations.updateSplitDefault,
	);
	const deleteSplitDefault = useMutation(
		api.transactions.mutations.deleteSplitDefault,
	);
	const [editingId, setEditingId] = useState<string | null>(null);

	if (!defaults || defaults.length === 0) return null;

	return (
		<div className="mt-2 space-y-1">
			<p className="text-sm font-medium text-muted-foreground">
				ค่าเริ่มต้น:
			</p>
			{defaults.map((d) => (
				<div key={d._id}>
					{editingId === d._id ? (
						<EditRow
							splitDefault={d}
							onSave={async (fields) => {
								try {
									await updateSplitDefault({
										splitDefaultId: d._id as Id<"splitDefaults">,
										...fields,
									});
									toast.success("บันทึกสำเร็จ");
									setEditingId(null);
								} catch {
									toast.error("เกิดข้อผิดพลาด");
								}
							}}
							onCancel={() => setEditingId(null)}
						/>
					) : (
						<DisplayRow
							splitDefault={d}
							onEdit={() => setEditingId(d._id)}
							onDelete={async () => {
								try {
									await deleteSplitDefault({
										splitDefaultId: d._id as Id<"splitDefaults">,
									});
									toast.success("ลบสำเร็จ");
								} catch {
									toast.error("เกิดข้อผิดพลาด");
								}
							}}
						/>
					)}
				</div>
			))}
		</div>
	);
}

// biome-ignore lint/suspicious/noExplicitAny: split default record type
function DisplayRow({ splitDefault, onEdit, onDelete }: { splitDefault: any; onEdit: () => void; onDelete: () => void }) {
	const label = splitDefault.productName;
	let mode = "";
	if (splitDefault.isHarvestRate) {
		mode = `ค่าตัด ${splitDefault.harvestRate ?? "-"}`;
	} else if (splitDefault.isSplit && splitDefault.isSplit !== "none") {
		mode =
			splitDefault.isSplit === "custom"
				? `${splitDefault.farmerSplitRatio ?? "-"}/${splitDefault.employeeSplitRatio ?? "-"}`
				: splitDefault.isSplit;
	} else {
		mode = "ไม่แบ่ง";
	}

	const paidLabel = (type?: string) =>
		type === "bank transfer" ? "โอน" : type === "cash" ? "เงินสด" : "-";

	return (
		<div className="flex items-center gap-2 text-sm pl-2">
			<span className="flex-1">
				{label}: {mode} | {paidLabel(splitDefault.farmerPaidType)}/
				{paidLabel(splitDefault.employeePaidType)}
			</span>
			<Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
				<PencilIcon className="h-3 w-3" />
			</Button>
			<Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
				<TrashIcon className="h-3 w-3" />
			</Button>
		</div>
	);
}

// biome-ignore lint/suspicious/noExplicitAny: split default record type
function EditRow({ splitDefault, onSave, onCancel }: { splitDefault: any; onSave: (fields: any) => void; onCancel: () => void }) {
	const [isSplit, setIsSplit] = useState(splitDefault.isSplit ?? "none");
	const [farmerRatio, setFarmerRatio] = useState(
		splitDefault.farmerSplitRatio != null ? String(splitDefault.farmerSplitRatio) : "",
	);
	const [employeeRatio, setEmployeeRatio] = useState(
		splitDefault.employeeSplitRatio != null ? String(splitDefault.employeeSplitRatio) : "",
	);
	const [isHarvestRate, setIsHarvestRate] = useState(splitDefault.isHarvestRate ?? false);
	const [harvestRate, setHarvestRate] = useState(
		splitDefault.harvestRate != null ? String(splitDefault.harvestRate) : "",
	);
	const [farmerPaidType, setFarmerPaidType] = useState(splitDefault.farmerPaidType ?? "");
	const [employeePaidType, setEmployeePaidType] = useState(splitDefault.employeePaidType ?? "");

	const handleSave = () => {
		onSave({
			isSplit: isSplit || undefined,
			farmerSplitRatio: farmerRatio ? Number.parseFloat(farmerRatio) : undefined,
			employeeSplitRatio: employeeRatio ? Number.parseFloat(employeeRatio) : undefined,
			isHarvestRate,
			harvestRate: harvestRate ? Number.parseFloat(harvestRate) : undefined,
			farmerPaidType: farmerPaidType || undefined,
			employeePaidType: employeePaidType || undefined,
		});
	};

	return (
		<div className="border rounded p-2 space-y-2 text-sm">
			<p className="font-medium">{splitDefault.productName}</p>
			<div className="grid grid-cols-2 gap-2">
				<div>
					<Label className="text-xs">แบ่ง</Label>
					<select
						className="w-full border rounded px-2 py-1 text-sm"
						value={isSplit}
						onChange={(e) => {
							setIsSplit(e.target.value);
							if (e.target.value !== "none") setIsHarvestRate(false);
						}}
					>
						<option value="none">ไม่แบ่ง</option>
						<option value="6/4">6/4</option>
						<option value="55/45">55/45</option>
						<option value="1/2">1/2</option>
						<option value="58/42">58/42</option>
						<option value="custom">กำหนดเอง</option>
					</select>
				</div>
				{isSplit === "custom" && (
					<>
						<div>
							<Label className="text-xs">เถ้าแก่</Label>
							<Input
								type="number"
								className="h-7"
								value={farmerRatio}
								onChange={(e) => setFarmerRatio(e.target.value)}
							/>
						</div>
						<div>
							<Label className="text-xs">คนตัด</Label>
							<Input
								type="number"
								className="h-7"
								value={employeeRatio}
								onChange={(e) => setEmployeeRatio(e.target.value)}
							/>
						</div>
					</>
				)}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={isHarvestRate}
						onChange={(e) => {
							setIsHarvestRate(e.target.checked);
							if (e.target.checked) setIsSplit("none");
						}}
					/>
					<Label className="text-xs">ค่าตัดปาล์ม</Label>
				</div>
				{isHarvestRate && (
					<div>
						<Label className="text-xs">อัตราค่าตัด</Label>
						<Input
							type="number"
							className="h-7"
							value={harvestRate}
							onChange={(e) => setHarvestRate(e.target.value)}
						/>
					</div>
				)}
				<div>
					<Label className="text-xs">เถ้าแก่จ่าย</Label>
					<select
						className="w-full border rounded px-2 py-1 text-sm"
						value={farmerPaidType}
						onChange={(e) => setFarmerPaidType(e.target.value)}
					>
						<option value="">-</option>
						<option value="cash">เงินสด</option>
						<option value="bank transfer">โอน</option>
					</select>
				</div>
				<div>
					<Label className="text-xs">คนตัดจ่าย</Label>
					<select
						className="w-full border rounded px-2 py-1 text-sm"
						value={employeePaidType}
						onChange={(e) => setEmployeePaidType(e.target.value)}
					>
						<option value="">-</option>
						<option value="cash">เงินสด</option>
						<option value="bank transfer">โอน</option>
					</select>
				</div>
			</div>
			<div className="flex gap-1 justify-end">
				<Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancel}>
					<XIcon className="h-3 w-3" />
				</Button>
				<Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSave}>
					<CheckIcon className="h-3 w-3" />
				</Button>
			</div>
		</div>
	);
}
