import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "../formContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function SubmitLoading({
	label = "กำลังบันทึก...",
	className,
}: {
	label?: string;
	className?: string;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => {
				return (
					isSubmitting && (
						<div className="fixed inset-0 grid place-items-center bg-black/50 z-50">
							<Card className="min-w-[100px]!">
								<CardContent>
									<div className="flex flex-col justify-center items-center">
										<Spinner className="size-12" />
									</div>
									<p>{label}</p>
								</CardContent>
							</Card>
						</div>
					)
				);
			}}
		</form.Subscribe>
	);
}
