import { BaseLayout } from "@/layouts/AdminLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { AboutPage } from "@/pages/AboutPage";
import AdminLoginPage from "@/pages/admin/auth/LoginPage";
import AdminSignupPage from "@/pages/admin/auth/SignupPage";
import AdminBookingsPage from "@/pages/admin/bookings/AdminBookingsPage";
import AdminComplexesPage from "@/pages/admin/complexes/AdminComplexesPage";
import Dashboard from "@/pages/admin/dashboard/Dashboard";
import AdminPaymentsPage from "@/pages/admin/payments/AdminPaymentsPage";
import AdminUsersPage from "@/pages/admin/users/AdminUsersPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmail";
import BookingPage from "@/pages/booking/BookingPage";
import BookingReviewPage from "@/pages/booking/BookingReviewPage";
import RecurringBookingReviewPage from "@/pages/booking/RecurringBookingReviewPage";
import { ContactPage } from "@/pages/ContactPage";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPage } from "@/pages/legal/PrivacyPage";
import { TermsPage } from "@/pages/legal/TermsPage";
import { MatchDetailPage } from "@/pages/matches/MatchDetailPage";
import { MatchListPage } from "@/pages/matches/MatchListPage";

import { ComplexDetailPage } from "@/pages/owner/ComplexDetailPage";
import { ComplexesPage } from "@/pages/owner/ComplexPage";
import { OwnerDashboardPage } from "@/pages/owner/DashboardPage";
import { OwnerBookingsPage } from "@/pages/owner/OwnerBookingsPage";
import { ProductManagementPage } from "@/pages/owner/ProductManagementPage";
import { SubFieldDetailPage } from "@/pages/owner/SubFieldDetailPage";
import { WalletPage } from "@/pages/owner/WalletPage";
import { PaymentFailedPage } from "@/pages/payment/PaymentFailedPage";
import { PaymentSuccessPage } from "@/pages/payment/PaymentSuccessPage";
import { PlayerBookingsPage } from "@/pages/player/BookingHistory";
import { MyMatchesPage } from "@/pages/player/MyMatchesPage";

import AdminPayoutsPage from "@/pages/admin/payments/AdminPayoutsPage";
import { PublicComplexDetailPage } from "@/pages/public/PublicComplexDetailPage";
import { PublicSubfieldDetailPage } from "@/pages/public/PublicSubfieldDetailPage";
import { SearchPage } from "@/pages/SearchPage";
import { StripeRefreshPage } from "@/pages/stripe/StripeRefreshPage";
import { StripeReturnPage } from "@/pages/stripe/StripeReturnPage";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { OwnerLayout } from "../layouts/OwnerLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ProtectedRoute } from "./ProtectedRoute";

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
        path: "matches",
        element: <MatchListPage />,
      },
      {
        path: "matches/:id",
        element: <MatchDetailPage />,
      },
      {
        path: "complexes/:id",
        element: <PublicComplexDetailPage />,
      },
      {
        path: "subfields/:id",
        element: <PublicSubfieldDetailPage />,
      },
      {
        path: "booking/:subfieldId",
        element: <BookingPage />,
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
        path: "player",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <Navigate to="/player/matches" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "player/matches",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <MyMatchesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "player/bookings",
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
        path: "bookings/success",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "bookings/failed",
        element: (
          <ProtectedRoute allowedRoles={["PLAYER"]}>
            <PaymentFailedPage />
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
        path: "verify-email/:token",
        element: <VerifyEmailPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/signup",
    element: <AdminSignupPage />,
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["OWNER"]}>
        <OwnerLayout />
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
      {
        path: "bookings",
        element: <OwnerBookingsPage />,
      },
      {
        path: "products",
        element: <ProductManagementPage />,
      },
      {
        path: "wallet",
        element: <WalletPage />,
      },
      {
        path: "stripe/return",
        element: <StripeReturnPage />,
      },
      {
        path: "stripe/refresh",
        element: <StripeRefreshPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <BaseLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "complexes",
        element: <AdminComplexesPage />,
      },
      {
        path: "bookings",
        element: <AdminBookingsPage />,
      },
      {
        path: "payments",
        element: <AdminPaymentsPage />,
      },
      {
        path: "payouts",
        element: <AdminPayoutsPage />,
      },
    ],
  },
]);
