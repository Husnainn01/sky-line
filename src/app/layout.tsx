import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
