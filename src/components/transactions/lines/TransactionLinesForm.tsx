import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { TransactionLineVehicle } from "./TransactionLinesVehicle";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TransactionLineWeight } from "./TransactionLinesWeight";
import { TransactionLineSplit } from "./TransactionLinesSplit";
import { Button } from "@/components/ui/button";
import { PrinterIcon, TrashIcon } from "lucide-react";
import { TransactionLineTransportFee } from "./TransactionLinesTransportFee";
import { TransactionLineHarvestRate } from "./TransactionLinesHarvestRate";
import { useConvex, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { config } from "@/utils/config";
import { calculateTotalAmount } from "@/utils/utils";
import { applySplitDefaultToLine } from "@/utils/splitDefault";

export const TransactionLine = withForm({
	...transactionFormOptions,
	props: {
		index: 0,
		selectProductsData: [{ label: "ไม่มีข้อมูล", value: "" }],
		handleDeleteTransactionLine: (id: string) => {},
		handlePrintTransactionLine: (id: string) => {},
	},
	render: function Render({
		form,
		index,
		selectProductsData,
		handleDeleteTransactionLine,
		handlePrintTransactionLine,
	}) {
		const convex = useConvex();
		const productPalmId = useQuery(api.transactions.queries.getProductPalmIds);
		const latestPalmPrice = useQuery(api.transactions.queries.getLatestPalmPrice);
		return (
			<Card>
				<CardHeader>
					<CardTitle>รายการสินค้าที่ {index + 1}</CardTitle>
					<CardAction>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									handlePrintTransactionLine(
										form.getFieldValue(
											`transactionLines[${index}].transactionLinesId`,
										),
									)
								}
							>
								<PrinterIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
								onClick={() =>
									handleDeleteTransactionLine(
										form.getFieldValue(
											`transactionLines[${index}].transactionLinesId`,
										),
									)
								}
							>
								<TrashIcon className="h-4 w-4" />
							</Button>
						</div>
					</CardAction>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name={`transactionLines[${index}].productId`}
							validators={{
								onSubmit: ({ value }) => {
									if (!value) {
										return "กรุณาเลือกสินค้า";
									}
									return;
								},
							}}
							listeners={{
								onChange: async ({ value }) => {
									if (!value) return;
									// Palm price auto-fill
									const isPalm = productPalmId?.some(
										(p) => p._id === value,
									);
									if (isPalm && latestPalmPrice != null) {
										const isPalmRuang =
											productPalmId?.find((p) => p._id === value)?.productName === config.product.palmRuangProductName;
										const price = isPalmRuang
											? (latestPalmPrice + 0.5).toString()
											: latestPalmPrice.toString();

										form.setFieldValue(
											`transactionLines[${index}].price`,
											price,
										);

										// Trigger calculation cascade
										const weight = form.getFieldValue(
											`transactionLines[${index}].weight`,
										);
										form.setFieldValue(
											`transactionLines[${index}].totalAmount`,
											calculateTotalAmount(weight, price),
										);
									}

									// Split default autofill
									const employeeId = form.getFieldValue(
										`transactionLines[${index}].employeeId`,
									);
									if (employeeId) {
										const splitDefault = await convex.query(
											api.transactions.queries
												.getSplitDefaultByEmployeeAndProduct,
											{
												employeeId: employeeId as Id<"employees">,
												productId: value as Id<"products">,
											},
										);
										if (splitDefault) {
											applySplitDefaultToLine(
												splitDefault,
												form,
												index,
											);
										}
									}
								},
							}}
							children={(field) => (
								<field.ComboBoxField
									label="สินค้า"
									selectData={selectProductsData}
								/>
							)}
						/>
						<TransactionLineVehicle form={form} index={index} />
						<TransactionLineWeight form={form} index={index} />
						<TransactionLineSplit form={form} index={index} />
						<TransactionLineTransportFee form={form} index={index} />
						<form.Subscribe
							selector={(state) =>
								state.values.transactionLines[index].productId
							}
							children={(productId) => {
								return (
									productPalmId?.some(
										(product) => product._id === productId,
									) && <TransactionLineHarvestRate form={form} index={index} />
								);
							}}
						/>
					</FieldGroup>
				</CardContent>
			</Card>
		);
	},
});
