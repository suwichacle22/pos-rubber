import { productPriceAddFormSchema } from "@/utils/product.schema";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { SubmitButton } from "../form/component/SubmitButton";
import { useAppForm } from "../form/formContext";
import { FieldGroup } from "../ui/field";

export function ProductPriceForm({ productId }: { productId: Id<"products"> }) {
	const createProductPrice = useMutation(api.transaction.mutations.createProductPrice);
	const form = useAppForm({
		defaultValues: {
			price: "",
		},
		validators: { onSubmit: productPriceAddFormSchema },
		onSubmit: async ({ value }) => {
			const parsed = productPriceAddFormSchema.parse(value);
			await createProductPrice({
				productId,
				price: Number(parsed.price),
			});
			toast.success("Price added");
			form.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<div className="flex items-end gap-2">
				<FieldGroup className="grow">
					<form.AppField
						name="price"
						children={(field) => (
							<field.NumericField label="Price" placeholder="Enter price..." />
						)}
					/>
				</FieldGroup>
				<form.AppForm>
					<SubmitButton label="Add Price" />
				</form.AppForm>
			</div>
		</form>
	);
}
