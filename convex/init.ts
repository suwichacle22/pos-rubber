import { Crons } from "@convex-dev/crons";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { mutation } from "./_generated/server";

const crons = new Crons(components.crons);
const DAILY_PENDING_CLEANUP_CRON = "daily-pending-cleanup";

export const registerMaintenanceCrons = mutation({
	args: {},
	returns: v.object({
		cronName: v.string(),
		created: v.boolean(),
	}),
	handler: async (ctx) => {
		const existing = await crons.get(ctx, { name: DAILY_PENDING_CLEANUP_CRON });
		if (existing) {
			return { cronName: DAILY_PENDING_CLEANUP_CRON, created: false };
		}

		await crons.register(
			ctx,
			{
				kind: "cron",
				cronspec: "0 0 * * *",
				tz: "Asia/Bangkok",
			},
			internal.transactions.maintenance
				.cleanupPendingTransactionsOlderThan48Hours,
			{},
			DAILY_PENDING_CLEANUP_CRON,
		);

		return { cronName: DAILY_PENDING_CLEANUP_CRON, created: true };
	},
});
