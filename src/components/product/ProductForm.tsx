import { addProductSchema } from "@/utils/transaction.schema";
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
import { productAddFormSchema } from "@/utils/product.schema";
import { useAddProduct } from "@/utils/transaction.hooks";
import { toast } from "sonner";

export function ProductForm() {
	const addProduct = useAddProduct();
	const form = useAppForm({
		defaultValues: {
			productName: "",
			defaultSplitType: "percentage",
		},
		validators: { onSubmit: addProductSchema },
		onSubmit: ({ value }) => {
			const transformValue = addProductSchema.parse(value);
			addProduct.mutateAsync(
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
			id="product-add-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card>
				<CardHeader>
					<CardTitle>เพิ่มสินค้า</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name="productName"
							children={(field) => (
								<field.TextField label="ชื่อสินค้า" placeholder="กรอกชื่อสินค้า..." />
							)}
						/>
						<form.AppField
							name="defaultSplitType"
							children={(field) => (
								<field.SelectField
									label="ประเภทการแบ่งส่วน"
									items={[
										{ label: "แบบยาง", value: "percentage" },
										{ label: "แบบปาล์ม", value: "per_kg" },
									]}
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
