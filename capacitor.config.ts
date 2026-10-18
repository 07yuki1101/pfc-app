import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.apptaro.pfc",
  appName: "PFC Log",
  // Unused at runtime: the app opens the live Vercel site below (same approach as トラ管),
  // so web updates ship without resubmitting the iOS app.
  webDir: "public",
  server: {
    url: "https://pfc-app-alpha.vercel.app",
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com"],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0a0a",
      showSpinner: false,
    },
  },
};

export default config;
