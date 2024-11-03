import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error from "./components/Error.tsx";
import Centeral from "./Centeral.tsx";
import "./index.css";
import LandingPage from "./LandingPage.tsx";

const router = createBrowserRouter([
  {
    element: <Centeral />,
    errorElement: <Error />,
    path: "/videocall",
  },
  {
    element: <LandingPage />,
    errorElement: <Error />,
    path: "/",
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
