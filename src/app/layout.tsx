import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "PFC Manager",
  description: "ボディメイクのためのPFC管理アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#18181b",
                color: "#f4f4f5",
                border: "1px solid #3f3f46",
                borderRadius: "12px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
