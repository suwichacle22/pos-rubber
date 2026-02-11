import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import { calculateVehicleWeight } from "@/utils/utils";

export const TransactionLineVehicle = withForm({
	...transactionFormOptions,
	props: { index: 0 },
	render: function Render({ form, index }) {
		return (
			<FieldGroup>
				<form.AppField
					name={`transactionLines[${index}].isVehicle`}
					children={(field) => <field.CheckboxField label="ช่างรถยนต์" />}
				/>
				<form.Subscribe
					selector={(state) => state.values.transactionLines[index].isVehicle}
					children={(isVehicle) =>
						isVehicle && (
							<FieldGroup>
								<form.AppField
									name={`transactionLines[${index}].carLicense`}
									children={(field) => (
										<field.TextField
											label="ทะเบียนรถ"
											placeholder="กรอกทะเบียนรถ..."
										/>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<form.AppField
										name={`transactionLines[${index}].weightVehicleIn`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const inWeight = value;
												const outWeight = form.getFieldValue(
													`transactionLines[${index}].weightVehicleOut`,
												);
												const weight = calculateVehicleWeight(
													inWeight,
													outWeight,
												);
												form.setFieldValue(
													`transactionLines[${index}].weight`,
													weight,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="น้ำหนักรถเข้า" />
										)}
									/>
									<form.AppField
										name={`transactionLines[${index}].weightVehicleOut`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 300,
											onChange: ({ value }) => {
												const inWeight = form.getFieldValue(
													`transactionLines[${index}].weightVehicleIn`,
												);
												const outWeight = value;
												const weight = calculateVehicleWeight(
													inWeight,
													outWeight,
												);
												form.setFieldValue(
													`transactionLines[${index}].weight`,
													weight,
												);
											},
										}}
										children={(field) => (
											<field.NumericField label="น้ำหนักรถออก" />
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
