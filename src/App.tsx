
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SurveyEditor from "./pages/SurveyEditor";
import SurveyResults from "./pages/SurveyResults";
import SurveyPreview from "./pages/SurveyPreview";
import SurveyResponse from "./pages/SurveyResponse";
import SurveyAnalytics from "./pages/SurveyAnalytics";
import SurveyDashboard from "./pages/SurveyDashboard";
import PublicSurvey from "./pages/PublicSurvey";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Index />} />
          <Route path="/editor/:id" element={<SurveyEditor />} />
          <Route path="/results/:id" element={<SurveyResults />} />
          <Route path="/analytics/:id" element={<SurveyAnalytics />} />
          <Route path="/dashboard/:id" element={<SurveyDashboard />} />
          <Route path="/preview/:id" element={<SurveyPreview />} />
          <Route path="/respond/:id" element={<SurveyResponse />} />
          <Route path="/survey/:id" element={<PublicSurvey />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
