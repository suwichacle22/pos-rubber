import { useRef } from "react";
import { withForm } from "@/components/form/formContext";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import {
	calculateHarvestRateAmount,
	calculatePromotionAmount,
	calculateTransactionTotalNetAmount,
} from "@/utils/utils";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { TransactionGroupEmployeeId } from "./TransactionGroupEmployeeId";
import { config } from "@/utils/config";

function getPalmLineIndices(
	lines: { productId: string }[],
	palmProductId: string,
) {
	return lines
		.map((line, i) => (palmProductId === line.productId ? i : -1))
		.filter((i) => i >= 0);
}

export const TransactionPalmGroup = withForm({
	...transactionFormOptions,
	render: function Render({ form }) {
		const palmProductId = config.product.palmProductId;
		const cardRef = useRef<HTMLDivElement>(null);
		const spreadToPalmLines = (
			field:
				| "isHarvestRate"
				| "promotionTo"
				| "farmerPaidType"
				| "employeePaidType",
			value: string | boolean,
		) => {
			const lines = form.getFieldValue("transactionLines") ?? [];
			const indices = getPalmLineIndices(lines, palmProductId);
			for (const i of indices) {
				form.setFieldValue(`transactionLines[${i}].${field}`, value);
			}
		};

		const spreadHarvestRate = (value: string) => {
			const lines = form.getFieldValue("transactionLines") ?? [];
			const indices = getPalmLineIndices(lines, palmProductId);
			for (const i of indices) {
				form.setFieldValue(`transactionLines[${i}].harvestRate`, value);
				const { farmerAmount, employeeAmount } = calculateHarvestRateAmount(
					value,
					form.getFieldValue(`transactionLines[${i}].weight`),
					form.getFieldValue(`transactionLines[${i}].totalAmount`),
				);
				form.setFieldValue(`transactionLines[${i}].farmerAmount`, farmerAmount);
				form.setFieldValue(
					`transactionLines[${i}].employeeAmount`,
					employeeAmount,
				);
			}
		};

		const spreadPromotionRate = (value: string) => {
			const lines = form.getFieldValue("transactionLines") ?? [];
			const indices = getPalmLineIndices(lines, palmProductId);
			for (const i of indices) {
				form.setFieldValue(`transactionLines[${i}].promotionRate`, value);
				const promotionAmount = calculatePromotionAmount(
					value,
					form.getFieldValue(`transactionLines[${i}].weight`),
				);
				form.setFieldValue(
					`transactionLines[${i}].promotionAmount`,
					promotionAmount,
				);
				const totalAmount = form.getFieldValue(
					`transactionLines[${i}].totalAmount`,
				);
				form.setFieldValue(
					`transactionLines[${i}].totalNetAmount`,
					calculateTransactionTotalNetAmount(totalAmount || "", promotionAmount),
				);
			}
		};

		return (
			<div ref={cardRef}>
				<Card>
					<CardHeader>
						<CardTitle>รวมคิดค่าปาล์ม</CardTitle>
					</CardHeader>
					<CardContent>
						<FieldGroup>
							<form.AppField
								name="transactionPalmGroup.isHarvestRate"
								listeners={{
									onChange: ({ value }) => {
										spreadToPalmLines("isHarvestRate", value);
										if (!value) {
											form.setFieldValue("transactionPalmGroup.employeeId", "");
											form.setFieldValue(
												"transactionPalmGroup.farmerPaidType",
												"cash",
											);
											form.setFieldValue(
												"transactionPalmGroup.employeePaidType",
												"cash",
											);
											const lines =
												form.getFieldValue("transactionLines") ?? [];
											const indices = getPalmLineIndices(lines, palmProductId);
											for (const i of indices) {
												form.setFieldValue(
													`transactionLines[${i}].harvestRate`,
													"",
												);
												form.setFieldValue(
													`transactionLines[${i}].employeeId`,
													"",
												);
												form.setFieldValue(
													`transactionLines[${i}].promotionRate`,
													"",
												);
												form.setFieldValue(
													`transactionLines[${i}].promotionAmount`,
													"",
												);
												form.setFieldValue(
													`transactionLines[${i}].farmerPaidType`,
													"cash",
												);
												form.setFieldValue(
													`transactionLines[${i}].employeePaidType`,
													"cash",
												);
												// Reset totalNetAmount to totalAmount (no promotion)
												const totalAmount = form.getFieldValue(
													`transactionLines[${i}].totalAmount`,
												);
												form.setFieldValue(
													`transactionLines[${i}].totalNetAmount`,
													totalAmount || "",
												);
											}
										}
										// Keep scroll on this component after line cards expand above
										requestAnimationFrame(() => {
											cardRef.current?.scrollIntoView({
												behavior: "smooth",
												block: "center",
											});
										});
									},
								}}
								children={(field) => <field.CheckboxField label="ค่าตัดปาล์ม" />}
							/>
							<form.Subscribe
								selector={(state) =>
									state.values.transactionPalmGroup.isHarvestRate
								}
								children={(isHarvestRate) =>
									isHarvestRate && (
										<>
											<TransactionGroupEmployeeId
												form={form}
												palmIndexes={getPalmLineIndices(
													form.getFieldValue("transactionLines"),
													palmProductId,
												)}
											/>
											<div className="grid grid-cols-3 gap-2">
												<form.AppField
													name="transactionPalmGroup.harvestRate"
													validators={numericValidator}
													listeners={{
														onChangeDebounceMs: 100,
														onChange: ({ value }) => {
															spreadHarvestRate(value ?? "");
														},
													}}
													children={(field) => (
														<field.NumericField label="ค่าตัด" />
													)}
												/>
												<form.AppField
													name="transactionPalmGroup.promotionTo"
													listeners={{
														onChange: ({ value }) => {
															spreadToPalmLines("promotionTo", value ?? "");
														},
													}}
													children={(field) => (
														<field.SelectField
															label="ให้ค่านำส่งแบบ"
															orientation="vertical"
															items={[
																{ label: "รวม", value: "sum" },
																{ label: "แยก", value: "split" },
															]}
														/>
													)}
												/>
												<form.AppField
													name="transactionPalmGroup.promotionRate"
													validators={numericValidator}
													listeners={{
														onChangeDebounceMs: 100,
														onChange: ({ value }) => {
															spreadPromotionRate(value ?? "");
														},
													}}
													children={(field) => (
														<field.NumericField label="อัตราค่านำส่ง" />
													)}
												/>
											</div>
											<div className="grid grid-cols-2 gap-2">
												<form.AppField
													name="transactionPalmGroup.farmerPaidType"
													listeners={{
														onChange: ({ value }) => {
															spreadToPalmLines(
																"farmerPaidType",
																value ?? "cash",
															);
														},
													}}
													children={(field) => (
														<field.SelectField
															label="จ่ายแบบเถ้าแก่"
															orientation="vertical"
															items={[
																{ label: "เงินสด", value: "cash" },
																{
																	label: "โอน",
																	value: "bank transfer",
																},
															]}
														/>
													)}
												/>
												<form.AppField
													name="transactionPalmGroup.employeePaidType"
													listeners={{
														onChange: ({ value }) => {
															spreadToPalmLines(
																"employeePaidType",
																value ?? "cash",
															);
														},
													}}
													children={(field) => (
														<field.SelectField
															label="จ่ายแบบคนตัด"
															orientation="vertical"
															items={[
																{ label: "เงินสด", value: "cash" },
																{
																	label: "โอน",
																	value: "bank transfer",
																},
															]}
														/>
													)}
												/>
											</div>
										</>
									)
								}
							/>
						</FieldGroup>
					</CardContent>
				</Card>
			</div>
		);
	},
});
