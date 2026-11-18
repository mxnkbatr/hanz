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
import "./styles/site-theme.css";
import "./styles/home-desktop.css";
import "./styles/site-copy.css";
import "./styles/refresh.css";
import "./styles/app-mobile.css";
import "./styles/ios-ui.css";
import "./styles/app-ios.css";
import "./styles/app-phase1.css";
import "./styles/app-apple.css";
import "./styles/app-home.css";
import "./styles/app-abroad.css";
import "./styles/app-noir.css";
import "./styles/app-light.css";
import "./styles/app-native.css";
import "./styles/app-perf.css";
import App from "./App.tsx";
import { AuthProvider } from "./lib/AuthContext.tsx";
import { SiteContentProvider } from "./lib/SiteContentContext.tsx";
import { I18nProvider } from "./i18n/I18nContext.tsx";
import { initNativeShell } from "./lib/native";
import { lockPhoneViewport } from "./lib/viewport";
import { installPressFeedback } from "./lib/pressFeedback";

lockPhoneViewport();
installPressFeedback();
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
