/**
 * Freelancer/employer profile endpoints (self) and public profiles.
 *
 * The "self" endpoints require an access token and only return/update
 * the authenticated user's own profile. The public endpoints are for
 * browsing freelancers and employers.
 */

import apiClient from "./client";

// ------------------------------------------------------------------
// Self (freelancer)
// ------------------------------------------------------------------
export async function getMyFreelancerProfile() {
  const { data } = await apiClient.get("/auth/me/freelancer-profile/");
  return data;
}

export async function updateMyFreelancerProfile(payload) {
  const { data } = await apiClient.patch(
    "/auth/me/freelancer-profile/",
    payload
  );
  return data;
}

// ------------------------------------------------------------------
// Self (employer)
// ------------------------------------------------------------------
export async function getMyEmployerProfile() {
  const { data } = await apiClient.get("/auth/me/employer-profile/");
  return data;
}

export async function updateMyEmployerProfile(payload) {
  const { data } = await apiClient.patch("/auth/me/employer-profile/", payload);
  return data;
}

// ------------------------------------------------------------------
// Public listings
// ------------------------------------------------------------------
export async function listFreelancers(params = {}) {
  const { data } = await apiClient.get("/auth/freelancers/", { params });
  return data;
}

export async function getFreelancer(id) {
  const { data } = await apiClient.get(`/auth/freelancers/${id}/`);
  return data;
}

export async function listEmployers(params = {}) {
  const { data } = await apiClient.get("/auth/employers/", { params });
  return data;
}

export async function getEmployer(id) {
  const { data } = await apiClient.get(`/auth/employers/${id}/`);
  return data;
}