/**
 * Jobs endpoints.
 */

import apiClient from "./client";

export async function listJobs(params = {}) {
  const { data } = await apiClient.get("/jobs/", { params });
  return data;
}

export async function getJob(slug) {
  const { data } = await apiClient.get(`/jobs/${slug}/`);
  return data;
}

export async function createJob(payload) {
  const { data } = await apiClient.post("/jobs/", payload);
  return data;
}

export async function updateJob(slug, payload) {
  const { data } = await apiClient.patch(`/jobs/${slug}/`, payload);
  return data;
}

export async function deleteJob(slug) {
  await apiClient.delete(`/jobs/${slug}/`);
}

export async function listMyJobs(params = {}) {
  const { data } = await apiClient.get("/jobs/my/", { params });
  return data;
}