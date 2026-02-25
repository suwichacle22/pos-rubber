import { useMutation } from "convex/react";
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
import { z } from "zod";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const farmerFormSchema = z.object({
	displayName: z.string("โปรดใส่ชื่อ").min(1),
	phone: z.string(),
});

export function FarmerForm() {
	const addFarmer = useMutation(api.transactions.mutations.createFarmer);
	const form = useAppForm({
		defaultValues: {
			displayName: "",
			phone: "",
		},
		validators: { onSubmit: farmerFormSchema },
		onSubmit: async ({ value }) => {
			const parsed = farmerFormSchema.parse(value);
			try {
				const newFarmer = await addFarmer(parsed);
				form.reset();
				toast.success("เพิ่มลูกค้าสำเร็จ", { description: newFarmer?.displayName });
			} catch (error) {
				toast.error(
					error instanceof ConvexError ? error.message : String(error),
				);
			}
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
