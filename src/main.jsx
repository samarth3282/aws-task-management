import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./lib/auth"; // configures Amplify as a side effect, before anything renders
import "./styles/base.css";
import "./styles/landing.css";
import "./styles/auth.css";
import "./styles/app.css";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AccentColorProvider } from "./contexts/AccentColorContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AccentColorProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </AccentColorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
