import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { ReceiptTextIcon } from "lucide-react";

export function EmptyTransaction() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<ReceiptTextIcon />
				</EmptyMedia>
				<EmptyTitle>ยังไม่มีรายการ</EmptyTitle>
			</EmptyHeader>
			<EmptyContent className="flex-row justify-center">
				<Button>สร้างรายการใหม่</Button>
			</EmptyContent>
		</Empty>
	);
}
