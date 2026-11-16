import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIVA Memes — Say it anonymously",
  description: "A private anonymous message box for the MIVA group."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
