import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { PublicComplexDetailPage } from "@/pages/public/PublicComplexDetailPage";
import { OwnerDashboardPage } from "@/pages/owner/DashboardPage";
import { ComplexesPage } from "@/pages/owner/ComplexPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ComplexDetailPage } from "@/pages/owner/ComplexDetailPage";
import { SubFieldDetailPage } from "@/pages/owner/SubFieldDetailPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { PlayerBookingsPage } from "@/pages/player/BookingPage";
import { SearchPage } from "@/pages/SearchPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "complexes/:id",
        element: <PublicComplexDetailPage />,
      },
      {
        path: "bookings",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <PlayerBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["OWNER"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OwnerDashboardPage />,
      },
      {
        path: "complexes",
        element: <ComplexesPage />,
      },
      {
        path: "complexes/:id",
        element: <ComplexDetailPage />,
      },
      {
        path: "sub-fields/:id",
        element: <SubFieldDetailPage />,
      },
    ],
  },
  // {
  //   path: "/admin",
  //   element: <DashboardLayout />,
  //   children: [
  //     {
  //       index: true,
  //       element: <AdminDashboardPage />,
  //     },
  //     {
  //       path: "complexes",
  //       element: <ComplexVerificationPage />,
  //     },
  //     {
  //       path: "users",
  //       element: <UsersPage />,
  //     },
  //   ],
  // },
]);
