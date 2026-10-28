import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  History,
  Settings,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
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

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[240px] flex-col border-r border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      {/* Logo */}
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-none text-slate-900 dark:text-white">
              AI Resume
            </h1>

            <p className="mt-1 text-lg font-semibold text-violet-600 dark:text-violet-400">
              Analyzer
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Smart Resume Assistant
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex-1 overflow-y-auto px-3">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} />

                <span className="text-base font-medium">
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div>
        <Separator className="dark:bg-slate-800" />

        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              PK
            </AvatarFallback>
          </Avatar>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Pavan K
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Developer
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}