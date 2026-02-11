import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import {
	calculateHarvestRateAmount,
	calculatePromotionAmount,
	calculateSplitAmount,
	calculateTransportationFeeAmount,
} from "@/utils/utils";
import { TransactionLinesEmployeeId } from "./TransactionLinesEmployeeId";

// harvestRate: string;
// promotionRate: string;
// promotionTo: string;
// promotionAmount: string;
export const TransactionLineHarvestRate = withForm({
	...transactionFormOptions,
	props: { index: 0 },
	render: function Render({ form, index }) {
		return (
			<FieldGroup>
				<form.Subscribe
					selector={(state) => state.values.transactionLines[index].isSplit}
					children={(isSplit) =>
						isSplit === "none" && (
							<form.AppField
								name={`transactionLines[${index}].isHarvestRate`}
								listeners={{
									onChangeDebounceMs: 300,
									onChange: ({ value }) => {
										if (!value) {
											form.setFieldValue(
												`transactionLines[${index}].harvestRate`,
												"",
											);
										}
										if (value) {
											form.setFieldValue(
												`transactionLines[${index}].isSplit`,
												"none",
											);
										}
									},
								}}
								children={(field) => <field.CheckboxField label="ค่าตัดปาล์ม" />}
							/>
						)
					}
				/>
				<form.Subscribe
					selector={(state) =>
						state.values.transactionLines[index].isHarvestRate
					}
					children={(isHarvestRate) =>
						isHarvestRate && (
							<>
								<TransactionLinesEmployeeId form={form} index={index} />
								<div className="grid grid-cols-3 gap-2">
									<form.AppField
										name={`transactionLines[${index}].harvestRate`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const { farmerAmount, employeeAmount } =
													calculateHarvestRateAmount(
														value,
														form.getFieldValue(
															`transactionLines[${index}].weight`,
														),
														form.getFieldValue(
															`transactionLines[${index}].totalAmount`,
														),
													);
												form.setFieldValue(
													`transactionLines[${index}].farmerAmount`,
													farmerAmount,
												);
												form.setFieldValue(
													`transactionLines[${index}].employeeAmount`,
													employeeAmount,
												);
											},
										}}
										children={(field) => (
											<field.NumericField
												label="อัตราค่าตัด"
												placeholder="0.4, 0.8"
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].farmerAmount`}
										validators={numericValidator}
										children={(field) => (
											<field.NumericField
												label="เถ้าแก่"
												placeholder="ยอดเถ้าแก่"
												disabled={true}
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].farmerPaidType`}
										children={(field) => (
											<field.SelectField
												label="จ่ายแบบ"
												orientation="vertical"
												items={[
													{ label: "เงินสด", value: "cash" },
													{ label: "โอน", value: "bank transfer" },
												]}
											/>
										)}
									/>
									<div></div>
									<form.AppField
										name={`transactionLines[${index}].employeeAmount`}
										validators={numericValidator}
										children={(field) => (
											<field.NumericField
												label="ค่าตัด"
												placeholder="ยอดค่าตัด"
												disabled={true}
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].employeePaidType`}
										children={(field) => (
											<field.SelectField
												label="จ่ายแบบ"
												orientation="vertical"
												items={[
													{ label: "เงินสด", value: "cash" },
													{ label: "โอน", value: "bank transfer" },
												]}
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].promotionTo`}
										children={(field) => (
											<field.SelectField
												label="ให้ค่าตัดกับ"
												orientation="vertical"
												items={[
													{ label: "เถ้าแก่", value: "farmer" },
													{ label: "คนตัด", value: "employee" },
												]}
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].promotionRate`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												form.setFieldValue(
													`transactionLines[${index}].promotionAmount`,
													calculatePromotionAmount(
														value,
														form.getFieldValue(
															`transactionLines[${index}].weight`,
														),
													),
												);
											},
										}}
										children={(field) => (
											<field.NumericField
												label="อัตราค่านำส่ง"
												placeholder="0.1, 0.15"
												orientation="vertical"
											/>
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].promotionAmount`}
										validators={numericValidator}
										children={(field) => (
											<field.NumericField
												label="ยอดค่านำส่ง"
												placeholder=""
												disabled={true}
												orientation="vertical"
											/>
										)}
									/>
								</div>
							</>
						)
					}
				/>
			</FieldGroup>
		);
	},
});
