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

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const router = createBrowserRouter([
    {
      path: "/log-in",
      element: <Login />,
    },
    {
      path: "/sign-up",
      element: <SignUp />,
    },
    {
      path: "/",
      element: (
        <Dashboard
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
        />
      ),
    },
    {
      path: "/analytics",
      element: <PlaceholderPage title="Analytics" />,
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
      element: <PlaceholderPage title="Chatbot" />,
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
