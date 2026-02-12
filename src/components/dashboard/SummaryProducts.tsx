import { createServerFn } from "@tanstack/react-start";
import { Button } from "../ui/button";
import { printTransactionLine } from "@/utils/transactions.server";
import { useMutation } from "@tanstack/react-query";

export default function SummaryProducts() {
	const handlePrintServer = createServerFn({ method: "POST" }).handler(
		async () => {
			await printTransactionLine();
		},
	);

	function usePrint() {
		return useMutation({ mutationFn: handlePrintServer });
	}
	const print = usePrint();
	return (
		<div>
			<Button onClick={() => print.mutate({})}>Test Print</Button>
		</div>
	);
}
