'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { SavedVehiclesProvider } from "@/contexts/SavedVehiclesContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { initCookieConsent } from "@/utils/cookieConsent";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const hideHeaderFooter = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard') || false;
  
  // Initialize cookie consent
  useEffect(() => {
    initCookieConsent();
  }, []);

  return (
    <AuthProvider>
      <SavedVehiclesProvider>
        <TranslationProvider>
          {!hideHeaderFooter && <Navbar />}
          <div className={`${!hideHeaderFooter ? "page-shell" : ""} w-full overflow-x-hidden`}>
            <main className="w-full max-w-[100vw] overflow-x-hidden">
              {children}
            </main>
          </div>
          {!hideHeaderFooter && <Footer />}
        </TranslationProvider>
      </SavedVehiclesProvider>
    </AuthProvider>
  );
}
