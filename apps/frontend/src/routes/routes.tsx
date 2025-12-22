import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
// import { SearchPage } from "./pages/player/SearchPage";
// import { ComplexDetailPage as PlayerComplexDetailPage } from "./pages/player/ComplexDetailPage";
import { OwnerDashboardPage } from "@/pages/owner/DashboardPage";
import { ComplexesPage } from "@/pages/owner/ComplexPage";
// import { ComplexDetailPage as OwnerComplexDetailPage } from "./pages/owner/ComplexDetailPage";
// import { AdminDashboardPage } from "./pages/admin/DashboardPage";
// import { ComplexVerificationPage } from "./pages/admin/ComplexVerificationPage";
// import { UsersPage } from "./pages/admin/UsersPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ComplexDetailPage } from "@/pages/owner/ComplexDetailPage";
import { SubFieldDetailPage } from "@/pages/owner/SubFieldDetailPage";
import { AboutPage } from "@/pages/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      //     {
      //       path: "search",
      //       element: <SearchPage />,
      //     },
      //     {
      //       path: "complex/:id",
      //       element: <PlayerComplexDetailPage />,
      //     },
      {
        path: "about",
        element: <AboutPage />,
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
