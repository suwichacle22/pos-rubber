import { TextField } from "@/components/form/field/TextField";
import { withForm } from "@/components/form/formContext";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useAddFarmer, useGetFarmersForm } from "@/utils/transaction.hooks";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { toast } from "sonner";

export const TransactionGroup = withForm({
	...transactionFormOptions,
	render: function Render({ form }) {
		const { data: farmersData = [], isLoading: isLoadingFarmers } =
			useGetFarmersForm();
		const addFarmer = useAddFarmer();

		const handleFarmerCreate = async (label: string) => {
			try {
				const { farmerId, displayName } = await addFarmer.mutateAsync({
					data: { displayName: label, phone: null },
				});
				toast.success(`สร้างลูกค้า "${label}" สำเร็จ`);
				return {
					newValue: farmerId,
					newLabel: displayName,
				};
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
				throw error;
			}
		};
		return (
			<Card className="">
				<CardHeader>
					<CardTitle>หัวบิล</CardTitle>
					<CardAction>{isLoadingFarmers && <Spinner />}</CardAction>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name="transactionGroup.farmerId"
							validators={{
								onSubmit: ({ value }) => {
									if (!value) {
										return "กรุณาใส่ชื่อลูกค้า";
									}
									return;
								},
							}}
							children={(field) => (
								<field.ComboBoxWithCreateField
									label="ชื่อลูกค้า"
									handleCreate={handleFarmerCreate}
									selectData={farmersData}
									placeholder="กรอกชื่อลูกค้า..."
									orientation="vertical"
								/>
							)}
						/>
						<form.AppField
							name="transactionGroup.groupName"
							children={(field) => (
								<field.TextField
									label="รายละเอียดบิล"
									placeholder="กรอกรายละเอียดบิล..."
									orientation="vertical"
								/>
							)}
						/>
					</FieldGroup>
				</CardContent>
			</Card>
		);
	},
});
