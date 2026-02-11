import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export default function EmployeeCard({ employeeData }: {
	employeeData: {
		displayName: string;
		address: string | null;
		phone: string | null;
		createdAt: Date | null;
		updatedAt: Date | null;
		employeeId: string;
		farmers: {
			displayName: string;
			farmerId: string;
		} | null;
	}
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{employeeData.displayName}</CardTitle>
			</CardHeader>
			<CardContent>
				{employeeData.farmers && (
					<p>เกษตรกร: {employeeData.farmers.displayName}</p>
				)}
				{employeeData.address && <p>ที่อยู่: {employeeData.address}</p>}
				{employeeData.phone && <p>เบอร์โทร: {employeeData.phone}</p>}
			</CardContent>
			<CardFooter>
				<p>{employeeData.createdAt?.toLocaleDateString()}</p>
			</CardFooter>
		</Card>
	);
}
