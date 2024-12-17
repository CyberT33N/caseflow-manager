// Theme und UI Komponenten Imports
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// React Query für Datenmanagement
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Routing Komponenten
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Seiten Import
import Index from "./pages/Index";

// Erstelle eine neue Query Client Instanz für React Query
const queryClient = new QueryClient();

// Haupt App Komponente
const App = () => (
  // Theme Provider: Verwaltet das Farbschema der App (hell/dunkel)
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    {/* Query Client Provider: Ermöglicht Datenabrufe und Caching in der gesamten App */}
    <QueryClientProvider client={queryClient}>
      {/* Tooltip Provider: Stellt Tooltip-Funktionalität bereit */}
      <TooltipProvider>
        {/* Toast Benachrichtigungskomponente für Feedback */}
        <Sonner />
        {/* Router Setup für Seitennavigation */}
        <BrowserRouter>
          <Routes>
            {/* Definiere die Hauptroute "/" */}
            <Route path="/" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;