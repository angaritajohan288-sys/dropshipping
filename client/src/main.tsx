import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import StaticSupabaseApp from "./pages/StaticSupabaseApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" switchable>
    <SupabaseAuthProvider>
      <StaticSupabaseApp />
    </SupabaseAuthProvider>
  </ThemeProvider>,
);
