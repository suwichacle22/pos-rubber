import {
	transactionFormOptions,
	transactionFormSchema,
	transactionGroupSchemaNew,
	transactionLinesDefaultForm,
	transactionLinesNewFormSchema,
} from "@/utils/transaction.schema";
import { useAppForm } from "../form/formContext";
import { TransactionGroup } from "./group/TransactionGroupNew";
import { SubmitButton } from "../form/component/SubmitButton";
import { toast } from "sonner";
import { TransactionLine } from "./lines/TransactionLinesNew";
import { Button } from "../ui/button";
import {
	useAddTransactionGroupNew,
	useAddTransactionLinesNew,
	useGetProductsForm,
} from "@/utils/transaction.hooks";
import { PlusIcon } from "lucide-react";
import { SubmitLoading } from "../form/component/SubmitLoading";
import { calculateTransactionTotalNetAmount } from "@/utils/utils";
import { redirect } from "@tanstack/react-router";

type FormMeta = {
	submitAction: "SaveDraft" | "Submit" | null;
};

const defaultMeta: FormMeta = {
	submitAction: null,
};

export function TransactionMainFormNew() {
	const { data: productsFormData = [] } = useGetProductsForm();
	const addTransactionGroupNew = useAddTransactionGroupNew();
	const addTransactionLinesNew = useAddTransactionLinesNew();
	const form = useAppForm({
		...transactionFormOptions,
		onSubmitMeta: defaultMeta,
		onSubmit: async ({ value, meta }) => {
			if (meta.submitAction === "SaveDraft") {
				const group = transactionGroupSchemaNew.parse(value.transactionGroup);
				group.status = "pending";
			}
			if (meta.submitAction === "Submit") {
				const group = transactionGroupSchemaNew.parse(value.transactionGroup);
				group.status = "submitted";
				const [groupData] = await addTransactionGroupNew.mutateAsync({
					data: group,
				});

				//line
				const initLines = value.transactionLines;
				const lineswithGroupID = initLines.map((line, index) => {
					return {
						...line,
						transactionGroupId: groupData.transactionGroupId,
						transactionLineNo: index + 1,
						totalNetAmount: calculateTransactionTotalNetAmount(
							line.totalAmount,
							line.promotionAmount,
						),
					};
				});
				const lines = transactionLinesNewFormSchema.parse(lineswithGroupID);
				await addTransactionLinesNew.mutateAsync({
					data: lines,
				});
				form.reset();
				redirect({ to: "/transactions" });
			}

			toast.success("สำเร็จ", {
				description:
					meta.submitAction === "SaveDraft" ? "บันทึกแบบร่างสำเร็จ" : "บันทึกสำเร็จ",
			});
		},
	});
	return (
		<div className="flex flex-col gap-4 justify-center items-center p-4">
			<form
				id="transaction-main-form-new"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col gap-4">
					<TransactionGroup form={form} />
					<form.AppField name="transactionLines" mode="array">
						{(field) => {
							return (
								<>
									{field.state.value.map((_, index) => {
										return (
											<TransactionLine
												key={index}
												form={form}
												index={index}
												onDelete={(index) => field.removeValue(index)}
												selectProductsData={productsFormData}
											/>
										);
									})}
									<Button
										type="button"
										variant="secondary"
										onClick={() =>
											field.pushValue(transactionLinesDefaultForm())
										}
									>
										<PlusIcon />
										เพิ่มรายการ
									</Button>
								</>
							);
						}}
					</form.AppField>
					<div className="grid grid-cols-2 gap-2 h-[100px] justify-center items-center">
						<form.AppForm>
							<SubmitButton
								label="บันทึกเป็นร่าง"
								variant={"outline"}
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "SaveDraft" });
								}}
							/>
						</form.AppForm>

						<form.AppForm>
							<SubmitButton
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "Submit" });
								}}
							/>
						</form.AppForm>
					</div>
				</div>
				<form.AppForm>
					<SubmitLoading />
				</form.AppForm>
			</form>
		</div>
	);
}
