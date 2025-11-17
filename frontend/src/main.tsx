import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AluguelProvider } from "./context/AluguelContext.js";
import { AuthProvider } from "@/context/AuthContext"; // ✅ novo import

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AluguelProvider>
      <App />
    </AluguelProvider>
  </AuthProvider>
);

