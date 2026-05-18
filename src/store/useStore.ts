import { useState, useEffect } from "react";
import { homeStore, servicesStore, portfolioStore, testimonialsStore, brandsStore } from "./dataStore";
import type { HomeContent, ServiceItem, PortfolioItem, Testimonial, Brand } from "./types";

function useStoreListen<T>(key: string, getter: () => T): T {
  const [value, setValue] = useState<T>(getter);

  useEffect(() => {
    const refresh = () => setValue(getter());
    const storageHandler = (e: StorageEvent) => {
      if (e.key === `panda_${key}` || e.key === null) refresh();
    };
    window.addEventListener(`panda-store-update-${key}` as keyof WindowEventMap, refresh as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(`panda-store-update-${key}` as keyof WindowEventMap, refresh as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, [key, getter]);

  return value;
}

export const useHomeContent = (): HomeContent => useStoreListen("home", homeStore.get);
export const useServices = (): ServiceItem[] => useStoreListen("services", servicesStore.getActive);
export const usePortfolio = (): PortfolioItem[] => useStoreListen("portfolio", portfolioStore.getActive);
export const useTestimonials = (): Testimonial[] => useStoreListen("testimonials", testimonialsStore.getActive);
export const useBrands = (): Brand[] => useStoreListen("brands", brandsStore.getActive);
