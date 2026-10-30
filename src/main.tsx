import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Dashboard } from "./Dashboard";
import { PartnershipProvider } from "./PartnershipContext";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PartnershipProvider>
      <Dashboard />
    </PartnershipProvider>
  </StrictMode>,
);
