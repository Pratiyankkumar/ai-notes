"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/globals.css";
import AppQueryProvider from "@/contexts/QueryClientProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <AppQueryProvider>{children}</AppQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
