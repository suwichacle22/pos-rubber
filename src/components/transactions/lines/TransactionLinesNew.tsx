import { withForm } from "@/components/form/formContext";
import { FieldGroup } from "@/components/ui/field";
import { transactionFormOptions } from "@/utils/transaction.schema";
import { TransactionLineVehicle } from "./TransactionLinesVehicle";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TransactionLineWeight } from "./TransactionLinesWeight";
import { TransactionLineSplit } from "./TransactionLinesSplit";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { TransactionLineTransportFee } from "./TransactionLinesTransportFee";
import { TransactionLineHarvestRate } from "./TransactionLinesHarvestRate";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export const TransactionLine = withForm({
	...transactionFormOptions,
	props: {
		index: 0,
		selectProductsData: [{ label: "ไม่มีข้อมูล", value: "" }],
		onDelete: (index: number) => {},
	},
	render: function Render({ form, index, selectProductsData, onDelete }) {
		const productPalmId = useQuery(api.transactions.queries.getProductPalmIds);
		return (
			<Card>
				<CardHeader>
					<CardTitle>รายการสินค้าที่ {index + 1}</CardTitle>
					<CardAction>
						<Button
							variant="outline"
							size="icon"
							onClick={() => onDelete(index)}
						>
							<TrashIcon className="h-4 w-4" />
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<form.AppField
							name={`transactionLines[${index}].productId`}
							validators={{
								onSubmit: ({ value }) => {
									if (!value) {
										return "กรุณาเลือกสินค้า";
									}
									return;
								},
							}}
							children={(field) => (
								<field.ComboBoxField
									label="สินค้า"
									selectData={selectProductsData}
								/>
							)}
						/>
						<TransactionLineVehicle form={form} index={index} />
						<TransactionLineWeight form={form} index={index} />
						<TransactionLineSplit form={form} index={index} />
						<TransactionLineTransportFee form={form} index={index} />
						<form.Subscribe
							selector={(state) =>
								state.values.transactionLines[index].productId
							}
							children={(productId) => {
								return (
									productPalmId?.some(
										(product) => product._id === productId,
									) && <TransactionLineHarvestRate form={form} index={index} />
								);
							}}
						/>
					</FieldGroup>
				</CardContent>
			</Card>
		);
	},
});
