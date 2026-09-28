/**
 * Notifications endpoints.
 */

import apiClient from "./client";

export async function listNotifications(params = {}) {
  const { data } = await apiClient.get("/notifications/", { params });
  return data;
}

export async function unreadCount() {
  const { data } = await apiClient.get("/notifications/unread_count/");
  return data.unread_count;
}

export async function getNotification(id) {
  const { data } = await apiClient.get(`/notifications/${id}/`);
  return data;
}

export async function markRead(id) {
  const { data } = await apiClient.post(`/notifications/${id}/read/`);
  return data;
}

export async function markAllRead() {
  const { data } = await apiClient.post("/notifications/read_all/");
  return data;
}

export async function deleteNotification(id) {
  await apiClient.delete(`/notifications/${id}/`);
}

export async function clearRead() {
  const { data } = await apiClient.delete("/notifications/clear/");
  return data;
}