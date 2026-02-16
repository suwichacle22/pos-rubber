import { createServerFn } from "@tanstack/react-start";
import { getDailySummaryDB } from "./dashboard.server";
import z from "zod";

export const getDailySummary = createServerFn({ method: "GET" })
	.inputValidator(z.object({ date: z.string() }))
	.handler(async ({ data }) => {
		return await getDailySummaryDB(data.date);
	});
