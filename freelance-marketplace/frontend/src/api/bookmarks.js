/**
 * Bookmarks endpoints.
 */

import apiClient from "./client";

export async function addBookmark(jobId) {
  const { data } = await apiClient.post("/bookmarks/", { job: jobId });
  return data;
}

export async function removeBookmark(bookmarkId) {
  await apiClient.delete(`/bookmarks/${bookmarkId}/`);
}

export async function listBookmarks(params = {}) {
  const { data } = await apiClient.get("/bookmarks/", { params });
  return data;
}

export async function checkBookmark(jobId) {
  const { data } = await apiClient.get("/bookmarks/check/", {
    params: { job: jobId },
  });
  return data; // { bookmarked, bookmark_id }
}