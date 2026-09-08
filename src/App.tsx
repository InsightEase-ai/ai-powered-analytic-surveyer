import type { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./pages/login";
import SignUp from "./pages/sign-up";
import Dashboard from "./pages/dashBoard";
import PlaceholderPage from "./pages/placeholderPage";
import CreateSurvey from "./pages/createSurvey";
import PublicTakeSurvey from "./pages/publicTakeSurvey";
import SurveyManage from "./pages/surveyManage";
import AnalyticsPage from "./pages/analyticsPage";
import ChatbotPage from "./pages/chatbotPage";

function AuthLoading() {
  return (
    <p style={{ fontSize: "3rem", textAlign: "center" }}>Loading...</p>
  );
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/log-in",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/survey",
    element: <CreateSurvey />,
  },
  {
    path: "/survey/:slug",
    element: <PublicTakeSurvey />,
  },
  {
    path: "/surveys/:id",
    element: <SurveyManage />,
  },
  {
    path: "/report",
    element: <PlaceholderPage title="Reports" />,
  },
  {
    path: "/insights",
    element: <PlaceholderPage title="Insights" />,
  },
  {
    path: "/chatbot",
    element: <ChatbotPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
