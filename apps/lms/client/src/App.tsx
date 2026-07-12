import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CourseViewer from "@/pages/course-viewer";
import ResumeBuilder from "@/pages/resume-builder";
import AdminDashboard from "@/pages/admin-dashboard";
import Payment from "@/pages/payment";
import BulkAdmin from "@/pages/bulk-admin";
import CareerSuccessHub from "@/pages/career-success-hub";
import AIWorkplace from "@/pages/ai-workplace";
import JobSearch from "@/pages/job-search";
import InterviewMastery from "@/pages/interview-mastery";
import { ErrorBoundary } from "@/components/ui/error-boundary";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/course/:courseId" component={CourseViewer} />
          <Route path="/resume-builder" component={ResumeBuilder} />
          <Route path="/payment" component={Payment} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/bulk" component={BulkAdmin} />
          <Route path="/career/career-success-hub" component={CareerSuccessHub} />
          <Route path="/career/ai-workplace" component={AIWorkplace} />
          <Route path="/career/job-search" component={JobSearch} />
          <Route path="/career/interview-mastery" component={InterviewMastery} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
