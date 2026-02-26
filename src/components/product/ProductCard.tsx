import { useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ProductPriceForm } from "./ProductPriceForm";
import { formatDateThaiConvex } from "@/utils/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";

export default function ProductCard({
	productData,
}: {
	productData: {
		_id: Id<"products">;
		productName: string;
		productLines?: number;
		_creationTime: number;
		latestPrice: number | null;
		latestPriceAt: number | null;
	};
}) {
	const updateProduct = useMutation(api.transactions.mutations.updateProduct);
	const deleteProduct = useMutation(api.transactions.mutations.deleteProduct);
	const [productLines, setProductLines] = useState(
		productData.productLines != null ? String(productData.productLines) : "",
	);

	const handleSaveProductLines = () => {
		const num = productLines === "" ? undefined : Number(productLines);
		if (num !== productData.productLines) {
			updateProduct({ productId: productData._id, productLines: num });
		}
	};

	return (
		<Card className="min-w-[380px] md:min-w-[660px]">
			<CardHeader>
				<CardTitle>{productData.productName}</CardTitle>
				<CardAction>
					<Button
						variant="outline"
						size="icon"
						className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
						onClick={() => deleteProduct({ productId: productData._id })}
					>
						<TrashIcon className="h-4 w-4" />
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="flex items-center gap-2">
					<Label htmlFor={`productLines-${productData._id}`} className="text-sm whitespace-nowrap">
						ลำดับ:
					</Label>
					<Input
						id={`productLines-${productData._id}`}
						type="number"
						className="w-20 h-8"
						value={productLines}
						onChange={(e) => setProductLines(e.target.value)}
						onBlur={handleSaveProductLines}
						placeholder="-"
					/>
				</div>
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
