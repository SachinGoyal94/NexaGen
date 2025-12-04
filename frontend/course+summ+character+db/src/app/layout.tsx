import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexagen Development Console",
  description:
    "A modern Next.js application engineered by the Nexagen Team using TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: [
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "React",
    "Nexagen Project",
  ],
  authors: [{ name: "Nexagen Team" }],

  openGraph: {
    title: "Nexagen Dev Platform",
    description:
      "A React-based development interface crafted by the Nexagen engineering team.",
    url: "https://nexagen-project.local",
    siteName: "Nexagen",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nexagen Dev Platform",
    description:
      "A modern engineering interface built using the React ecosystem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
