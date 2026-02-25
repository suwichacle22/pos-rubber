import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "../formContext";

export function SubmitButton({
	label = "ยืนยัน",
	size = "default",
	variant = "default",
	className,
	handleSubmit,
}: {
	label?: string;
	size?: VariantProps<typeof buttonVariants>["size"];
	variant?: VariantProps<typeof buttonVariants>["variant"];
	className?: string;
	handleSubmit?: () => void;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => {
				return (
					<Button
						type="submit"
						disabled={isSubmitting}
						variant={variant}
						size={size}
						className={className}
						onClick={handleSubmit}
					>
						{isSubmitting ? <Spinner /> : null} {label}
					</Button>
				);
			}}
		</form.Subscribe>
	);
}
