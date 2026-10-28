import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { supabase } from "@/lib/supabase";
import AppLayout from "@/layouts/AppLayout";

import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import UploadResume from "@/pages/UploadResume.jsx";
import Loading from "@/pages/Loading.jsx";
import Results from "@/pages/Results.jsx";
import History from "@/pages/History.jsx";
import Settings from "@/pages/Settings.jsx";


/* ============================================================
   Protected Application Layout
============================================================ */

function ProtectedLayout() {
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Supabase session error:", error);
        }

        setSession(data?.session ?? null);
      } catch (error) {
        console.error("Failed to check Supabase session:", error);

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession ?? null);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ----------------------------------------------------------
     Session loading
  ---------------------------------------------------------- */

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------
     Not authenticated
  ---------------------------------------------------------- */

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* ----------------------------------------------------------
     Authenticated
  ---------------------------------------------------------- */

  return <Outlet />;
}


/* ============================================================
   Application Router
============================================================ */

export default function AppRouter() {
  return (
    <Routes>

      {/* ======================================================
          Public Routes
      ======================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* ======================================================
          Protected Routes
      ======================================================= */}

      <Route element={<ProtectedLayout />}>
        <Route
          path="/"
          element={<AppLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="upload"
            element={<UploadResume />}
          />

          <Route
            path="loading"
            element={<Loading />}
          />

          <Route
            path="results"
            element={<Results />}
          />

          <Route
            path="history"
            element={<History />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Route>


      {/* ======================================================
          404
      ======================================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}