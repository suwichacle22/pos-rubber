import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { ModeToggle } from "../theme/ModeToggle";
import { Button } from "../ui/button";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";

const routeList = [
	{ name: "หน้าหลัก", path: "/" },
	{ name: "รายการซื้อ", path: "/transactions" },
	{ name: "สินค้า", path: "/products" },
	{ name: "ลูกค้า", path: "/farmer" },
];

export default function Header() {
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);
	const addTransactionGroup = useMutation(
		api.transactions.mutations.createTransactionGroup,
	);

	const handleAddTransactionGroup = async () => {
		const newGroupId = await addTransactionGroup({
			status: "pending",
		});
		setMobileOpen(false);
		navigate({
			to: "/transaction/$groupId",
			params: { groupId: newGroupId },
		});
	};

	return (
		<header className="border-b">
			{/* Desktop header */}
			<div className="hidden md:flex flex-row justify-between items-center p-4">
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
				<div className="flex items-center gap-2">
					<ModeToggle />
					<Button onClick={handleAddTransactionGroup}>
						เพิ่มรายการ
					</Button>
				</div>
			</div>

			{/* Mobile header */}
			<div className="flex md:hidden flex-row justify-between items-center p-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setMobileOpen(!mobileOpen)}
				>
					{mobileOpen ? (
						<XIcon className="h-5 w-5" />
					) : (
						<MenuIcon className="h-5 w-5" />
					)}
				</Button>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<Button size="sm" onClick={handleAddTransactionGroup}>
						เพิ่มรายการ
					</Button>
				</div>
			</div>

			{/* Mobile menu dropdown */}
			{mobileOpen && (
				<nav className="flex md:hidden flex-col border-t p-4 gap-2">
					{routeList.map((route) => (
						<Link
							key={route.path}
							to={route.path}
							className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
							onClick={() => setMobileOpen(false)}
						>
							{route.name}
						</Link>
					))}
				</nav>
			)}
		</header>
	);
}
