
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MeetingsPage from "./pages/MeetingsPage";
import MeetingDetailsPage from "./pages/MeetingDetailsPage";
import CreateMeetingPage from "./pages/CreateMeetingPage";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";

// New component
import { MeetingDashboard } from "./components/MeetingDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings/:meetingId" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingDetailsPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings/:meetingId/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/meetings/create" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateMeetingPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Root redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotFound />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
