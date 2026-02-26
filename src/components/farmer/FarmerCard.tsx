import { useState } from "react";
import type { FarmerWithEmployeesById } from "@/utils/type";
import { EmployeeForm } from "@/components/employee/EmployeeForm";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { formatDateThaiConvex } from "@/utils/utils";
import EmployeeSplitDefaults from "./EmployeeSplitDefaults";

export default function FarmerCard({
	farmerData,
}: {
	farmerData: FarmerWithEmployeesById;
}) {
	const [showAddEmployee, setShowAddEmployee] = useState(false);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{farmerData.displayName}</CardTitle>
				<CardDescription>
					{(() => {
						const { dateThai, time } = formatDateThaiConvex(farmerData._creationTime);
						return `${dateThai} ${time}`;
					})()}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{farmerData.employees && farmerData.employees.length > 0 && (
					<div className="flex flex-col gap-2 mt-2">
						<div className="text-lg font-semibold">คนตัด:</div>
						<div className="flex flex-col gap-2 pl-4">
							{farmerData.employees.map((employee) => (
								<div
									key={employee._id}
									className="border-l-2 border-gray-300 pl-3"
								>
									<p className="font-medium">{employee.displayName}</p>
									{employee.address && (
										<p className="text-sm text-gray-600">
											ที่อยู่: {employee.address}
										</p>
									)}
									{employee.phone && (
										<p className="text-sm text-gray-600">
											เบอร์โทร: {employee.phone}
										</p>
									)}
									<EmployeeSplitDefaults employeeId={employee._id} />
								</div>
							))}
						</div>
					</div>
				)}
				<div className="flex flex-col gap-2">
					<Button
						type="button"
						variant={showAddEmployee ? "secondary" : "outline"}
						size="sm"
						onClick={() => setShowAddEmployee((prev) => !prev)}
					>
						{showAddEmployee ? "ปิด" : "เพิ่มคนตัด"}
					</Button>
					{showAddEmployee && (
						<EmployeeForm
							farmerId={farmerData._id}
							onSuccess={() => setShowAddEmployee(false)}
						/>
					)}
				</div>
			</CardContent>
			<CardFooter />
		</Card>
	);
}
