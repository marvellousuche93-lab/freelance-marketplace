/**
 * ProfileEditRouter — pick the profile editor based on the user's role.
 *
 * Mounted at /dashboard/profile/edit for both roles.
 */

import { useAuth } from "../../context/AuthContext";
import EditProfilePage from "../freelancer/EditProfilePage";
import EditEmployerProfilePage from "../employer/EditEmployerProfilePage";

export default function ProfileEditRouter() {
  const { user } = useAuth();
  if (user?.role === "EMPLOYER") return <EditEmployerProfilePage />;
  return <EditProfilePage />;
}