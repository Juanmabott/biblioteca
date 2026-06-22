import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth/AuthContext.js";
import { App } from "./App.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider baseUrl="/api">
      <App />
    </AuthProvider>
  </StrictMode>,
);
