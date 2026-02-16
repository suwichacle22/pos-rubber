import { useQuery } from "@tanstack/react-query";
import { getDailySummary } from "./dashboard.functions";

export function useGetDailySummary(date: string) {
	return useQuery({
		queryKey: ["dashboard", "daily-summary", date],
		queryFn: () => getDailySummary({ data: { date } }),
	});
}
