/**
 * Categories and skills endpoints.
 */

import apiClient from "./client";

export async function listCategories(params = {}) {
  const { data } = await apiClient.get("/categories/", { params });
  return data;
}

export async function getCategory(slug) {
  const { data } = await apiClient.get(`/categories/${slug}/`);
  return data;
}

export async function listSkills(params = {}) {
  const { data } = await apiClient.get("/skills/", { params });
  return data;
}

export async function getSkill(slug) {
  const { data } = await apiClient.get(`/skills/${slug}/`);
  return data;
}