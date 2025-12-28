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
import BookingReviewPage from "@/pages/booking/BookingReviewPage";
import RecurringBookingReviewPage from "@/pages/booking/RecurringBookingReviewPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmail";
import { TermsPage } from "@/pages/legal/TermsPage";
import { PrivacyPage } from "@/pages/legal/PrivacyPage";

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
        path: "booking-review/:id",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <BookingReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "booking-review/recurring/:id",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <RecurringBookingReviewPage />
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
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
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
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
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
