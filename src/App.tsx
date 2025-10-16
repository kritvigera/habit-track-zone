import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Todos from "./pages/Todos";
import Water from "./pages/Water";
import Pomodoro from "./pages/Pomodoro";
import Habits from "./pages/Habits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/water" element={<Water />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/habits" element={<Habits />} />
            {/* Placeholder routes for other sections */}
            <Route path="/schedule" element={<Dashboard />} />
            <Route path="/journal" element={<Dashboard />} />
            <Route path="/workouts" element={<Dashboard />} />
            <Route path="/nutrition" element={<Dashboard />} />
            <Route path="/sleep" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
