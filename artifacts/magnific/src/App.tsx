import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { OnboardingPage } from '@/pages/onboarding';
import { SearchPage } from '@/pages/search';
import { ProductPage } from '@/pages/product';
import { ScanResultPage } from '@/pages/scan-result';
import { Navbar } from '@/components/navbar';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/search">
        {(params) => {
          const searchParams = new URLSearchParams(window.location.search);
          return <SearchPage query={searchParams.get('q') || undefined} />;
        }}
      </Route>
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/scan-result" component={ScanResultPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Navbar />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
