import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/polish.css";
import "./styles/theme.css";
import "./styles/mobile-home.css";
import "./styles/pages.css";
import "./styles/cinema.css";
import "./styles/hero.css";
import "./styles/desktop-detail.css";
import App from "./App.tsx";
import { AuthProvider } from "./lib/AuthContext.tsx";
import { SiteContentProvider } from "./lib/SiteContentContext.tsx";
import { I18nProvider } from "./i18n/I18nContext.tsx";
import { initNativeShell } from "./lib/native";
import { lockPhoneViewport } from "./lib/viewport";

lockPhoneViewport();
void initNativeShell();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
