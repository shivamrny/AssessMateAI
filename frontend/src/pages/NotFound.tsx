import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">

      <div className="max-w-md w-full text-center bg-card border border-border rounded-xl p-10 shadow-lg">

        <div className="flex justify-center mb-4">
          <AlertTriangle size={48} className="text-destructive" />
        </div>

        <h1 className="text-5xl font-bold mb-2">404</h1>

        <p className="text-lg font-medium mb-2">
          Page Not Found
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md border border-border text-sm hover:bg-secondary transition"
          >
            Go Back
          </button>

          <Link
            to="/"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Return Home
          </Link>

        </div>

      </div>

    </div>
  );
};

export default NotFound;