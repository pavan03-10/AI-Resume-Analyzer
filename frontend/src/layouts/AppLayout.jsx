import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
      <Sidebar />

      <div className="ml-[240px] flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-8 transition-colors duration-300 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}