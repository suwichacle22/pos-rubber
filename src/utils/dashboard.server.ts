import { db } from "@/db";
import { transactionLines, transactionGroups, products } from "@/db/schema";
import { eq, and, sql, gte, lt } from "drizzle-orm";

export async function getDailySummaryDB(date: string) {
	const startOfDay = new Date(`${date}T00:00:00`);
	const endOfDay = new Date(`${date}T23:59:59.999`);

	return await db
		.select({
			productName: products.productName,
			totalWeight: sql<string>`coalesce(sum(${transactionLines.weight}::numeric), 0)`,
			averagePrice: sql<string>`coalesce(avg(${transactionLines.price}::numeric), 0)`,
			totalAmount: sql<string>`coalesce(sum(${transactionLines.totalAmount}::numeric), 0)`,
		})
		.from(transactionLines)
		.innerJoin(
			products,
			eq(transactionLines.productId, products.productId),
		)
		.innerJoin(
			transactionGroups,
			eq(transactionLines.transactionGroupId, transactionGroups.transactionGroupId),
		)
		.where(
			and(
				eq(transactionLines.isDeleted, false),
				eq(transactionGroups.isDeleted, false),
				gte(transactionLines.createdAt, startOfDay),
				lt(transactionLines.createdAt, endOfDay),
			),
		)
		.groupBy(products.productId, products.productName);
}
