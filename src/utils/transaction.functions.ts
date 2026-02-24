import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { printReceipt } from "./transactions.server";

const getConvexUrl = (): string => {
	const url = process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL;
	if (!url) {
		throw new Error(
			"CONVEX_URL or VITE_CONVEX_URL must be set to call Convex from server",
		);
	}
	return url;
};

export const getPrintTransactionGroupSummary = createServerFn({
	method: "POST",
})
	.inputValidator(
		z.object({
			transactionGroupId: z.string().min(1),
		}),
	)
	.handler(async ({ data }) => {
		const client = new ConvexHttpClient(getConvexUrl());

		const transactionData = await client.action(
			api.transactions.actions.getPrintSummaryData,
			{
				transactionGroupId: data.transactionGroupId as Id<"transactionGroups">,
			},
		);
		return await printReceipt(transactionData);
	});
