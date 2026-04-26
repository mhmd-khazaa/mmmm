import { PiSquaresFourDuotone } from "react-icons/pi";
import { routes } from "@/config/routes";

export type MenuItem = {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string;
  dropdownItems?: { name: string; href: string }[];
};

export const menuItems: MenuItem[] = [
  { name: "Overview" },
  {
    name: "Dashboard",
    href: routes.dashboard,
    icon: <PiSquaresFourDuotone />,
  },
];
