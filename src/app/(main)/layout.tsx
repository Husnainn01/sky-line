'use client';

import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} ${outfit.variable}`}>
      <Navbar />
      <div className="page-shell">
        <main>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
