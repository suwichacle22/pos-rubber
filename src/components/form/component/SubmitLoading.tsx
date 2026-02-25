import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "../formContext";

export function SubmitLoading({ label = "กำลังบันทึก" }: { label?: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => {
				return (
					isSubmitting && (
						<div className="fixed top-4 right-4 z-50 pointer-events-none flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-md">
							<Spinner className="size-5 shrink-0" />
							<span className="text-sm">{label}</span>
						</div>
					)
				);
			}}
		</form.Subscribe>
	);
}
