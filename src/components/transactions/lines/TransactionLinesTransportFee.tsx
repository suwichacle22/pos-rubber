import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import {
	calculateSplitAmount,
	calculateTransportationFeeAmount,
} from "@/utils/utils";

export const TransactionLineTransportFee = withForm({
	...transactionFormOptions,
	props: { index: 0 },
	render: function Render({ form, index }) {
		return (
			<FieldGroup>
				<form.Subscribe
					selector={(state) => state.values.transactionLines[index].isSplit}
					children={(isSplit) =>
						isSplit !== "none" && (
							<form.AppField
								listeners={{
									onChangeDebounceMs: 300,
									onChange: ({ value }) => {
										if (!value) {
											form.setFieldValue(
												`transactionLines[${index}].transportationFee`,
												"",
											);
											form.setFieldValue(
												`transactionLines[${index}].transportationFeeFarmerAmount`,
												"",
											);
											form.setFieldValue(
												`transactionLines[${index}].transportationFeeEmployeeAmount`,
												"",
											);
										}
									},
								}}
								name={`transactionLines[${index}].isTransportationFee`}
								children={(field) => <field.CheckboxField label="หักค่ารถ" />}
							/>
						)
					}
				/>
				<form.Subscribe
					selector={(state) =>
						state.values.transactionLines[index].isTransportationFee
					}
					children={(isTransportationFee) =>
						isTransportationFee && (
							<FieldGroup>
								<div className="grid grid-cols-2 gap-4">
									<form.AppField
										name={`transactionLines[${index}].transportationFee`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const {
													transportationFeeAmount,
													farmerTransportationFeeAmount,
													employeeTransportationFeeAmount,
												} = calculateTransportationFeeAmount(
													form.getFieldValue(
														`transactionLines[${index}].farmerAmount`,
													),
													form.getFieldValue(
														`transactionLines[${index}].employeeAmount`,
													),
													form.getFieldValue(
														`transactionLines[${index}].weight`,
													),
													value,
												);
												form.setFieldValue(
													`transactionLines[${index}].transportationFeeAmount`,
													transportationFeeAmount,
												);
												form.setFieldValue(
													`transactionLines[${index}].transportationFeeFarmerAmount`,
													farmerTransportationFeeAmount,
												);
												form.setFieldValue(
													`transactionLines[${index}].transportationFeeEmployeeAmount`,
													employeeTransportationFeeAmount,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="ค่ารถจากน้ำหนัก" />
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].transportationFeeFarmerAmount`}
										validators={numericValidator}
										children={(field) => (
											<field.NumericField label="ยอดเถ้าแก่ + ค่ารถ" disabled />
										)}
									/>
									<div></div>
									<form.AppField
										name={`transactionLines[${index}].transportationFeeEmployeeAmount`}
										validators={numericValidator}
										children={(field) => (
											<field.NumericField label="ยอดคนตัด - ค่ารถ" disabled />
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
