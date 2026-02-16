import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export default function ProductCard({
	productData,
}: {
	productData: {
		productName: string;
		defaultSplitType: "percentage" | "per_kg";
		createdAt: Date | null;
		updatedAt: Date | null;
		productId: string;
	};
}) {
	return (
		<Card className="min-w-[380px] md:min-w-[660px]">
			<CardHeader>
				<CardTitle>{productData.productName}</CardTitle>
			</CardHeader>
			<CardContent>
				<p>{productData.defaultSplitType}</p>
			</CardContent>
			<CardFooter>
				<p>{productData.createdAt?.toLocaleDateString()}</p>
				<p>{productData.updatedAt?.toLocaleDateString()}</p>
			</CardFooter>
		</Card>
	);
}
