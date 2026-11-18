import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "mn.hanz.academy",
  appName: "Hanz Academy",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      overlaysWebView: true,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    backgroundColor: "#f6f4f4",
  },
  android: {
    backgroundColor: "#f6f4f4",
    allowMixedContent: false,
  },
};

export default config;
