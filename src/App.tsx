import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Hosts from "./pages/Hosts";
import Booking from "./pages/Booking";
import CalendarPage from "./pages/CalendarPage";
import Promotion from "./pages/Promotion";
import PromotionDetail from "./pages/PromotionDetail";
import Tips from "./pages/Tips";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/hosts" element={<Hosts />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/promotion/:id" element={<PromotionDetail />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
