import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	employees: {
		farmer: r.one.farmers({
			from: r.employees.farmerId,
			to: r.farmers.farmerId
		}),
		products: r.many.products({
			from: r.employees.employeeId.through(r.splitDefaults.employeeId),
			to: r.products.productId.through(r.splitDefaults.productId)
		}),
		transactionLines: r.many.transactionLines(),
	},
	farmers: {
		employees: r.many.employees(),
		transactionGroups: r.many.transactionGroups(),
	},
	productPrices: {
		product: r.one.products({
			from: r.productPrices.productId,
			to: r.products.productId
		}),
	},
	products: {
		productPrices: r.many.productPrices(),
		employees: r.many.employees(),
		transactionLines: r.many.transactionLines(),
	},
	transactionGroups: {
		farmer: r.one.farmers({
			from: r.transactionGroups.farmerId,
			to: r.farmers.farmerId
		}),
		transactionLines: r.many.transactionLines(),
	},
	transactionLines: {
		employee: r.one.employees({
			from: r.transactionLines.employeeId,
			to: r.employees.employeeId
		}),
		product: r.one.products({
			from: r.transactionLines.productId,
			to: r.products.productId
		}),
		transactionGroup: r.one.transactionGroups({
			from: r.transactionLines.transactionGroupId,
			to: r.transactionGroups.transactionGroupId
		}),
	},
}))