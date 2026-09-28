/**
 * API functions for the auth-completion flows:
 *   - change email (request + confirm)
 *   - change password
 *   - password reset (request + confirm)
 *
 * All requests go through the shared apiClient, so JWT is attached
 * automatically where needed and refresh-on-401 is handled.
 */

import apiClient from "./client";

export async function requestEmailChange({ newEmail, password }) {
  const { data } = await apiClient.post("/auth/change-email/", {
    new_email: newEmail,
    password,
  });
  return data;
}

export async function confirmEmailChange(token) {
  const { data } = await apiClient.post("/auth/change-email/confirm/", { token });
  return data;
}

export async function changePassword({
  currentPassword,
  newPassword,
  newPasswordConfirm,
}) {
  const { data } = await apiClient.post("/auth/change-password/", {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirm: newPasswordConfirm,
  });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await apiClient.post("/auth/password-reset/", { email });
  return data;
}

export async function confirmPasswordReset({
  token,
  newPassword,
  newPasswordConfirm,
}) {
  const { data } = await apiClient.post("/auth/password-reset/confirm/", {
    token,
    new_password: newPassword,
    new_password_confirm: newPasswordConfirm,
  });
  return data;
}