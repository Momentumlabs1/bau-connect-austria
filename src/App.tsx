import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationToast } from "@/components/notifications/NotificationToast";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/stores/authStore";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import ContractorOnboarding from "./pages/ContractorOnboarding";
import CreateProject from "./pages/CreateProject";
import ContractorProfile from "./pages/ContractorProfile";
import ContractorProfileEdit from "./pages/ContractorProfileEdit";
import ContractorProjects from "./pages/ContractorProjects";
import ContractorProjectDetail from "./pages/ContractorProjectDetail";
import ContractorOrders from "./pages/ContractorOrders";
import CustomerProjectDetail from "./pages/CustomerProjectDetail";
import CustomerContractorSearch from "./pages/CustomerContractorSearch";
import CustomerMyProjects from "./pages/CustomerMyProjects";
import ContractorTransactions from "./pages/ContractorTransactions";
import Messages from "./pages/Messages";
import PublicContractorProfile from "./pages/PublicContractorProfile";
import Notifications from "./pages/Notifications";
import PaymentSuccess from "./pages/PaymentSuccess";
import WalletSuccess from "./pages/WalletSuccess";
import SeedDemo from "./pages/SeedDemo";
import SeedContractors from "./pages/SeedContractors";
import NotFound from "./pages/NotFound";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Widerruf from "./pages/Widerruf";
import HandwerkerDirectory from "./pages/HandwerkerDirectory";
import EmailConfirmation from "./pages/EmailConfirmation";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { CookieBanner } from "@/components/CookieBanner";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, initialized } = useAuth();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <CookieBanner />
      <BrowserRouter>
        {initialized && user && <NotificationToast />}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/passwort-vergessen" element={<ForgotPassword />} />
          <Route path="/passwort-zuruecksetzen" element={<ResetPassword />} />
          <Route path="/email-bestaetigung" element={<EmailConfirmation />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/kunde/dashboard" element={<CustomerDashboard />} />
          <Route path="/kunde/projekt-erstellen" element={<CreateProject />} />
          <Route path="/kunde/projekt/:id" element={<CustomerProjectDetail />} />
          <Route path="/kunde/meine-auftraege" element={<CustomerMyProjects />} />
          <Route path="/kunde/handwerker-suchen" element={<CustomerContractorSearch />} />
          <Route path="/handwerker/dashboard" element={<ContractorDashboard />} />
          <Route path="/handwerker/onboarding" element={<ContractorOnboarding />} />
          <Route path="/handwerker/profil-erstellen" element={<ContractorProfile />} />
          <Route path="/handwerker/profil-bearbeiten" element={<ContractorProfileEdit />} />
          <Route path="/handwerker/transaktionen" element={<ContractorTransactions />} />
          <Route path="/handwerker/projekte" element={<ContractorProjects />} />
          <Route path="/handwerker/auftraege" element={<ContractorOrders />} />
          <Route path="/handwerker/projekt/:id" element={<ContractorProjectDetail />} />
          <Route path="/handwerker/:id" element={<PublicContractorProfile />} />
          <Route path="/nachrichten" element={<Messages />} />
          <Route path="/benachrichtigungen" element={<Notifications />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/wallet-success" element={<WalletSuccess />} />
          <Route path="/seed-demo" element={<SeedDemo />} />
          <Route path="/seed-contractors" element={<SeedContractors />} />
          <Route path="/handwerker-verzeichnis" element={<HandwerkerDirectory />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/widerruf" element={<Widerruf />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Fallback redirects for old/legacy links */}
          <Route path="/auftrag-erstellen" element={<Navigate to="/kunde/projekt-erstellen" replace />} />
          <Route path="/projekt-erstellen" element={<Navigate to="/kunde/projekt-erstellen" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
