/**
 * Portfolio endpoints.
 */

import apiClient from "./client";

export async function listPortfolios(params = {}) {
  const { data } = await apiClient.get("/portfolios/", { params });
  return data;
}

export async function getPortfolio(slug) {
  const { data } = await apiClient.get(`/portfolios/${slug}/`);
  return data;
}

export async function listMyPortfolios(params = {}) {
  const { data } = await apiClient.get("/portfolios/my/", { params });
  return data;
}

export async function createPortfolio(payload) {
  const { data } = await apiClient.post("/portfolios/", payload);
  return data;
}

export async function updatePortfolio(slug, payload) {
  const { data } = await apiClient.patch(`/portfolios/${slug}/`, payload);
  return data;
}

export async function deletePortfolio(slug) {
  await apiClient.delete(`/portfolios/${slug}/`);
}

// Gallery images
export async function listPortfolioImages(slug) {
  const { data } = await apiClient.get(`/portfolios/${slug}/images/`);
  return data;
}

export async function addPortfolioImage(slug, { image, caption, order }) {
  const form = new FormData();
  form.append("image", image);
  if (caption) form.append("caption", caption);
  if (order != null) form.append("order", String(order));
  const { data } = await apiClient.post(
    `/portfolios/${slug}/images/`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deletePortfolioImage(slug, imageId) {
  await apiClient.delete(`/portfolios/${slug}/images/${imageId}/`);
}