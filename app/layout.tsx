import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { SplashScreen } from "@/components/SplashScreen";
import { MaintenanceGate } from "@/components/MaintenanceGate";

const siteUrl = "https://miva-memes.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "MIVA Memes — Say it anonymously",
  description: "A private anonymous message box for the MIVA community. Say it. No names. No pressure.",
  manifest: "/manifest.webmanifest",
  applicationName: "MIVA Memes",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MIVA Memes" },
  icons: { icon: "/miva-icon.svg", apple: "/miva-icon.svg" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MIVA Memes",
    title: "MIVA Memes — Say it. No names.",
    description: "Got a confession, a funny thought or a meme? Drop it here. Keep it anonymous.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MIVA Memes — Say it. No names. No pressure." }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MIVA Memes — Say it. No names.",
    description: "A private anonymous message box for the MIVA community.",
    images: ["/opengraph-image"]
  },
  themeColor: "#061a38"
};

export const viewport: Viewport = { themeColor: "#061a38", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><PWARegister/><SplashScreen/><MaintenanceGate/>{children}</body></html>;
}
