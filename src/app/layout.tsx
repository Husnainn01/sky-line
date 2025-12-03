'use client';

import { Inter, Outfit } from "next/font/google";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || false;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        {!hideHeaderFooter && <Navbar />}
        <div className={!hideHeaderFooter ? "page-shell" : ""}>
          <main>
            {children}
          </main>
        </div>
        {!hideHeaderFooter && <Footer />}
      </body>
    </html>
  );
}
