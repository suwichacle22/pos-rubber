import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

const RETENTION_MS = 48 * 60 * 60 * 1000;
const BATCH_LIMIT = 200;

export const cleanupPendingTransactionsOlderThan48Hours = internalMutation({
	args: {},
	returns: v.object({
		cutoffMs: v.number(),
		scannedGroups: v.number(),
		deletedGroups: v.number(),
		deletedLines: v.number(),
		hasMoreEligible: v.boolean(),
	}),
	handler: async (ctx) => {
		const cutoffMs = Date.now() - RETENTION_MS;
		const pendingGroups = await ctx.db
			.query("transactionGroups")
			.withIndex("by_status", (q) => q.eq("status", "pending"))
			.order("asc")
			.take(BATCH_LIMIT + 1);

		const eligibleGroups = pendingGroups.filter(
			(group) => group._creationTime < cutoffMs,
		);
		const groupsToDelete = eligibleGroups.slice(0, BATCH_LIMIT);
		const hasMoreEligible = eligibleGroups.length > BATCH_LIMIT;

		let deletedLines = 0;
		for (const group of groupsToDelete) {
			const lines = await ctx.db
				.query("transactionLines")
				.withIndex("by_transactionGroupId", (q) =>
					q.eq("transactionGroupId", group._id),
				)
				.collect();

			for (const line of lines) {
				await ctx.db.delete(line._id);
			}
			deletedLines += lines.length;
			await ctx.db.delete(group._id);
		}

		if (hasMoreEligible) {
			await ctx.scheduler.runAfter(
				0,
				internal.transactions.maintenance.cleanupPendingTransactionsOlderThan48Hours,
				{},
			);
		}

		return {
			cutoffMs,
			scannedGroups: pendingGroups.length,
			deletedGroups: groupsToDelete.length,
			deletedLines,
			hasMoreEligible,
		};
	},
});
