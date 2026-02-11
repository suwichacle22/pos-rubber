import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { useAddEmployee, useGetEmployeesForm } from "@/utils/transaction.hooks";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { toast } from "sonner";
import { useStore } from "@tanstack/react-store";

export const TransactionLinesEmployeeId = withForm({
	...transactionFormOptions,
	props: {
		index: 0,
	},
	render: function Render({ form, index }) {
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
				form.setFieldValue(`transactionLines[${index}].employeeId`, employeeId);
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
					name={`transactionLines[${index}].employeeId`}
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
