import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Programs from "@/pages/programs";
import ProgramCNA from "@/pages/program-cna";
import ProgramIT from "@/pages/program-it";
import ProgramVIA from "@/pages/program-via";
import ProgramHousing from "@/pages/program-housing";
import About from "@/pages/about";
import Raffle from "@/pages/raffle";
import AdminRaffle from "@/pages/adminRaffle";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/programs" component={Programs} />
      <Route path="/programs/cna" component={ProgramCNA} />
      <Route path="/programs/it" component={ProgramIT} />
      <Route path="/programs/via" component={ProgramVIA} />
      <Route path="/programs/housing" component={ProgramHousing} />
      <Route path="/about" component={About} />
      <Route path="/raffle" component={Raffle} />
      <Route path="/admin/raffle" component={AdminRaffle} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
