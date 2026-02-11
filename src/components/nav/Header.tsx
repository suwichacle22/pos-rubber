import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "@tanstack/react-router";
import { ModeToggle } from "../theme/ModeToggle";
import { Button } from "../ui/button";

export default function Header() {
	const routeList = [
		{ name: "Home", path: "/" },
		{ name: "Transactions", path: "/transactions" },
		{ name: "Products", path: "/products" },
		{ name: "Farmers", path: "/farmer" },
	];
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
			<Button>
				<Link to="/transaction/new">เพิ่มรายการ</Link>
			</Button>
		</div>
	);
}
