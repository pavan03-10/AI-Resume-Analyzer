import {
  LayoutDashboard,
  Upload,
  BarChart3,
  History,
  Settings,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Upload Resume",
    icon: Upload,
    path: "/upload",
  },
  {
    title: "Analysis Results",
    icon: BarChart3,
    path: "/results",
  },
  {
    title: "History",
    icon: History,
    path: "/history",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];