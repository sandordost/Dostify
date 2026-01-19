import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { GlobalStateProvider } from "@/components/global-state";
import PageBackground from "@/components/page-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const segoeUi = localFont({
  src: [
    {
      path: "../public/fonts/segoe-ui/segoeuithis.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/segoe-ui/segoeuithibd.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-segoe-ui",
});

export const metadata: Metadata = {
  title: "Dostify - Muziek",
  description: "Spotify, YTMusic, Radio en meer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${segoeUi}`}>
      <body className="h-full">
        <GlobalStateProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <PageBackground />
            <main className="h-full">
              {children}
            </main>
          </ThemeProvider>
        </GlobalStateProvider>
      </body>
    </html>
  );
}
