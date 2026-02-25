import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import {
	numericValidator,
	transactionFormOptions,
} from "@/utils/transaction.schema";
import { calculateSplitAmount, calculateTotalAmount, calculateTransactionTotalNetAmount } from "@/utils/utils";
import { useStore } from "@tanstack/react-store";

export const TransactionLineWeight = withForm({
	...transactionFormOptions,
	props: { index: 0 },
	render: function Render({ form, index }) {
		const isVehicle = useStore(
			form.store,
			(state) => state.values.transactionLines[index].isVehicle,
		);
		return (
			<FieldGroup>
				<div className="grid grid-cols-3 gap-4">
					<form.AppField
						name={`transactionLines[${index}].weight`}
						validators={numericValidator}
						listeners={{
							onChangeDebounceMs: 100,
							onChange: ({ value }) => {
								const price = form.getFieldValue(
									`transactionLines[${index}].price`,
								);
								form.setFieldValue(
									`transactionLines[${index}].totalAmount`,
									calculateTotalAmount(value, price),
								);
							},
						}}
						children={(field) => (
							<field.NumericField label="น้ำหนักสินค้า" disabled={isVehicle} />
						)}
					/>
					<form.AppField
						name={`transactionLines[${index}].price`}
						validators={numericValidator}
						listeners={{
							onChangeDebounceMs: 100,
							onChange: ({ value }) => {
								const weight = form.getFieldValue(
									`transactionLines[${index}].weight`,
								);
								form.setFieldValue(
									`transactionLines[${index}].totalAmount`,
									calculateTotalAmount(value, weight),
								);
							},
						}}
						children={(field) => <field.NumericField label="ราคาสินค้า" />}
					/>
					<form.AppField
						name={`transactionLines[${index}].totalAmount`}
						validators={numericValidator}
						listeners={{
							onChangeDebounceMs: 100,
							onChange: ({ value }) => {
								const isSplit = form.getFieldValue(
									`transactionLines[${index}].isSplit`,
								);
								const isHarvestRate = form.getFieldValue(
									`transactionLines[${index}].isHarvestRate`,
								);

								if (isSplit === "none" && !isHarvestRate) {
									form.setFieldValue(
										`transactionLines[${index}].farmerAmount`,
										value,
									);
									form.setFieldValue(
										`transactionLines[${index}].employeeAmount`,
										"",
									);
								} else {
									const farmerRatio = form.getFieldValue(
										`transactionLines[${index}].farmerRatio`,
									);
									const employeeRatio = form.getFieldValue(
										`transactionLines[${index}].employeeRatio`,
									);
									form.setFieldValue(
										`transactionLines[${index}].farmerAmount`,
										calculateSplitAmount(value, farmerRatio),
									);
									form.setFieldValue(
										`transactionLines[${index}].employeeAmount`,
										calculateSplitAmount(value, employeeRatio),
									);
								}
								// Always recalculate totalNetAmount
								const promotionAmount = form.getFieldValue(
									`transactionLines[${index}].promotionAmount`,
								);
								form.setFieldValue(
									`transactionLines[${index}].totalNetAmount`,
									calculateTransactionTotalNetAmount(value, promotionAmount || ""),
								);
							},
						}}
						children={(field) => (
							<field.NumericField
								label="ยอดซื้อ"
								placeholder="ยอด"
								disabled={true}
							/>
						)}
					/>
				</div>
				<form.Subscribe
					selector={(state) => [
						state.values.transactionLines[index].isSplit,
						state.values.transactionLines[index].isHarvestRate,
					]}
					children={([isSplit, isHarvestRate]) =>
						isSplit === "none" &&
						isHarvestRate === false && (
							<FieldGroup>
								<form.AppField
									name={`transactionLines[${index}].farmerPaidType`}
									children={(field) => (
										<field.SelectField
											label="จ่ายด้วย"
											items={[
												{ label: "เงินสด", value: "cash" },
												{ label: "โอน", value: "bank transfer" },
											]}
										/>
									)}
								/>
							</FieldGroup>
						)
					}
				/>
			</FieldGroup>
		);
	},
});
