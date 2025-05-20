
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MediaProvider } from "./context/MediaContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SeriesPage from "./pages/SeriesPage";
import MoviesPage from "./pages/MoviesPage";
import AnimePage from "./pages/AnimePage";
import StatsPage from "./pages/StatsPage";
import MediaDetail from "./pages/MediaDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MediaProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/media/:id" element={<MediaDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MediaProvider>
  </QueryClientProvider>
);

export default App;
