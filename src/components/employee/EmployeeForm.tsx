import { addEmployeeSchema } from "@/utils/transaction.schema";
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
import { useAddEmployee, useGetFarmersForm } from "@/utils/transaction.hooks";
import { toast } from "sonner";

export function EmployeeForm() {
	const addEmployee = useAddEmployee();
	const { data: farmers } = useGetFarmersForm();
	const form = useAppForm({
		defaultValues: {
			farmerId: "",
			displayName: "",
			address: "",
			phone: "",
		},
		validators: { onSubmit: addEmployeeSchema },
		onSubmit: ({ value }) => {
			const transformValue = addEmployeeSchema.parse(value);
			addEmployee.mutateAsync(
				{ data: transformValue },
				{
					onSuccess: () => form.reset(),
					onError: (error) => toast.error(error.message),
				},
			);
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
			<Card className="min-w-[380px] md:min-w-[660px]">
				<CardHeader>
					<CardTitle>เพิ่มพนักงาน</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name="farmerId"
							children={(field) => (
								<field.SelectField
									label="เกษตรกร"
									items={
										farmers?.map((farmer) => ({
											label: farmer.displayName,
											value: farmer.farmerId,
										})) || []
									}
								/>
							)}
						/>
						<form.AppField
							name="displayName"
							children={(field) => (
								<field.TextField
									label="ชื่อพนักงาน"
									placeholder="กรอกชื่อพนักงาน..."
								/>
							)}
						/>
						<form.AppField
							name="address"
							children={(field) => (
								<field.TextField label="ที่อยู่" placeholder="กรอกที่อยู่..." />
							)}
						/>
						<form.AppField
							name="phone"
							children={(field) => (
								<field.TextField
									label="เบอร์โทรศัพท์"
									placeholder="กรอกเบอร์โทรศัพท์..."
								/>
							)}
						/>
					</FieldGroup>
				</CardContent>
				<CardFooter className="flex justify-end">
					<form.AppForm>
						<SubmitButton />
					</form.AppForm>
				</CardFooter>
			</Card>
		</form>
	);
}
