import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import type { FieldOrientation } from "@/utils/type";
import { useFieldContext } from "../formContext";
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Id } from "convex/_generated/dataModel";

interface ItemsCreatable {
	value: Id<any> | string;
	label: string | undefined;
	creatable?: string;
}

export function ComboBoxWithCreateField<TValue extends string = string>({
	label,
	handleCreate,
	selectData = [{ label: "ไม่มีข้อมูล", value: "" }] as ItemsCreatable[],
	placeholder = "โปรดเลือก",
	emptyMessage = "ไม่มีข้อมูล",
	orientation = "vertical",
}: {
	label: string;
	handleCreate: (label: string) => Promise<{
		newValue: Id<any> | string;
		newLabel: string | undefined;
	}>;
	selectData: ItemsCreatable[];
	placeholder?: string;
	emptyMessage?: string;
	orientation?: FieldOrientation;
}) {
	const field = useFieldContext<TValue>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const [query, setQuery] = useState("");

	const trimmed = query.trim();
	const lowered = trimmed.toLocaleLowerCase();
	const exactExists = selectData.some(
		(p) => p.label?.trim().toLocaleLowerCase() === lowered,
	);

	const itemsForView: ItemsCreatable[] =
		trimmed !== "" && !exactExists
			? [
					...selectData,
					{
						value: `create:${lowered}`,
						label: `สร้าง "${trimmed}"`,
						creatable: trimmed,
					},
				]
			: selectData;

	// Find selected item for controlled Combobox (prevents race when refetch updates items)
	const selectedItem = field.state.value
		? itemsForView.find((i) => i.value === field.state.value)
		: undefined;

	// Sync query when form loads with existing value (e.g. editing draft) - only when query is empty to avoid overwriting user typing
	useEffect(() => {
		if (query === "" && selectedItem) {
			setQuery(selectedItem.label ?? "");
		}
	}, [selectedItem, query]);

	return (
		<Field orientation={orientation} data-invalid={isInvalid}>
			<Field>
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				<Combobox
					items={itemsForView}
					inputValue={query}
					onInputValueChange={setQuery}
					value={selectedItem ?? null}
					itemToStringLabel={(item: ItemsCreatable) => item.label ?? ""}
					itemToStringValue={(item: ItemsCreatable) => item.value}
					isItemEqualToValue={(a, b) => a?.value === b?.value}
					onValueChange={async (items: unknown) => {
						const selectedItems = items as ItemsCreatable | null;
						if (!selectedItems) return;
						if (selectedItems?.creatable) {
							// Update form first to avoid race with refetch overwriting value
							const result = await handleCreate(selectedItems.creatable);
							field.handleChange(result.newValue as TValue);
							setQuery(result.newLabel ?? "");
							return;
						}
						field.handleChange(selectedItems.value as TValue);
						setQuery(selectedItems.label ?? "");
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
			{isInvalid && <p>{field.state.meta.errors[0]}</p>}
		</Field>
	);
}
