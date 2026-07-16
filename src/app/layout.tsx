import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AfroStore — AI-Powered Ecommerce Builder for Africa",
  description:
    "Launch your online store in 5 minutes. AI-powered ecommerce, landing pages, and website builder designed for African businesses. Accept Monnify, Paystack, and Flutterwave payments.",
  keywords: [
    "ecommerce",
    "Africa",
    "online store",
    "AI",
    "website builder",
    "Ghana",
    "Paystack",
    "Flutterwave",
    "Monnify",
  ],
  openGraph: {
    title: "AfroStore — From Idea to Selling in 5 Minutes",
    description:
      "The simplest, fastest, most conversion-focused ecommerce platform for African businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
