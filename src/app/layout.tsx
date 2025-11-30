import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
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

export const metadata: Metadata = {
  title: "JDM Global - Premium Japanese Car Exports",
  description: "Your trusted partner in Japanese car exports. We specialize in sourcing and exporting premium JDM vehicles worldwide.",
  keywords: "JDM cars, Japanese car export, Toyota Supra, Nissan Skyline, Honda NSX, car export japan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Navbar />
        <div className="page-shell">
          <main>
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
