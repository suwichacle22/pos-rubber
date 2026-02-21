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
import { transactionFormOptions } from "@/utils/transaction.schema";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Id } from "convex/_generated/dataModel";

export const TransactionGroup = withForm({
	...transactionFormOptions,
	render: function Render({ form }) {
		const farmersData = useQuery(api.transactions.queries.getFarmersForm);
		const createFarmer = useMutation(api.transactions.mutations.createFarmer);

		const handleFarmerCreate = async (label: string) => {
			const newFarmer = await createFarmer({
				displayName: label,
				phone: undefined,
			});
			return {
				newValue: newFarmer?._id as Id<"farmers">,
				newLabel: newFarmer?.displayName,
			};
		};
		return (
			<Card className="">
				<CardHeader>
					<CardTitle>หัวบิล</CardTitle>
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
									selectData={farmersData || []}
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
