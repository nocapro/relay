import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.style.css";
import { App } from "./app.component";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
