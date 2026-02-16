import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addProduct,
	getProducts,
	addFarmer,
	getFarmersForm,
	addEmployee,
	getEmployees,
	getProductsForm,
	getEmployeesForm,
	addTransactionGroupNew,
	addTransactionLinesNew,
	printTransactionGroup,
} from "./transaction.functions";

export function useAddProduct() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addProduct,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
}

export function useGetProducts() {
	return useQuery({
		queryKey: ["products"],
		queryFn: getProducts,
	});
}

export function useGetProductsForm() {
	return useQuery({
		queryKey: ["products", "form"],
		queryFn: getProductsForm,
	});
}

export function useAddFarmer() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addFarmer,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["farmers"] });
		},
	});
}

export function useGetFarmersForm() {
	return useQuery({
		queryKey: ["farmers", "form"],
		queryFn: getFarmersForm,
	});
}

export function useAddEmployee() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addEmployee,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			queryClient.invalidateQueries({ queryKey: ["farmers"] });
		},
	});
}

export function useGetEmployees() {
	return useQuery({
		queryKey: ["employees"],
		queryFn: getEmployees,
	});
}

export function useGetEmployeesForm(farmerId: string) {
	return useQuery({
		queryKey: ["employees", "form", farmerId],
		queryFn: () => getEmployeesForm({ data: { farmerId } }),
	});
}

export function useAddTransactionGroupNew() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addTransactionGroupNew,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transaction"] });
		},
	});
}

export function useAddTransactionLinesNew() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: addTransactionLinesNew,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transaction"] });
		},
	});
}

export function usePrintTransactionGroup() {
	return useMutation({
		mutationFn: printTransactionGroup,
	});
}
