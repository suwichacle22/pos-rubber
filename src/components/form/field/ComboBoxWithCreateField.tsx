import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type FieldOrientation } from "@/utils/type";
import { SelectData, useFieldContext } from "../formContext";
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useAddFarmer } from "@/utils/transaction.hooks";
import { toast } from "sonner";

interface ItemsCreatable {
	value: string;
	label: string;
	creatable?: string;
}

export function ComboBoxWithCreateField({
	label,
	handleCreate,
	selectData = [{ label: "ไม่มีข้อมูล", value: "" }],
	placeholder = "โปรดเลือก",
	emptyMessage = "ไม่มีข้อมูล",
	orientation = "vertical",
}: {
	label: string;
	handleCreate: (label: string) => Promise<{ newValue: string; newLabel: string }>;
	selectData: SelectData[];
	placeholder?: string;
	emptyMessage?: string;
	orientation?: FieldOrientation;
}) {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const [query, setQuery] = useState("");

	const addFarmer = useAddFarmer();

	const trimmed = query.trim();
	const lowered = trimmed.toLocaleLowerCase();
	const exactExists = selectData.some(
		(p) => p.label.trim().toLocaleLowerCase() === lowered,
	);

	const itemsForView: ItemsCreatable[] =
		trimmed !== "" && !exactExists
			? [
					...selectData,
					{
						value: `create:${lowered}`,
						label: `Create "${trimmed}"`,
						creatable: trimmed,
					},
				]
			: selectData;
	return (
		<Field orientation={orientation} data-invalid={isInvalid}>
			<Field>
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				<Combobox
					items={itemsForView}
					inputValue={query}
					onInputValueChange={setQuery}
					onValueChange={async (items: unknown) => {
						const selectedItems = items as ItemsCreatable;
						if (!selectedItems) return; // ← this prevents the crash
						if (selectedItems?.creatable) {
							const newFarmer = await handleCreate(selectedItems.creatable);
							field.handleChange(newFarmer.newValue);
							setQuery(newFarmer.newLabel);
							return;
						}
						setQuery("");
						field.handleChange(selectedItems.value);
					}}
				>
					<ComboboxInput placeholder={placeholder} />
					<ComboboxContent>
						<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
						<ComboboxList>
							{(item: ItemsCreatable) =>
								item.creatable ? (
									<ComboboxItem key={item.value} value={item}>
										{<PlusIcon />} {item.label}
									</ComboboxItem>
								) : (
									<ComboboxItem key={item.value} value={item}>
										{item.label}
									</ComboboxItem>
								)
							}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</Field>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
