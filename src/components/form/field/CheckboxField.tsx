import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type FieldOrientation } from "@/utils/type";
import { useFieldContext } from "../formContext";

export function CheckboxField({
	label,
	orientation = "horizontal",
}: {
	label: string;
	orientation?: FieldOrientation;
}) {
	const field = useFieldContext<boolean>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field orientation={orientation} data-invalid={isInvalid}>
			<Checkbox
				id={field.name}
				name={field.name}
				checked={field.state.value}
				onCheckedChange={(checked: boolean) => field.handleChange(checked)}
			/>
			<FieldLabel htmlFor={field.name} className="cursor-pointer">{label}</FieldLabel>
			{isInvalid && <p>{field.state.meta.errors[0]}</p>}
		</Field>
	);
}
