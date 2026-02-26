import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import { calculateVehicleWeight } from "@/utils/utils";
import { useStore } from "@tanstack/react-form";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export const TransactionLineVehicle = withForm({
	...transactionFormOptions,
	props: { index: 0 },
	render: function Render({ form, index }) {
		const farmerId = useStore(
			form.store,
			(state) => state.values.transactionGroup.farmerId,
		);
		const carlicensesData = useQuery(
			api.transactions.queries.getCarlicensesForm,
			farmerId ? { farmerId: farmerId as Id<"farmers"> } : "skip",
		);
		const createCarlicense = useMutation(
			api.transactions.mutations.createCarlicense,
		);
		const handleCarlicenseCreate = async (label: string) => {
			const newCarlicense = await createCarlicense({
				farmerId: farmerId as Id<"farmers">,
				licensePlate: label,
			});
			return {
				newValue: newCarlicense?._id as Id<"carlicenses">,
				newLabel: newCarlicense?.licensePlate,
			};
		};
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
									name={`transactionLines[${index}].carLicenseId`}
									validators={{
										onSubmit: ({ value }) => {
											if (!value) {
												return "กรุณาใส่ทะเบียนรถ";
											}
											return;
										},
									}}
									children={(field) => (
										<field.ComboBoxWithCreateField
											label="ทะเบียนรถ"
											handleCreate={handleCarlicenseCreate}
											selectData={carlicensesData || []}
											placeholder="กรอกทะเบียนรถ..."
											orientation="vertical"
											// isDisabled={true}
										/>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<form.AppField
										name={`transactionLines[${index}].weightVehicleIn`}
										validators={numericValidator}
										listeners={{
											onChangeDebounceMs: 100,
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
											onChangeDebounceMs: 100,
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
