/**
 * Central API mocks for tests. Tests stub these; nothing hits the network.
 */

import { vi } from "vitest";

export const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
  updateMe: vi.fn(),
  logout: vi.fn(),

  listJobs: vi.fn(),
  getJob: vi.fn(),
  createJob: vi.fn(),
  updateJob: vi.fn(),
  deleteJob: vi.fn(),
  listMyJobs: vi.fn(),

  listCategories: vi.fn(),
  listSkills: vi.fn(),

  applyToJob: vi.fn(),
  listMyApplications: vi.fn(),
  listReceivedApplications: vi.fn(),
  acceptApplication: vi.fn(),
  rejectApplication: vi.fn(),
  withdrawApplication: vi.fn(),

  addBookmark: vi.fn(),
  removeBookmark: vi.fn(),
  listBookmarks: vi.fn(),
  checkBookmark: vi.fn(),

  listNotifications: vi.fn(),
  unreadCount: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  clearRead: vi.fn(),

  getMyFreelancerProfile: vi.fn(),
  updateMyFreelancerProfile: vi.fn(),
  getMyEmployerProfile: vi.fn(),
  updateMyEmployerProfile: vi.fn(),
  listFreelancers: vi.fn(),
  listEmployers: vi.fn(),

  listConversations: vi.fn(),
  getConversation: vi.fn(),
  startConversation: vi.fn(),
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
};

export function resetMockApi() {
  for (const key of Object.keys(mockApi)) {
    if (mockApi[key].mockReset) mockApi[key].mockReset();
  }
}