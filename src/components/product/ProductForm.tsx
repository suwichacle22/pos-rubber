import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { productAddFormSchema } from "@/utils/product.schema";
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

export function ProductForm() {
	const createProduct = useMutation(api.transactions.mutations.createProduct);
	const form = useAppForm({
		defaultValues: {
			productName: "",
		},
		validators: { onSubmit: productAddFormSchema },
		onSubmit: async ({ value }) => {
			const parsed = productAddFormSchema.parse(value);
			try {
				await createProduct(parsed);
				form.reset();
				toast.success("Product created");
			} catch (error) {
				toast.error(error instanceof Error ? error.message : String(error));
			}
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
			<Card className="min-w-[380px] md:min-w-[660px]">
				<CardHeader>
					<CardTitle>Add Product</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name="productName"
							children={(field) => (
								<field.TextField
									label="Product Name"
									placeholder="Enter product name..."
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
