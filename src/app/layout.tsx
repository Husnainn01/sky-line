'use client';

import { Inter, Outfit } from "next/font/google";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedVehiclesProvider } from "@/contexts/SavedVehiclesContext";
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
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} overflow-x-hidden w-full`}>
        <AuthProvider>
          <SavedVehiclesProvider>
            {!hideHeaderFooter && <Navbar />}
            <div className={`${!hideHeaderFooter ? "page-shell" : ""} w-full overflow-x-hidden`}>
              <main className="w-full max-w-[100vw] overflow-x-hidden">
                {children}
              </main>
            </div>
            {!hideHeaderFooter && <Footer />}
          </SavedVehiclesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
