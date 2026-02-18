import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { useAddEmployee, useGetEmployeesForm } from "@/utils/transaction.hooks";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { toast } from "sonner";
import { useStore } from "@tanstack/react-store";

export const TransactionGroupEmployeeId = withForm({
	...transactionFormOptions,
	props: { palmIndexes: [0] },
	render: function Render({ form, palmIndexes }) {
		const farmerId = useStore(
			form.store,
			(state) => state.values.transactionGroup.farmerId,
		);
		const { data: employeeData = [] } = useGetEmployeesForm(farmerId);
		const addEmployee = useAddEmployee();

		const handleEmployeeCreate = async (label: string) => {
			const farmerId = form.getFieldValue("transactionGroup.farmerId");
			try {
				const { employeeId, displayName } = await addEmployee.mutateAsync({
					data: { farmerId, displayName: label, phone: null, address: null },
				});
				toast.success(`สร้างลูกค้า "${label}" สำเร็จ`);
				return {
					newValue: employeeId,
					newLabel: displayName,
				};
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
				throw error;
			}
		};
		return (
			<FieldGroup>
				<form.AppField
					name="transactionPalmGroup.employeeId"
					validators={{
						onChange: ({ value }) => {
							for (const i of palmIndexes) {
								form.setFieldValue(`transactionLines[${i}].employeeId`, value);
							}
						},
						onSubmit: ({ value }) => {
							if (
								!value &&
								form.getFieldValue(`transactionPalmGroup.isHarvestRate`)
							) {
								return "กรุณาใส่ชื่อลูกค้า";
							}
							return;
						},
					}}
					children={(field) => (
						<field.ComboBoxWithCreateField
							label="ชื่อคนตัด"
							selectData={employeeData}
							handleCreate={handleEmployeeCreate}
						/>
					)}
				/>
			</FieldGroup>
		);
	},
});
