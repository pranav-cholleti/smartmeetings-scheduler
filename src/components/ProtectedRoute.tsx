
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/spinner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show a dev mode alert if using the preview credentials
  const isDevMode = user?.email === 'dev@example.com';

  return (
    <>
      {isDevMode && (
        <Alert variant="warning" className="mb-4 border-amber-500">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            You are in preview mode. This allows you to explore the application without real authentication.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
