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
	usePrintTransactionGroup,
} from "@/utils/transaction.hooks";
import { PlusIcon } from "lucide-react";
import { SubmitLoading } from "../form/component/SubmitLoading";
import { calculateTransactionTotalNetAmount } from "@/utils/utils";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import TransactionSummary from "./group/TransactionSummary";
import { TransactionPalmGroup } from "./group/TransactionPalmGroup";
import { productIds } from "@/config";

type FormMeta = {
	submitAction: "SaveDraft" | "Submit" | null;
};

const defaultMeta: FormMeta = {
	submitAction: null,
};

export function TransactionMainFormNew() {
	const navigate = useNavigate();
	const { data: productsFormData = [] } = useGetProductsForm();
	const addTransactionGroupNew = useAddTransactionGroupNew();
	const addTransactionLinesNew = useAddTransactionLinesNew();
	const printTransactionGroup = usePrintTransactionGroup();
	const form = useAppForm({
		...transactionFormOptions,
		onSubmitMeta: defaultMeta,
		onSubmit: async ({ value, meta }) => {
			if (meta.submitAction === "SaveDraft") {
				const group = transactionGroupSchemaNew.parse(value.transactionGroup);
				group.status = "pending";
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
				navigate({ to: `/transaction/${groupData.transactionGroupId}` });
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

				await printTransactionGroup.mutateAsync({
					data: { transactionGroupID: groupData.transactionGroupId },
				});

				form.reset();
				navigate({ to: "/" });
			}

			toast.success("สำเร็จ", {
				description:
					meta.submitAction === "SaveDraft" ? "บันทึกแบบร่างสำเร็จ" : "บันทึกสำเร็จ",
			});
		},
	});
	const LinesData = useStore(
		form.store,
		(state) => state.values.transactionLines,
	);
	return (
		<div className="flex flex-col gap-4 justify-center items-center p-4">
			<form
				id="transaction-main-form-new"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<div className="flex flex-col min-w-[380px] md:min-w-[660px] gap-4">
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
					{LinesData.some(
						(line) => line.productId === productIds.palm,
					) && <TransactionPalmGroup form={form} />}
					{LinesData.length > 1 && <TransactionSummary lines={LinesData} />}
					<div className="grid grid-cols-2 gap-2 h-[100px] justify-center items-center">
						<form.AppForm>
							<SubmitButton
								label="บันทึกแบบร่าง"
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
