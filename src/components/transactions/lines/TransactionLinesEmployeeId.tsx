import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { toast } from "sonner";
import { useStore } from "@tanstack/react-store";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { applySplitDefaultToLine } from "@/utils/splitDefault";

export const TransactionLinesEmployeeId = withForm({
	...transactionFormOptions,
	props: {
		index: 0,
	},
	render: function Render({ form, index }) {
		const convex = useConvex();
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
					name={`transactionLines[${index}].employeeId`}
					validators={{
						onSubmit: ({ value }) => {
							if (
								(!value &&
									form.getFieldValue(`transactionLines[${index}].isSplit`) !==
										"none") ||
								form.getFieldValue("transactionPalmGroup.isHarvestRate")
							) {
								return "กรุณาใส่ชื่อลูกค้า";
							}
							return;
						},
					}}
					listeners={{
						onChange: async ({ value }) => {
							if (!value) return;
							const productId = form.getFieldValue(
								`transactionLines[${index}].productId`,
							);
							if (!productId) return;
							const splitDefault = await convex.query(
								api.transactions.queries
									.getSplitDefaultByEmployeeAndProduct,
								{
									employeeId: value as Id<"employees">,
									productId: productId as Id<"products">,
								},
							);
							if (splitDefault) {
								applySplitDefaultToLine(splitDefault, form, index);
							}
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
