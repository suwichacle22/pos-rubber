import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { toast } from "sonner";
import { useStore } from "@tanstack/react-form";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";

export const TransactionGroupEmployeeId = withForm({
	...transactionFormOptions,
	props: { palmIndexes: [0] },
	render: function Render({ form, palmIndexes }) {
		const farmerId = useStore(
			form.store,
			(state) => state.values.transactionGroup.farmerId,
		);
		const employeesData = useQuery(
			api.transactions.queries.getEmployeesByFarmerIdForm,
			farmerId ? { farmerId: farmerId as Id<"farmers"> } : "skip",
		);
		const addEmployee = useMutation(api.transactions.mutations.createEmployee);

		const handleEmployeeCreate = async (label: string) => {
			const farmerId = form.getFieldValue("transactionGroup.farmerId");
			try {
				const employee = await addEmployee({
					farmerId: farmerId as Id<"farmers">,
					displayName: label,
				});
				toast.success(`สร้างลูกค้า "${label}" สำเร็จ`);
				return {
					newValue: employee?._id as Id<"employees">,
					newLabel: employee?.displayName,
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
							selectData={employeesData ?? []}
							handleCreate={handleEmployeeCreate}
						/>
					)}
				/>
			</FieldGroup>
		);
	},
});
