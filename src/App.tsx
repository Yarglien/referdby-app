import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SupabaseProvider } from '@/components/providers/SupabaseProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { UserProvider } from '@/contexts/UserContext';
import { ViewModeProvider } from '@/contexts/ViewModeContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '@/routes';
import DirectSignup from '@/pages/DirectSignup';
import ReferralAuth from '@/pages/ReferralAuth';
import { useCapacitorInit } from '@/hooks/useCapacitorInit';
import '@/i18n';

// Create a client
const queryClient = new QueryClient();

function App() {
  // Initialize Capacitor plugins (StatusBar for iOS safe area)
  useCapacitorInit();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <SupabaseProvider>
            <Routes>
              {/* Routes outside auth system */}
              <Route path="/direct-signup" element={<DirectSignup />} />
              <Route path="/referral-auth" element={<ReferralAuth />} />
              
              {/* All other routes with auth system */}
              <Route path="/*" element={
                <AuthProvider>
                  <UserProvider>
                    <I18nProvider>
                      <ViewModeProvider>
                        <AppRoutes />
                      </ViewModeProvider>
                    </I18nProvider>
                  </UserProvider>
                </AuthProvider>
              } />
            </Routes>
            <Toaster />
            <Sonner />
          </SupabaseProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;