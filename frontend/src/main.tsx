import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AluguelProvider } from "../../backend/src/context/AluguelContext.tsx";
import { AuthProvider } from "@/context/AuthContext"; // ✅ novo import

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AluguelProvider>
      <App />
    </AluguelProvider>
  </AuthProvider>
);

