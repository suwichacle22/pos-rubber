import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { SubmitButton } from "./component/SubmitButton";
import { CheckboxField } from "./field/CheckboxField";
import { ComboBoxField } from "./field/ComboBoxField";
import { NumericField } from "./field/NumericField";
import { SelectField } from "./field/SelectField";
import { TextField } from "./field/TextField";
import { ComboBoxWithCreateField } from "./field/ComboBoxWithCreateField";
import { SubmitLoading } from "./component/SubmitLoading";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		NumericField,
		TextField,
		ComboBoxField,
		SelectField,
		CheckboxField,
		ComboBoxWithCreateField,
	},
	formComponents: { SubmitButton, SubmitLoading },
});

export type SelectData = { label: string; value: string };
