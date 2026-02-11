import ProductCard from "@/components/product/ProductCard";
import { ProductForm } from "@/components/product/ProductForm";
import { getProducts } from "@/utils/transaction.functions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

const productsQueryOptions = {
	queryKey: ["products"],
	queryFn: getProducts,
};
export const Route = createFileRoute("/products")({
	component: RouteComponent,
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(productsQueryOptions),
});

function RouteComponent() {
	const { data: products } = useSuspenseQuery(productsQueryOptions);
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="flex flex-col items-center justify-center">
				<ProductForm />
			</div>
			<div className="flex text-2xl font-bold justify-items-start items-start">
				สินค้า
			</div>
			<div className="flex flex-col gap-4">
				{products?.map((product) => (
					<ProductCard key={product.productId} productData={product} />
				))}
			</div>
		</div>
	);
}
