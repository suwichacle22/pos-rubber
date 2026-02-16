import { addFarmerSchema } from "@/utils/transaction.schema";
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
import { useAddFarmer } from "@/utils/transaction.hooks";
import { toast } from "sonner";
import { z } from "zod";

const farmerFormSchema = z.object({
	displayName: z.string("โปรดใส่ชื่อ").min(1),
	phone: z.string(),
});

export function FarmerForm() {
	const addFarmer = useAddFarmer();
	const form = useAppForm({
		defaultValues: {
			displayName: "",
			phone: "",
		},
		validators: { onSubmit: farmerFormSchema },
		onSubmit: ({ value }) => {
			const transformValue = addFarmerSchema.parse(value);
			addFarmer.mutateAsync(
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
			id="farmer-add-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card className="min-w-[380px] md:min-w-[660px]">
				<CardHeader>
					<CardTitle>เพิ่มเกษตรกร</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name="displayName"
							children={(field) => (
								<field.TextField
									label="ชื่อเกษตรกร"
									placeholder="กรอกชื่อเกษตรกร..."
								/>
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
