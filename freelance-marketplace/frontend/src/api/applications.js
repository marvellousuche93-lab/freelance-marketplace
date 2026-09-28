/**
 * Applications endpoints.
 */

import apiClient from "./client";

export async function applyToJob(payload) {
  const { data } = await apiClient.post("/applications/", payload);
  return data;
}

export async function listApplications(params = {}) {
  const { data } = await apiClient.get("/applications/", { params });
  return data;
}

export async function listMyApplications(params = {}) {
  const { data } = await apiClient.get("/applications/my/", { params });
  return data;
}

export async function listReceivedApplications(params = {}) {
  const { data } = await apiClient.get("/applications/received/", { params });
  return data;
}

export async function getApplication(id) {
  const { data } = await apiClient.get(`/applications/${id}/`);
  return data;
}

export async function acceptApplication(id) {
  const { data } = await apiClient.post(`/applications/${id}/accept/`);
  return data;
}

export async function rejectApplication(id) {
  const { data } = await apiClient.post(`/applications/${id}/reject/`);
  return data;
}

export async function withdrawApplication(id) {
  const { data } = await apiClient.post(`/applications/${id}/withdraw/`);
  return data;
}