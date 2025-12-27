import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "vanilla-cookieconsent/dist/cookieconsent.css";

// Import the existing ClientLayout component
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Skyline TRD - Japanese Car Exports',
  description: 'Skyline TRD - Your trusted partner for importing quality Japanese vehicles worldwide',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} overflow-x-hidden w-full`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
