import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ArticlePage from "./pages/ArticlePage";
import BlogPage from "./pages/BlogPage";
import ProjectsPage from "./pages/ProjectsPage";
import EntreprisesPage from "./pages/EntreprisesPage.tsx";
import { Footer } from "@/components/Footer";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/projets" element={<ProjectsPage />} />
          <Route path="/annuaire" element={<EntreprisesPage />} />
          <Route path="/entreprises" element={<Navigate to="/annuaire" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
