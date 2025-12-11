import { createRoot } from "react-dom/client";
import { AppLayout } from "./app/layout";
import { AppProviders } from "./app/providers";
import "./styles/globals.css";

// #region agent log
// #endregion

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppLayout />
  </AppProviders>
);
