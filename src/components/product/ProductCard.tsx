import type { Id } from "convex/_generated/dataModel";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ProductPriceForm } from "./ProductPriceForm";

export default function ProductCard({
	productData,
}: {
	productData: {
		_id: Id<"products">;
		productName: string;
		_creationTime: number;
		latestPrice: number | null;
		latestPriceAt: number | null;
	};
}) {
	return (
		<Card className="min-w-[380px] md:min-w-[660px]">
			<CardHeader>
				<CardTitle>{productData.productName}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<p>
					Latest price:{" "}
					{productData.latestPrice === null
						? "No price yet"
						: productData.latestPrice.toLocaleString()}
				</p>
				{productData.latestPriceAt && (
					<p className="text-sm text-muted-foreground">
						Last price update: {new Date(productData.latestPriceAt).toLocaleString()}
					</p>
				)}
				<ProductPriceForm productId={productData._id} />
			</CardContent>
			<CardFooter>
				<p className="text-sm text-muted-foreground">
					Created at: {new Date(productData._creationTime).toLocaleDateString()}
				</p>
			</CardFooter>
		</Card>
	);
}