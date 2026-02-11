import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export default function FarmerCard({ farmerData }: {
	farmerData: {
		displayName: string;
		phone: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
		farmerId: string;
		employees?: Array<{
			displayName: string;
			address: string | null;
			phone: string | null;
			createdAt: Date | null;
			updatedAt: Date | null;
			employeeId: string;
		}>;
	}
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{farmerData.displayName}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{farmerData.phone && <p>เบอร์โทร: {farmerData.phone}</p>}
				{farmerData.employees && farmerData.employees.length > 0 && (
					<div className="flex flex-col gap-2 mt-2">
						<div className="text-lg font-semibold">พนักงาน:</div>
						<div className="flex flex-col gap-2 pl-4">
							{farmerData.employees.map((employee) => (
								<div key={employee.employeeId} className="border-l-2 border-gray-300 pl-3">
									<p className="font-medium">{employee.displayName}</p>
									{employee.address && <p className="text-sm text-gray-600">ที่อยู่: {employee.address}</p>}
									{employee.phone && <p className="text-sm text-gray-600">เบอร์โทร: {employee.phone}</p>}
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
			<CardFooter>
				<p>{farmerData.createdAt?.toLocaleDateString()}</p>
			</CardFooter>
		</Card>
	);
}
