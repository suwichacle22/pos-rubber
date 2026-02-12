import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "../formContext";
import type { FieldOrientation } from "@/utils/type";

export function SelectField<
	T extends { value: string; label: string } = { value: string; label: string },
>({
	label,
	items,
	orientation = "responsive",
}: {
	label: string;
	items: T[];
	orientation?: FieldOrientation;
}) {
	const field = useFieldContext<string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field orientation={orientation} data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Select
				name={field.name}
				value={field.state.value}
				items={items}
				onValueChange={(e) => field.handleChange(e as string)}
			>
				<SelectTrigger aria-invalid={isInvalid} className="min-w-30">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{items.map((item) => (
						<SelectItem key={item.value} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{isInvalid && <p>{field.state.meta.errors[0]}</p>}
		</Field>
	);
}
