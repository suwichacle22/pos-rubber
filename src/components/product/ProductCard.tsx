import type { Id } from "convex/_generated/dataModel";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ProductPriceForm } from "./ProductPriceForm";
import { formatDateThaiConvex } from "@/utils/utils";

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
					ราคาล่าสุด:{" "}
					{productData.latestPrice === null
						? "ยังไม่มีราคา"
						: productData.latestPrice.toLocaleString()}
				</p>
				{productData.latestPriceAt && (
					<p className="text-sm text-muted-foreground">
						อัพเดทราคาล่าสุด:{" "}
						{(() => {
							const { dateThai, time } = formatDateThaiConvex(productData.latestPriceAt);
							return `${dateThai} ${time}`;
						})()}
					</p>
				)}
				<ProductPriceForm productId={productData._id} />
			</CardContent>
			<CardFooter>
				<p className="text-sm text-muted-foreground">
					วันที่สร้าง:{" "}
					{(() => {
						const { dateThai } = formatDateThaiConvex(productData._creationTime);
						return dateThai;
					})()}
				</p>
			</CardFooter>
		</Card>
	);
}
