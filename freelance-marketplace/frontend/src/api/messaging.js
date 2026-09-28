/**
 * Messaging endpoints.
 */

import apiClient from "./client";

export async function listConversations(params = {}) {
  const { data } = await apiClient.get("/conversations/", { params });
  return data;
}

export async function getConversation(id) {
  const { data } = await apiClient.get(`/conversations/${id}/`);
  return data;
}

export async function startConversation(userId) {
  // The backend is idempotent — calling this again returns the existing
  // conversation with the same two participants.
  const { data } = await apiClient.post("/conversations/", { user_id: userId });
  return data;
}

export async function listMessages(conversationId, params = {}) {
  const { data } = await apiClient.get(
    `/conversations/${conversationId}/messages/`,
    { params }
  );
  return data;
}

export async function sendMessage(conversationId, body) {
  const { data } = await apiClient.post(
    `/conversations/${conversationId}/messages/`,
    { body }
  );
  return data;
}

export async function markConversationRead(conversationId) {
  const { data } = await apiClient.post(
    `/conversations/${conversationId}/read/`
  );
  return data;
}