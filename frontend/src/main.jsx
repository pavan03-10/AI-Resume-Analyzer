import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);