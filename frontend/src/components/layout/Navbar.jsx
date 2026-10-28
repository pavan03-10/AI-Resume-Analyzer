import { useEffect, useState } from "react";
import { Bell, LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/navbar/ThemeToggle";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const getDisplayName = (user) => {
      const metadata = user?.user_metadata || {};

      return (
        metadata.name?.trim() ||
        metadata.full_name?.trim() ||
        metadata.fullName?.trim() ||
        metadata.display_name?.trim() ||
        "User"
      );
    };

    const loadUserName = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Unable to load user name:", error.message);
        return;
      }

      if (mounted) {
        setUserName(getDisplayName(user));
      }
    };

    loadUserName();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUserName(getDisplayName(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Unable to sign out:", error.message);
      setIsSigningOut(false);
      return;
    }

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/80">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Welcome back! Analyze and improve your resume.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button
          variant="outline"
          size="icon"
          className="relative h-11 w-11 rounded-xl border-slate-300 bg-white text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
            className="flex h-11 items-center gap-2 rounded-xl border-slate-300 bg-white px-4 text-slate-700 transition-all duration-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <UserCircle2 className="h-5 w-5" />
            <span className="hidden font-medium sm:block">{userName}</span>
          </Button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}