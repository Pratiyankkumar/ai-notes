"use client";
import { Inter } from "next/font/google";
import "@workspace/ui/globals.css";
import { MainLayout } from "@/components/main-lauout";
import type React from "react"; // Added import for React
import InputWithActions from "@/components/input";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
        <InputWithActions />
      </body>
    </html>
  );
}
