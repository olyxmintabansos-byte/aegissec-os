import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AegisProvider } from "@/context/AegisContext";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AegisSec OS — Cyber Defense & SOC Threat Matrix",
  description: "Enterprise SIEM Incident Response, WAF Engine & MITRE ATT&CK Matrix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#030712] text-slate-100`}>
        <AegisProvider>
          <Navbar />
          {children}
        </AegisProvider>
      </body>
    </html>
  );
}
