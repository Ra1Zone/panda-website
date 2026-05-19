"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
        <Sonner />
      </I18nProvider>
    </ThemeProvider>
  );
}
