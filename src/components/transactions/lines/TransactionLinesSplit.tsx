import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import {
	calculateSplitAmount,
	calculateSplitPercentage,
	calculateTransportationFeeAmount,
} from "@/utils/utils";
import { TransactionLinesEmployeeId } from "./TransactionLinesEmployeeId";

export const TransactionLineSplit = withForm({
	...transactionFormOptions,
	props: {
		index: 0,
	},
	render: function Render({ form, index }) {
		return (
			<FieldGroup>
				<form.AppField
					name={`transactionLines[${index}].isSplit`}
					listeners={{
						onChangeDebounceMs: 300,
						onChange: ({ value }) => {
							const totalAmount = form.getFieldValue(
								`transactionLines[${index}].totalAmount`,
							);
							let farmerRatio = "";
							let employeeRatio = "";

							if (value === "none") {
								farmerRatio = "";
								employeeRatio = "";
							} else if (value === "6/4") {
								farmerRatio = "0.6";
								employeeRatio = "0.4";
							} else if (value === "55/45") {
								farmerRatio = "0.55";
								employeeRatio = "0.45";
							} else if (value === "1/2") {
								farmerRatio = "0.5";
								employeeRatio = "0.5";
							} else if (value === "58/42") {
								farmerRatio = "0.58";
								employeeRatio = "0.42";
							} else if (value === "custom") {
								farmerRatio = "";
								employeeRatio = "";
							}

							// Set ratios
							form.setFieldValue(
								`transactionLines[${index}].farmerRatio`,
								farmerRatio,
							);
							form.setFieldValue(
								`transactionLines[${index}].employeeRatio`,
								employeeRatio,
							);

							// Recalculate amounts based on new ratios
							if (value !== "none" && totalAmount) {
								const farmerAmount = calculateSplitAmount(
									totalAmount,
									farmerRatio,
								);
								const employeeAmount = calculateSplitAmount(
									totalAmount,
									employeeRatio,
								);
								form.setFieldValue(
									`transactionLines[${index}].farmerAmount`,
									farmerAmount,
								);
								form.setFieldValue(
									`transactionLines[${index}].employeeAmount`,
									employeeAmount,
								);
							} else {
								// Clear amounts when split is "none" or custom with no ratios
								form.setFieldValue(
									`transactionLines[${index}].farmerAmount`,
									"",
								);
								form.setFieldValue(
									`transactionLines[${index}].employeeAmount`,
									"",
								);
								form.setFieldValue(`transactionLines[${index}].employeeId`, "");
							}
						},
					}}
					children={(field) => (
						<field.SelectField
							label="เลือกวิธีแบ่ง"
							items={[
								{
									label: "ไม่แบ่ง",
									value: "none",
									farmerRatio: "",
									employeeRatio: "",
								},
								{
									label: "6/4",
									value: "6/4",
									farmerRatio: "0.6",
									employeeRatio: "0.4",
								},
								{
									label: "55/45",
									value: "55/45",
									farmerRatio: "0.55",
									employeeRatio: "0.45",
								},
								{
									label: "1/2",
									value: "1/2",
									farmerRatio: "0.5",
									employeeRatio: "0.5",
								},
								{
									label: "58/42",
									value: "58/42",
									farmerRatio: "0.58",
									employeeRatio: "0.42",
								},
								{
									label: "กำหนดเอง",
									value: "custom",
									farmerRatio: "",
									employeeRatio: "",
								},
							]}
						/>
					)}
				/>
				<form.Subscribe
					selector={(state) => state.values.transactionLines[index].isSplit}
					children={(isSplit) =>
						isSplit !== "none" && (
							<FieldGroup>
								<TransactionLinesEmployeeId form={form} index={index} />
								<div className="grid grid-cols-3 gap-4">
									<form.AppField
										name={`transactionLines[${index}].farmerRatio`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const employeeRatio = calculateSplitPercentage(value);
												form.setFieldValue(
													`transactionLines[${index}].employeeRatio`,
													employeeRatio,
												);
												const farmerAmount = calculateSplitAmount(
													form.getFieldValue(
														`transactionLines[${index}].totalAmount`,
													),
													value,
												);
												form.setFieldValue(
													`transactionLines[${index}].farmerAmount`,
													farmerAmount,
												);
											},
										}}
										children={(field) => <field.NumericField label="เถ้าแก่" />}
									/>
									<form.AppField
										name={`transactionLines[${index}].farmerAmount`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const { farmerTransportationFeeAmount } =
													calculateTransportationFeeAmount(
														value,
														form.getFieldValue(
															`transactionLines[${index}].employeeAmount`,
														),
														form.getFieldValue(
															`transactionLines[${index}].weight`,
														),
														form.getFieldValue(
															`transactionLines[${index}].transportationFee`,
														),
													);
												form.setFieldValue(
													`transactionLines[${index}].transportationFeeFarmerAmount`,
													farmerTransportationFeeAmount,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="ยอดเถ้าแก่" disabled />
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
									<form.AppField
										name={`transactionLines[${index}].employeeRatio`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const employeeAmount = calculateSplitAmount(
													form.getFieldValue(
														`transactionLines[${index}].totalAmount`,
													),
													value,
												);
												form.setFieldValue(
													`transactionLines[${index}].employeeAmount`,
													employeeAmount,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="คนตัด" disabled />
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].employeeAmount`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const { employeeTransportationFeeAmount } =
													calculateTransportationFeeAmount(
														form.getFieldValue(
															`transactionLines[${index}].farmerAmount`,
														),
														value,
														form.getFieldValue(
															`transactionLines[${index}].weight`,
														),
														form.getFieldValue(
															`transactionLines[${index}].transportationFee`,
														),
													);
												form.setFieldValue(
													`transactionLines[${index}].transportationFeeEmployeeAmount`,
													employeeTransportationFeeAmount,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="ยอดพนักงาน" disabled />
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
								</div>
							</FieldGroup>
						)
					}
				/>
			</FieldGroup>
		);
	},
});
