import type { Metadata } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "MIVA Memes — Say it anonymously",
  description: "A private anonymous message box for the MIVA group.",
  manifest: "/manifest.webmanifest",
  applicationName: "MIVA Memes",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MIVA Memes" },
  icons: { icon: "/miva-icon.svg", apple: "/miva-icon.svg" },
  themeColor: "#061a38"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><PWARegister />{children}</body></html>;
}
