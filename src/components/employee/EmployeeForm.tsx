import type { Id } from "convex/_generated/dataModel";
import { addEmployeeInlineSchema } from "@/utils/transaction.schema";
import { SubmitButton } from "../form/component/SubmitButton";
import { useAppForm } from "../form/formContext";
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardFooter,
} from "../ui/card";
import { FieldGroup } from "../ui/field";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export function EmployeeForm({
	farmerId,
	onSuccess,
}: {
	farmerId: Id<"farmers">;
	onSuccess?: () => void;
}) {
	const createEmployee = useMutation(api.transactions.mutations.createEmployee);
	const form = useAppForm({
		defaultValues: {
			displayName: "",
		},
		validators: { onSubmit: addEmployeeInlineSchema },
		onSubmit: async ({ value }) => {
			const parsed = addEmployeeInlineSchema.parse(value);
			await createEmployee({
				farmerId,
				displayName: parsed.displayName,
			});
			toast.success("เพิ่มคนตัดสำเร็จ");
			form.reset();
			onSuccess?.();
		},
	});

	return (
		<form
			id="employee-add-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card className="border-dashed">
				<CardHeader className="py-3">
					<CardTitle className="text-base">เพิ่มคนตัด</CardTitle>
				</CardHeader>
				<CardContent className="py-3">
					<FieldGroup>
						<form.AppField
							name="displayName"
							children={(field) => (
								<field.TextField
									label="ชื่อคนตัด"
									placeholder="กรอกชื่อคนตัด..."
								/>
							)}
						/>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex justify-end py-3">
					<form.AppForm>
						<SubmitButton />
					</form.AppForm>
				</CardFooter>
			</Card>
		</form>
	);
}
