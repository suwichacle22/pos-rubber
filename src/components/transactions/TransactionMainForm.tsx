import {
	convexLineToFormLine,
	transactionFormOptions,
	transactionLinesDefaultForm,
	convexUpdateTransactionLineSchema,
} from "@/utils/transaction.schema";
import { z } from "zod";
import { useAppForm } from "../form/formContext";
import { TransactionGroup } from "./group/TransactionGroup";
import { SubmitButton } from "../form/component/SubmitButton";
import { TransactionLine } from "./lines/TransactionLinesForm";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { SubmitLoading } from "../form/component/SubmitLoading";
import { useStore } from "@tanstack/react-store";
import TransactionSummary from "./group/TransactionSummary";
import { TransactionPalmGroup } from "./group/TransactionPalmGroup";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "convex/_generated/dataModel";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import {
	getPrintTransactionGroupSummary,
	getPrintTransactionGroupSummaryOnly,
} from "@/utils/transaction.functions";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

type FormMeta = {
	submitAction: "pending" | "submitted" | "print" | "printSummary" | null;
};

const defaultMeta: FormMeta = {
	submitAction: null,
};

export function TransactionMainFormNew({ groupId }: { groupId: string }) {
	const { data: transactionData } = useSuspenseQuery(
		convexQuery(api.transactions.queries.getTransactionGroupwithLinesById, {
			groupId: groupId as Id<"transactionGroups">,
		}),
	);
	const navigate = useNavigate();
	const productsFormData = useQuery(api.transactions.queries.getProductForm);
	const palmProductIds = useQuery(api.transactions.queries.getProductPalmIds);
	const farmerId = transactionData.transactionGroup?.farmerId as Id<"farmers"> | undefined;
	const employeesFormData = useQuery(
		api.transactions.queries.getEmployeesByFarmerIdForm,
		farmerId ? { farmerId } : "skip",
	);
	const addTrasactionLine = useMutation(
		api.transactions.mutations.addTransactionLine,
	);
	const updateTransactionGroup = useMutation(
		api.transactions.mutations.updateTransactionGroup,
	);
	const updateTransactionLine = useMutation(
		api.transactions.mutations.updateTransactionLine,
	);
	const deleteTransactionLine = useMutation(
		api.transactions.mutations.deleteTransactionLine,
	);
	const upsertSplitDefault = useMutation(
		api.transactions.mutations.upsertSplitDefaultIfMissing,
	);

	const handleDeleteTransactionLine = async (
		transactionLineId: string,
		index: number,
		removeFromForm: (index: number) => void,
	) => {
		if (transactionLineId) {
			await deleteTransactionLine({
				transactionLineId: transactionLineId as Id<"transactionLines">,
			});
		}
		removeFromForm(index);
	};

	const printTransactionGroupSummary = useServerFn(
		getPrintTransactionGroupSummary,
	);
	const printTransactionGroupSummaryOnly = useServerFn(
		getPrintTransactionGroupSummaryOnly,
	);
	const form = useAppForm({
		...transactionFormOptions,
		defaultValues: {
			transactionGroup: {
				transactionGroupId:
					(transactionData.transactionGroup?._id as string) ?? "",
				groupName: transactionData.transactionGroup?.groupName ?? "",
				farmerId: (transactionData.transactionGroup?.farmerId as string) ?? "",
				status: transactionData.transactionGroup?.status ?? "pending",
			},
			transactionLines: (transactionData.transactionLines ?? []).map((line) =>
				convexLineToFormLine(
					line,
					(transactionData.transactionGroup?._id as string) ?? "",
				),
			),
			transactionPalmGroup: {
				isHarvestRate: false,
				employeeId: "",
				harvestRate: "",
				promotionRate: "",
				promotionTo: "",
				promotionAmount: "",
				farmerPaidType: "cash",
				employeePaidType: "cash",
			},
		},
		listeners: {
			onChangeDebounceMs: 500,
			onChange: ({ formApi }) => {
				if (formApi.state.isValid) {
					formApi.handleSubmit();
				}
			},
		},
		validators: {
			onSubmit: ({ formApi }) => {
				if (!formApi.getFieldValue(`transactionGroup.farmerId`)) {
					return "กรุณาเลือกชื่อลูกค้าก่อน";
				}
			},
		},
		onSubmitMeta: defaultMeta,
		onSubmit: async ({ value, meta }) => {
			updateTransactionGroup({
				transactionGroupId: transactionData.transactionGroup
					?._id as Id<"transactionGroups">,
				farmerId: value.transactionGroup.farmerId as Id<"farmers">,
				groupName: value.transactionGroup.groupName,
				status: value.transactionGroup.status,
			});
			const parsedLines = z
				.array(convexUpdateTransactionLineSchema)
				.parse(value.transactionLines);
			await updateTransactionLine({
				transactionLines: parsedLines,
			});
			// Save split defaults on explicit submit (not auto-sync)
			if (meta.submitAction !== null) {
				try {
					for (const line of value.transactionLines) {
						if (line.employeeId && line.productId) {
							await upsertSplitDefault({
								employeeId: line.employeeId as Id<"employees">,
								productId: line.productId as Id<"products">,
								splitType: line.isHarvestRate ? "per_kg" : "percentage",
								isSplit: (line.isSplit as "none" | "6/4" | "55/45" | "1/2" | "58/42" | "custom") || "none",
								isHarvestRate: line.isHarvestRate || false,
								farmerSplitRatio: line.farmerRatio ? Number.parseFloat(line.farmerRatio) : undefined,
								employeeSplitRatio: line.employeeRatio ? Number.parseFloat(line.employeeRatio) : undefined,
								harvestRate: line.harvestRate ? Number.parseFloat(line.harvestRate) : undefined,
								isTransportationFee: line.isTransportationFee || false,
								transportationFee: line.transportationFee ? Number.parseFloat(line.transportationFee) : undefined,
								promotionTo: (line.promotionTo as "sum" | "split") || undefined,
								promotionRate: line.promotionRate ? Number.parseFloat(line.promotionRate) : undefined,
								farmerPaidType: (line.farmerPaidType as "cash" | "bank transfer") || undefined,
								employeePaidType: (line.employeePaidType as "cash" | "bank transfer") || undefined,
							});
						}
					}
				} catch {
					// Don't block submit on split default creation failure
				}
			}
			if (meta.submitAction === "pending") {
				navigate({ to: "/transactions" });
			}
			if (
				meta.submitAction === "submitted" ||
				meta.submitAction === "print" ||
				meta.submitAction === "printSummary"
			) {
				// 1. Persist status and lines
				await updateTransactionGroup({
					transactionGroupId: transactionData.transactionGroup
						?._id as Id<"transactionGroups">,
					farmerId: value.transactionGroup.farmerId as Id<"farmers">,
					groupName: value.transactionGroup.groupName,
					status: "submitted",
				});
				const parsedLines = z
					.array(convexUpdateTransactionLineSchema)
					.parse(value.transactionLines);
				await updateTransactionLine({
					transactionLines: parsedLines,
				});
				// 2. Print receipt via Convex action + local printer
				if (meta.submitAction === "print") {
					await printTransactionGroupSummary({
						data: {
							transactionGroupId: value.transactionGroup.transactionGroupId,
						},
					});
				}
				if (meta.submitAction === "printSummary") {
					await printTransactionGroupSummaryOnly({
						data: {
							transactionGroupId: value.transactionGroup.transactionGroupId,
						},
					});
				}

				toast.success("สำเร็จ", {
					description: "รายการเสร็จสิ้น",
				});
				navigate({ to: "/transactions" });
			}
		},
	});
	const LinesData = useStore(
		form.store,
		(state) => state.values.transactionLines,
	);

	const GroupStatus = useStore(
		form.store,
		(state) => state.values.transactionGroup.status,
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
												selectProductsData={productsFormData || []}
												handleDeleteTransactionLine={(id) =>
													handleDeleteTransactionLine(
														id,
														index,
														field.removeValue,
													)
												}
											/>
										);
									})}
									<Button
										type="button"
										variant="secondary"
										onClick={async () => {
											const newLineId = await addTrasactionLine({
												transactionGroupId: transactionData.transactionGroup
													?._id as Id<"transactionGroups">,
											});
											field.pushValue(
												transactionLinesDefaultForm({
													transactionGroupId:
														(transactionData.transactionGroup?._id as string) ??
														"",
													transactionLinesId: newLineId as string,
												}),
											);
										}}
									>
										<PlusIcon />
										เพิ่มรายการ
									</Button>
								</>
							);
						}}
					</form.AppField>
					{LinesData.some((line) =>
						palmProductIds?.some((product) => product._id === line.productId),
					) && <TransactionPalmGroup form={form} />}
					{LinesData.length > 1 && (
						<TransactionSummary
							lines={LinesData}
							productsData={productsFormData || []}
							employeesData={employeesFormData || []}
						/>
					)}
					<div className="grid grid-cols-2 gap-2 h-[100px] justify-center items-center">
						<form.AppForm>
							<SubmitButton
								label="บันทึกแบบร่าง"
								variant={"outline"}
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "pending" });
								}}
							/>
						</form.AppForm>
						<form.AppForm>
							<SubmitButton
								label={`${GroupStatus === "pending" ? "ยืนยัน" : "แก้ไข้"}`}
								variant={"outline"}
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "submitted" });
								}}
							/>
						</form.AppForm>
						<form.AppForm>
							<SubmitButton
								label="พิมพ์เฉพาะสรุป"
								variant={"outline"}
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "printSummary" });
								}}
							/>
						</form.AppForm>
						<form.AppForm>
							<SubmitButton
								label={`${GroupStatus === "pending" ? "ยืนยันและ พิมพ์" : "แก้ไข้และ พิมพ์"}`}
								handleSubmit={() => {
									form.handleSubmit({ submitAction: "print" });
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
