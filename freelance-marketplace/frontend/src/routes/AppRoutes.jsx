/**
 * AppRoutes — top-level route tree.
 */

import { Route, Routes } from "react-router-dom";

import PublicLayout from "../components/layout/PublicLayout";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Public
import HomePage from "../pages/public/HomePage";
import JobsPage from "../pages/public/JobsPage";
import JobDetailPage from "../pages/public/JobDetailPage";
import FreelancersPage from "../pages/public/FreelancersPage";
import FreelancerDetailPage from "../pages/public/FreelancerDetailPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import FaqPage from "../pages/public/FaqPage";
import TermsPage from "../pages/public/TermsPage";
import PrivacyPage from "../pages/public/PrivacyPage";
import NotFoundPage from "../pages/public/NotFoundPage";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";

// Freelancer pages
import FreelancerDashboardPage from "../pages/freelancer/FreelancerDashboardPage";
import MyApplicationsPage from "../pages/freelancer/MyApplicationsPage";
import SavedJobsPage from "../pages/freelancer/SavedJobsPage";
import PortfolioPage from "../pages/freelancer/PortfolioPage";
import PortfolioCreatePage from "../pages/freelancer/PortfolioCreatePage";
import PortfolioEditPage from "../pages/freelancer/PortfolioEditPage";

// Employer pages
import EmployerDashboardPage from "../pages/employer/EmployerDashboardPage";
import MyJobsPage from "../pages/employer/MyJobsPage";
import PostJobPage from "../pages/employer/PostJobPage";
import EditJobPage from "../pages/employer/EditJobPage";
import ReceivedApplicationsPage from "../pages/employer/ReceivedApplicationsPage";

// Shared pages
import MyProfileRouter from "../pages/shared/MyProfileRouter";
import ProfileEditRouter from "../pages/shared/ProfileEditRouter";
import MessagesPage from "../pages/shared/MessagesPage";
import NotificationsPage from "../pages/shared/NotificationsPage";
import LoadersDemoPage from "../pages/shared/LoadersDemoPage";
import DashboardLoaderPage from "../pages/shared/DashboardLoaderPage";
import SettingsPage from "../pages/shared/SettingsPage";
import { useAuth } from "../context/AuthContext";

function DashboardHome() {
  const { user } = useAuth();
  if (user?.role === "EMPLOYER") return <EmployerDashboardPage />;
  return <FreelancerDashboardPage />;
}

function ApplicationsPage() {
  const { user } = useAuth();
  if (user?.role === "EMPLOYER") return <ReceivedApplicationsPage />;
  return <MyApplicationsPage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:slug" element={<JobDetailPage />} />
        <Route path="freelancers" element={<FreelancersPage />} />
        <Route path="freelancers/:username" element={<FreelancerDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
      </Route>

      {/* Dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<MyProfileRouter />} />
          <Route path="profile/edit" element={<ProfileEditRouter />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="loaders" element={<LoadersDemoPage />} />
          <Route path="branded-loader" element={<DashboardLoaderPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="saved-jobs" element={<SavedJobsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/new" element={<PortfolioCreatePage />} />
          <Route path="portfolio/:slug/edit" element={<PortfolioEditPage />} />

          <Route path="jobs" element={<MyJobsPage />} />
          <Route path="jobs/new" element={<PostJobPage />} />
          <Route path="jobs/:slug/edit" element={<EditJobPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}