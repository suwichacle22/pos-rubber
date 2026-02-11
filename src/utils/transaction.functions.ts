import { createServerFn } from "@tanstack/react-start";
import {
	addProductSchema,
	addFarmerSchema,
	addEmployeeSchema,
	transactionGroupSchemaNew,
} from "./transaction.schema";
import {
	addProductDB,
	getProductsDB,
	addFarmerDB,
	getFarmersFormDB,
	addEmployeeDB,
	getEmployeesDB,
	getProductsFormDB,
	getFarmersDB,
	getEmployeesFormDB,
	addTransactionGroupDB,
} from "./transactions.server";
import z from "zod";

export const addProduct = createServerFn({ method: "POST" })
	.inputValidator(addProductSchema)
	.handler(async ({ data }) => {
		return await addProductDB(data);
	});

export const getProducts = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getProductsDB();
	},
);

export const getProductsForm = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getProductsFormDB();
	},
);

export const addFarmer = createServerFn({ method: "POST" })
	.inputValidator(addFarmerSchema)
	.handler(async ({ data }) => {
		return await addFarmerDB(data);
	});

export const getFarmer = createServerFn({ method: "GET" }).handler(async () => {
	return await getFarmersDB();
});

export const getFarmersForm = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getFarmersFormDB();
	},
);

export const addEmployee = createServerFn({ method: "POST" })
	.inputValidator(addEmployeeSchema)
	.handler(async ({ data }) => {
		return await addEmployeeDB(data);
	});

export const getEmployees = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getEmployeesDB();
	},
);

export const getEmployeesForm = createServerFn({ method: "GET" })
	.inputValidator(z.object({ farmerId: z.string() }))
	.handler(async ({ data }) => {
		return await getEmployeesFormDB(data.farmerId);
	});

export const addTransactionGroupNew = createServerFn({ method: "POST" })
	.inputValidator(transactionGroupSchemaNew)
	.handler(async ({ data }) => {
		return await addTransactionGroupDB(data);
	});
