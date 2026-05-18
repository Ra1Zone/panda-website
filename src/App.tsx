import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/I18nProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { AuthProvider } from "@/admin/auth/AuthContext";
import { ProtectedRoute } from "@/admin/auth/ProtectedRoute";
import { AdminLayout } from "@/admin/layout/AdminLayout";

// Public pages
import Index from "./pages/Index.tsx";
import Services from "./pages/Services.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

// Admin pages
import Login from "./admin/pages/Login.tsx";
import Dashboard from "./admin/pages/Dashboard.tsx";
import HomeEditor from "./admin/pages/HomeEditor.tsx";
import ServicesManager from "./admin/pages/ServicesManager.tsx";
import PortfolioManager from "./admin/pages/PortfolioManager.tsx";
import AboutEditor from "./admin/pages/AboutEditor.tsx";
import TestimonialsManager from "./admin/pages/TestimonialsManager.tsx";
import BrandsManager from "./admin/pages/BrandsManager.tsx";
import ContactSubmissions from "./admin/pages/ContactSubmissions.tsx";
import SettingsPage from "./admin/pages/SettingsPage.tsx";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* ── Public routes ── */}
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/:slug" element={<ProjectDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* ── Admin routes ── */}
                <Route path="/admin/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="home" element={<HomeEditor />} />
                  <Route path="services" element={<ServicesManager />} />
                  <Route path="portfolio" element={<PortfolioManager />} />
                  <Route path="about" element={<AboutEditor />} />
                  <Route path="testimonials" element={<TestimonialsManager />} />
                  <Route path="brands" element={<BrandsManager />} />
                  <Route path="contact" element={<ContactSubmissions />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
