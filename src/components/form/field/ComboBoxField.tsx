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
import type { SelectData } from "../formContext";
import { useEffect, useState } from "react";

export function ComboBoxField({
	label,
	selectData = [{ label: "ไม่มีข้อมูล", value: "" }],
	placeholder = "โปรดเลือก",
	emptyMessage = "ไม่มีข้อมูล",
	orientation = "vertical",
}: {
	label: string;
	selectData: SelectData[];
	placeholder?: string;
	emptyMessage?: string;
	orientation?: FieldOrientation;
}) {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const [query, setQuery] = useState("");

	const selectedItem = field.state.value
		? selectData.find((i) => i.value === field.state.value)
		: undefined;

	useEffect(() => {
		if (query === "" && selectedItem) {
			setQuery(selectedItem.label);
		}
	}, [selectedItem, query]);
	return (
		<Field orientation={orientation} data-invalid={isInvalid}>
			<Field>
				<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				<Combobox
					items={selectData}
					inputValue={query}
					onInputValueChange={setQuery}
					value={selectedItem ?? null}
					itemToStringLabel={(item: SelectData) => item.label}
					itemToStringValue={(item: SelectData) => item.value}
					isItemEqualToValue={(a, b) => a?.value === b?.value}
					onValueChange={(value: unknown) => {
						const selected = value as SelectData | null;
						if (!selected) return;
						field.handleChange(selected.value);
						setQuery(selected.label);
					}}
				>
					<ComboboxInput placeholder={placeholder} />
					<ComboboxContent>
						<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
						<ComboboxList>
							{(item: SelectData) => (
								<ComboboxItem key={item.value} value={item}>
									{item.label}
								</ComboboxItem>
							)}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</Field>
			{isInvalid && <p>{field.state.meta.errors[0]}</p>}
		</Field>
	);
}
