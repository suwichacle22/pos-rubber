import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { ModeToggle } from "../theme/ModeToggle";
import { Button } from "../ui/button";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";

export default function Header() {
	const navigate = useNavigate();
	const addTransactionGroup = useMutation(
		api.transactions.mutations.createTransactionGroup,
	);
	const routeList = [
		{ name: "หน้าหลัก", path: "/" },
		{ name: "รายการซื้อ", path: "/transactions" },
		{ name: "สินค้า", path: "/products" },
		{ name: "ลูกค้า", path: "/farmer" },
	];
	const handleAddTransactionGroup = async () => {
		const newGroupId = await addTransactionGroup({
			status: "pending",
		});
		navigate({ to: "/transaction/$groupId", params: { groupId: newGroupId } });
	};
	return (
		<div className="flex flex-row justify-between items-center p-4">
			<NavigationMenu>
				<NavigationMenuList>
					{routeList.map((route) => (
						<NavigationMenuItem key={route.path}>
							<NavigationMenuLink asChild>
								<Link to={route.path}>{route.name}</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
			<ModeToggle />
			<Button onClick={handleAddTransactionGroup}>เพิ่มรายการ</Button>
		</div>
	);
}
