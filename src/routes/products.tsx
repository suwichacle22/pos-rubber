import ProductCard from "@/components/product/ProductCard";
import { ProductForm } from "@/components/product/ProductForm";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/products")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: products } = useSuspenseQuery(
		convexQuery(api.transactions.queries.listProductsWithLatestPrice),
	);
	return (
		<div className="flex flex-col gap-8 p-6 max-w-2xl mx-auto">
			<ProductForm />
			<div className="text-2xl font-bold">สินค้า</div>
			<div className="flex flex-col gap-4">
				{products?.map((product) => (
					<ProductCard key={product._id} productData={product} />
				))}
			</div>
		</div>
	);
}
