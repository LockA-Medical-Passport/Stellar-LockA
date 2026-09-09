import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PatientShell } from "@/components/layout/PatientShell";
import { Toaster } from "@/components/ui/Toast";
import { WalletProvider } from "@/features/wallet/WalletContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LockA Medical Passport",
    template: "%s · LockA Medical Passport",
  },
  description:
    "Your patient-controlled medical passport: hold verified health records, decide who can read them, and revoke access at any time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <WalletProvider>
          <PatientShell>{children}</PatientShell>
        </WalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
