import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ProviderShell } from "@/components/layout/ProviderShell";
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
    default: "LockA Provider Portal",
    template: "%s · LockA Provider Portal",
  },
  description:
    "Request patient-approved access to medical records, issue verified records, and check that a document matches what was issued.",
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
          <ProviderShell>{children}</ProviderShell>
        </WalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
