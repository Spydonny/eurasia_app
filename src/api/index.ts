import client, { getAccessToken } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  OrganizationRegisterRequest,
  PartnerRegisterRequest,
  TokenResponse,
  AuthUser,
  ProfileResponse,
  ProfileUpdateRequest,
  TokenBalance,
  TokenTransaction,
  ActivityItem,
  MissionWithProgress,
  ChatRoom,
  ChatMessage,
  MarketplaceItem,
  Purchase,
  Notification,
  Friend,
  FriendRequest,
  BlockedUser,
  PrivateDialog,
  PrivateMessage,
  UserAchievement,
  UserBadge,
  LeaderboardResponse,
  PrivacySettings,
  PrivacySettingsUpdate,
  Organization,
  OrganizationMember,
  CreateOrganizationRequest,
  Partner,
  CreatePartnerRequest,
  Reward,
  RewardRedemption,
  Dispute,
  DisputeComment,
  CreateDisputeRequest,
  Report,
  CreateReportRequest,
} from '@/types';

// Auth
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const r = await client.post<TokenResponse>('/auth/login', data);
  return r.data;
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  const r = await client.post<TokenResponse>('/auth/register', data);
  return r.data;
}

export async function registerOrganization(data: OrganizationRegisterRequest): Promise<TokenResponse> {
  const r = await client.post<TokenResponse>('/auth/register/organization', data);
  return r.data;
}

export async function registerPartner(data: PartnerRegisterRequest): Promise<TokenResponse> {
  const r = await client.post<TokenResponse>('/auth/register/partner', data);
  return r.data;
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  const r = await client.post<TokenResponse>('/auth/refresh', { refresh_token: token });
  return r.data;
}

export async function getMe(): Promise<AuthUser> {
  const r = await client.get<AuthUser>('/auth/me');
  return r.data;
}

// Profile
export async function getProfile(): Promise<ProfileResponse> {
  const r = await client.get<ProfileResponse>('/profile/');
  return r.data;
}

export async function updateProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
  const r = await client.patch<ProfileResponse>('/profile/', data);
  return r.data;
}

export async function getPublicProfile(userId: string): Promise<ProfileResponse> {
  const r = await client.get<ProfileResponse>(`/profile/public/${userId}`);
  return r.data;
}

export async function getProfileCompletion(): Promise<{ status: Record<string, boolean> }> {
  const r = await client.get('/profile/completion');
  return r.data;
}

export async function claimProfileRewards(): Promise<{ message: string; claimed: Record<string, unknown>[] }> {
  const r = await client.post('/profile/claim-rewards');
  return r.data;
}

// Tokens
export async function getTokenBalance(): Promise<TokenBalance> {
  const r = await client.get<TokenBalance>('/tokens/balance');
  return r.data;
}

export async function getTokenHistory(limit = 50): Promise<TokenTransaction[]> {
  const r = await client.get<TokenTransaction[]>('/tokens/history', { params: { limit } });
  return r.data;
}

// Activity
export async function getActivityFeed(limit = 20): Promise<ActivityItem[]> {
  const r = await client.get<ActivityItem[]>('/activity/feed', { params: { limit } });
  return r.data;
}

// Events
export async function listEvents(params?: {
  category?: string;
  status?: string;
  search?: string;
  created_by?: string;
  joined?: string;
  city?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}): Promise<import('@/types').EventListResponse> {
  const r = await client.get<import('@/types').EventListResponse>('/events/', { params });
  return r.data;
}

export async function createEvent(
  data: import('@/types').CreateEventRequest,
): Promise<import('@/types').Event> {
  const r = await client.post<import('@/types').Event>('/events/', data);
  return r.data;
}

export async function getEvent(eventId: string): Promise<import('@/types').Event> {
  const r = await client.get<import('@/types').Event>(`/events/${eventId}`);
  return r.data;
}

export async function updateEvent(
  eventId: string,
  data: Partial<import('@/types').CreateEventRequest>,
): Promise<import('@/types').Event> {
  const r = await client.patch<import('@/types').Event>(`/events/${eventId}`, data);
  return r.data;
}

export async function joinEvent(eventId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/events/${eventId}/join`);
  return r.data;
}

export async function leaveEvent(eventId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/events/${eventId}/leave`);
  return r.data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await client.delete(`/events/${eventId}`);
}

export async function publishEvent(eventId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/events/${eventId}/publish`);
  return r.data;
}

// Missions
export async function getMissions(): Promise<MissionWithProgress[]> {
  const r = await client.get<MissionWithProgress[]>('/missions/');
  return r.data;
}

export async function getMyMissionSubmissions(): Promise<{ items: import('@/types').MissionSubmission[]; total: number }> {
  const r = await client.get('/mission-submissions', { params: { limit: 100 } });
  return r.data;
}

export async function submitMissionProof(
  missionId: string,
  data: { description?: string; screenshot_url?: string; verification_method?: string },
): Promise<{ message: string; submission: import('@/types').MissionSubmission }> {
  const r = await client.post('/mission-submissions', { mission_id: missionId, ...data });
  return r.data;
}

export async function redeemMissionCode(missionId: string, code: string): Promise<{ message: string }> {
  const r = await client.post(`/missions/${missionId}/redeem-code`, { code });
  return r.data;
}

// Chat
export async function getChatRooms(): Promise<ChatRoom[]> {
  const r = await client.get<ChatRoom[]>('/chat/rooms');
  return r.data;
}

export async function getEventChatRoom(eventId: string): Promise<ChatRoom> {
  const r = await client.get<ChatRoom>(`/chat/rooms/${eventId}`);
  return r.data;
}

export async function getRoomMessages(roomId: string, limit = 50, skip = 0): Promise<ChatMessage[]> {
  const r = await client.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`, { params: { limit, skip } });
  return r.data;
}

export function getWsUrl(): string {
  const token = getAccessToken();
  const base = import.meta.env.VITE_WS_URL || 'wss://backend-lilac-shape-6331.fly.dev';
  return `${base}/chat/ws?token=${token}`;
}

// Marketplace
export async function listMarketplaceItems(type?: string): Promise<MarketplaceItem[]> {
  const r = await client.get<MarketplaceItem[]>('/marketplace/items', { params: type ? { type } : {} });
  return r.data;
}

export async function getMarketplaceItem(itemId: string): Promise<MarketplaceItem> {
  const r = await client.get<MarketplaceItem>(`/marketplace/items/${itemId}`);
  return r.data;
}

export async function buyMarketplaceItem(itemId: string): Promise<{ message: string; item_name: string; tokens_remaining: number }> {
  const r = await client.post<{ message: string; item_name: string; tokens_remaining: number }>(`/marketplace/buy/${itemId}`);
  return r.data;
}

export async function getMyPurchases(): Promise<Purchase[]> {
  const r = await client.get<Purchase[]>('/marketplace/my');
  return r.data;
}

// Friends
export async function getFriends(): Promise<Friend[]> {
  const r = await client.get<{ items: Friend[] }>('/friends/');
  return r.data.items;
}

export async function getPendingRequests(): Promise<FriendRequest[]> {
  const r = await client.get<{ items: FriendRequest[] }>('/friends/requests');
  return r.data.items;
}

export async function sendFriendRequest(userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/friends/request/${userId}`);
  return r.data;
}

export async function acceptFriendRequest(userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/friends/accept/${userId}`);
  return r.data;
}

export async function declineFriendRequest(userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/friends/decline/${userId}`);
  return r.data;
}

export async function removeFriend(userId: string): Promise<{ message: string }> {
  const r = await client.delete<{ message: string }>(`/friends/${userId}`);
  return r.data;
}

export async function blockUser(userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/friends/block/${userId}`);
  return r.data;
}

export async function unblockUser(userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/friends/unblock/${userId}`);
  return r.data;
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const r = await client.get<{ items: BlockedUser[] }>('/friends/blocked');
  return r.data.items;
}

export async function searchUsers(query: string): Promise<Friend[]> {
  const r = await client.get<{ items: Friend[] }>('/friends/search', { params: { q: query } });
  return r.data.items;
}

// Private dialogs
export async function getDialogs(): Promise<PrivateDialog[]> {
  const r = await client.get<{ items: PrivateDialog[] }>('/friends/dialogs');
  return r.data.items;
}

export async function openDialog(userId: string): Promise<PrivateDialog> {
  const r = await client.post<{ dialog: PrivateDialog }>(`/friends/dialogs/${userId}`);
  return r.data.dialog;
}

export async function getDialogMessages(dialogId: string, limit = 50, skip = 0): Promise<PrivateMessage[]> {
  const r = await client.get<{ items: PrivateMessage[] }>(`/friends/dialogs/${dialogId}/messages`, { params: { limit, skip } });
  return r.data.items;
}

export async function sendDialogMessage(dialogId: string, content: string): Promise<PrivateMessage> {
  const r = await client.post<{ msg: PrivateMessage }>(`/friends/dialogs/${dialogId}/messages`, { content });
  return r.data.msg;
}

// Notifications
export async function listNotifications(limit = 50, skip = 0, unread_only = false): Promise<Notification[]> {
  const r = await client.get<Notification[]>('/notifications/', { params: { limit, skip, unread_only } });
  return r.data;
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const r = await client.get<{ count: number }>('/notifications/unread-count');
  return r.data;
}

export async function markNotificationRead(id: string): Promise<{ message: string }> {
  const r = await client.patch<{ message: string }>(`/notifications/${id}/read`);
  return r.data;
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>('/notifications/read-all');
  return r.data;
}

export function getNotificationWsUrl(): string {
  const token = getAccessToken();
  const base = import.meta.env.VITE_WS_URL || 'wss://backend-lilac-shape-6331.fly.dev';
  return `${base}/notifications/ws?token=${token}`;
}

// Devices (FCM push tokens)
export async function registerDevice(token: string, platform = 'web'): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>('/devices/register', { token, platform });
  return r.data;
}

export async function unregisterDevice(token: string): Promise<{ message: string }> {
  const r = await client.delete<{ message: string }>(`/devices/${encodeURIComponent(token)}`);
  return r.data;
}

// Achievements
export async function getMyAchievements(): Promise<UserAchievement[]> {
  const r = await client.get<{ items: UserAchievement[] }>('/achievements/unlocked');
  return r.data.items;
}

export async function getMyBadges(): Promise<UserBadge[]> {
  const r = await client.get<{ items: UserBadge[] }>('/achievements/badges');
  return r.data.items;
}

export async function getAllDefinitions(): Promise<import('@/types').AchievementDefinition[]> {
  const r = await client.get<{ items: import('@/types').AchievementDefinition[] }>('/achievements');
  return r.data.items;
}

// Privacy
export async function getPrivacySettings(): Promise<{ settings: PrivacySettings }> {
  const r = await client.get<{ settings: PrivacySettings }>('/privacy');
  return r.data;
}

export async function updatePrivacySettings(data: PrivacySettingsUpdate): Promise<{ message: string; settings: PrivacySettings }> {
  const r = await client.patch<{ message: string; settings: PrivacySettings }>('/privacy', data);
  return r.data;
}

// Leaderboard
export async function getLeaderboard(period = 'all_time', city?: string, page = 1, limit = 50): Promise<LeaderboardResponse> {
  const r = await client.get<LeaderboardResponse>('/leaderboard/', { params: { period, city, page, limit } });
  return r.data;
}

// Organizations
export async function listOrganizations(
  status?: string,
  page = 1,
  limit = 20,
  ownerId?: string,
): Promise<{ items: Organization[]; total: number }> {
  const r = await client.get('/organizations/', { params: { status, page, limit, owner_id: ownerId } });
  return r.data;
}

export async function getOrganization(orgId: string): Promise<Organization> {
  const r = await client.get<{ organization: Organization }>(`/organizations/${orgId}`);
  return r.data.organization;
}

export async function createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
  const r = await client.post<{ organization: Organization }>('/organizations/', data);
  return r.data.organization;
}

export async function updateOrganization(orgId: string, data: Partial<CreateOrganizationRequest>): Promise<Organization> {
  const r = await client.patch<{ organization: Organization }>(`/organizations/${orgId}`, data);
  return r.data.organization;
}

export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  const r = await client.get<{ members: OrganizationMember[] }>(`/organizations/${orgId}/members`);
  return r.data.members;
}

export async function submitOrganizationReview(orgId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/organizations/${orgId}/submit-review`);
  return r.data;
}

export async function getOrganizationStatistics(orgId: string): Promise<Record<string, unknown>> {
  const r = await client.get<{ statistics: Record<string, unknown> }>(`/organizations/${orgId}/statistics`);
  return r.data.statistics;
}

export async function getOrganizationEvents(
  orgId: string,
  page = 1,
  limit = 20,
): Promise<{ events: import('@/types').Event[]; total: number }> {
  const r = await client.get<{ events: import('@/types').Event[]; total: number }>(
    `/organizations/${orgId}/events`,
    { params: { page, limit } },
  );
  return r.data;
}

// Partners
export async function listPartners(
  status?: string,
  page = 1,
  limit = 20,
  ownerId?: string,
): Promise<{ items: Partner[]; total: number }> {
  const r = await client.get('/partners/', { params: { status, page, limit, owner_id: ownerId } });
  return r.data;
}

export async function getPartner(partnerId: string): Promise<Partner> {
  const r = await client.get<{ partner: Partner }>(`/partners/${partnerId}`);
  return r.data.partner;
}

export async function createPartner(data: CreatePartnerRequest): Promise<Partner> {
  const r = await client.post<{ partner: Partner }>('/partners/', data);
  return r.data.partner;
}

export async function updatePartner(partnerId: string, data: Partial<CreatePartnerRequest>): Promise<Partner> {
  const r = await client.patch<{ partner: Partner }>(`/partners/${partnerId}`, data);
  return r.data.partner;
}

export async function getPartnerRewards(
  partnerId: string,
  page = 1,
  limit = 20,
): Promise<{ items: Reward[]; total: number }> {
  const r = await client.get(`/partners/${partnerId}/rewards`, { params: { page, limit } });
  return r.data;
}

export async function getPartnerRedemptions(
  partnerId: string,
  status?: string,
  page = 1,
  limit = 20,
): Promise<{ items: RewardRedemption[]; total: number }> {
  const r = await client.get(`/partners/${partnerId}/redemptions`, { params: { status, page, limit } });
  return r.data;
}

export async function getPartnerRewardStats(partnerId: string): Promise<Record<string, unknown>> {
  const r = await client.get<{ stats: Record<string, unknown> }>(`/partners/${partnerId}/rewards/stats`);
  return r.data.stats;
}

export async function createPartnerReward(
  partnerId: string,
  data: {
    name: string;
    description: string;
    type: string;
    price_tokens: number;
    total_inventory?: number;
    max_per_user?: number;
    requires_approval?: boolean;
  },
): Promise<Reward> {
  const r = await client.post<{ reward: Reward }>(`/rewards/partner/${partnerId}`, data);
  return r.data.reward;
}

// Rewards
export async function listRewards(page = 1, limit = 20): Promise<{ items: Reward[]; total: number }> {
  const r = await client.get('/rewards/', { params: { page, limit } });
  return r.data;
}

export async function getReward(rewardId: string): Promise<Reward> {
  const r = await client.get<Reward>(`/rewards/${rewardId}`);
  return r.data;
}

export async function reserveReward(rewardId: string): Promise<{ message: string; redemption: RewardRedemption }> {
  const r = await client.post(`/rewards/${rewardId}/reserve`);
  return r.data;
}

export async function getMyRedemptions(page = 1, limit = 20): Promise<{ items: RewardRedemption[]; total: number }> {
  const r = await client.get('/rewards/my/redemptions', { params: { page, limit } });
  return r.data;
}

// ─── Admin: reward redemption moderation ───
export async function listAdminRedemptions(status?: string, page = 1, limit = 50): Promise<{ items: RewardRedemption[]; total: number }> {
  const r = await client.get('/rewards/admin/redemptions', { params: { status, page, limit } });
  return r.data;
}

export async function approveRedemption(redemptionId: string): Promise<{ message: string }> {
  const r = await client.post(`/rewards/admin/redemptions/${redemptionId}/approve`);
  return r.data;
}

export async function rejectRedemption(redemptionId: string, notes = ''): Promise<{ message: string }> {
  const r = await client.post(`/rewards/admin/redemptions/${redemptionId}/reject`, null, { params: { notes } });
  return r.data;
}

export async function fulfillRedemption(redemptionId: string): Promise<{ message: string }> {
  const r = await client.post(`/rewards/admin/redemptions/${redemptionId}/fulfill`);
  return r.data;
}

export async function getEventParticipants(eventId: string): Promise<import('@/types').EventParticipant[]> {
  const r = await client.get<{ participants: import('@/types').EventParticipant[] }>(`/events/${eventId}/participants`);
  return r.data.participants;
}

export async function confirmParticipation(eventId: string, userId: string): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/events/${eventId}/confirm-participation`, null, {
    params: { target_user_id: userId },
  });
  return r.data;
}

export async function moderateEvent(
  eventId: string,
  action: 'approve' | 'reject',
  reason = '',
): Promise<{ message: string }> {
  const r = await client.post<{ message: string }>(`/events/${eventId}/moderate`, { action, reason });
  return r.data;
}

export async function cancelRedemption(redemptionId: string): Promise<{ message: string }> {
  const r = await client.post(`/rewards/redemptions/${redemptionId}/cancel`);
  return r.data;
}

// Disputes
export async function listDisputes(page = 1, limit = 20): Promise<{ items: Dispute[]; total: number }> {
  const r = await client.get('/disputes/', { params: { page, limit } });
  return r.data;
}

export async function getDispute(disputeId: string): Promise<Dispute> {
  const r = await client.get<Dispute>(`/disputes/${disputeId}`);
  return r.data;
}

export async function createDispute(data: CreateDisputeRequest): Promise<Dispute> {
  const r = await client.post<Dispute>('/disputes/', data);
  return r.data;
}

export async function getDisputeComments(disputeId: string): Promise<DisputeComment[]> {
  const r = await client.get<DisputeComment[]>(`/disputes/${disputeId}/comments`);
  return r.data;
}

export async function addDisputeComment(disputeId: string, content: string): Promise<DisputeComment> {
  const r = await client.post<DisputeComment>(`/disputes/${disputeId}/comments`, { content });
  return r.data;
}

// Reports
export async function listReports(page = 1, limit = 20): Promise<{ items: Report[]; total: number }> {
  const r = await client.get('/reports/', { params: { page, limit } });
  return r.data;
}

export async function createReport(data: CreateReportRequest): Promise<Report> {
  const r = await client.post<Report>('/reports/', data);
  return r.data;
}

// Admin
export async function getAdminStats(): Promise<{
  users: number;
  events: number;
  missions: number;
  purchases: number;
  messages: number;
  total_tokens: number;
  active_users: number;
}> {
  const r = await client.get('/admin/stats');
  return r.data;
}

export async function listAdminUsers(search?: string, role?: string, page = 1, limit = 50): Promise<AuthUser[]> {
  const r = await client.get('/admin/users', { params: { search, role, page, limit } });
  return r.data;
}

export async function updateUserRole(userId: string, role: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/users/${userId}/role`, null, { params: { role } });
  return r.data;
}

export async function listAdminEvents(status_filter?: string, category?: string, page = 1, limit = 50): Promise<import('@/types').Event[]> {
  const r = await client.get('/admin/events', { params: { status_filter, category, page, limit } });
  return r.data;
}

export async function updateEventStatus(eventId: string, status: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/events/${eventId}/status`, null, { params: { status } });
  return r.data;
}

export async function listAdminOrganizations(status?: string, page = 1, limit = 50): Promise<{ items: Organization[]; total: number }> {
  const r = await client.get('/admin/organizations', { params: { status, page, limit } });
  return r.data;
}

export async function updateOrganizationStatus(orgId: string, status: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/organizations/${orgId}/status`, { status });
  return r.data;
}

export async function listAdminPartners(status?: string, page = 1, limit = 50): Promise<{ items: Partner[]; total: number }> {
  const r = await client.get('/admin/partners', { params: { status, page, limit } });
  return r.data;
}

export async function updatePartnerStatus(partnerId: string, status: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/partners/${partnerId}/status`, { status });
  return r.data;
}

export async function listAdminMissions(page = 1, limit = 50): Promise<{ items: import('@/types').Mission[]; total: number }> {
  const r = await client.get('/admin/missions', { params: { page, limit } });
  return r.data;
}

export async function createMission(data: {
  title: string;
  description: string;
  category: string;
  target_count: number;
  reward_xp: number;
  reward_tokens: number;
  requires_submission?: boolean;
  verification_code?: string;
  expires_at?: string;
}): Promise<import('@/types').Mission> {
  const r = await client.post('/missions/', data);
  return r.data;
}

export async function deleteMission(missionId: string): Promise<{ message: string }> {
  const r = await client.delete(`/missions/${missionId}`);
  return r.data;
}

export async function adminListMissionSubmissions(status?: string, page = 1, limit = 50): Promise<{ items: import('@/types').MissionSubmission[]; total: number }> {
  const r = await client.get('/mission-submissions', { params: { status, page, limit } });
  return r.data;
}

export async function reviewMissionSubmission(submissionId: string, action: 'approve' | 'reject', notes = ''): Promise<{ message: string }> {
  const status = action === 'approve' ? 'approved' : 'rejected';
  const r = await client.post(`/mission-submissions/${submissionId}/${action}`, { status, review_notes: notes });
  return r.data;
}

// Profile-completion reward rules (admin)
export async function listProfileRewardRules(): Promise<import('@/types').ProfileRewardRule[]> {
  const r = await client.get('/admin/profile-reward-rules');
  return r.data;
}

export async function createProfileRewardRule(data: {
  field_name: string;
  label: string;
  reward_tokens: number;
  reward_xp: number;
  is_active?: boolean;
}): Promise<import('@/types').ProfileRewardRule> {
  const r = await client.post('/admin/profile-reward-rules', data);
  return r.data;
}

export async function updateProfileRewardRule(ruleId: string, data: Partial<{ label: string; reward_tokens: number; reward_xp: number; is_active: boolean }>): Promise<import('@/types').ProfileRewardRule> {
  const r = await client.patch(`/admin/profile-reward-rules/${ruleId}`, data);
  return r.data;
}

export async function deleteProfileRewardRule(ruleId: string): Promise<{ message: string }> {
  const r = await client.delete(`/admin/profile-reward-rules/${ruleId}`);
  return r.data;
}

// Token operations journal (admin)
export async function adminListTransactions(params: { user_id?: string; tx_type?: string; limit?: number; skip?: number } = {}): Promise<{ items: import('@/types').AdminTokenTransaction[]; total: number }> {
  const r = await client.get('/tokens/admin/all', { params: { limit: 100, ...params } });
  return r.data;
}

export async function listAdminRewards(page = 1, limit = 50): Promise<{ items: unknown[]; total: number }> {
  const r = await client.get('/admin/rewards', { params: { page, limit } });
  return r.data;
}

export async function listAdminReportedUsers(page = 1, limit = 50): Promise<{ items: Report[]; total: number }> {
  const r = await client.get('/admin/reports', { params: { page, limit } });
  return r.data;
}

export async function reviewReport(reportId: string, action: string, resolution?: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/reports/${reportId}/review`, { action, resolution });
  return r.data;
}

export async function listAdminDisputes(page = 1, limit = 50): Promise<{ items: Dispute[]; total: number }> {
  const r = await client.get('/admin/disputes', { params: { page, limit } });
  return r.data;
}

export async function resolveDispute(disputeId: string, resolution: string, notes?: string): Promise<{ message: string }> {
  const r = await client.patch(`/admin/disputes/${disputeId}/resolve`, { resolution, notes });
  return r.data;
}

export async function adjustUserTokens(userId: string, amount: number, reason: string): Promise<{ message: string }> {
  const r = await client.post('/admin/tokens/adjust', { user_id: userId, amount, reason });
  return r.data;
}

export async function getAdminTokenStats(): Promise<{
  total_earned: number;
  total_spent: number;
  last_30_days: { date: string; transactions: number; amount: number }[];
}> {
  const r = await client.get('/admin/tokens/stats');
  return r.data;
}

export async function approveOrganization(orgId: string): Promise<{ message: string }> {
  const r = await client.post(`/organizations/${orgId}/approve`);
  return r.data;
}

export async function rejectOrganization(orgId: string, reason = ''): Promise<{ message: string }> {
  const r = await client.post(`/organizations/${orgId}/reject`, null, { params: { reason } });
  return r.data;
}

export async function approvePartner(partnerId: string): Promise<{ message: string }> {
  const r = await client.post(`/partners/${partnerId}/approve`);
  return r.data;
}

export async function rejectPartner(partnerId: string, reason = ''): Promise<{ message: string }> {
  const r = await client.post(`/partners/${partnerId}/reject`, null, { params: { reason } });
  return r.data;
}

export async function moderateUser(userId: string, action: string, reason: string, duration_hours?: number): Promise<{ message: string }> {
  const r = await client.post('/admin/moderation', { user_id: userId, action, reason, duration_hours });
  return r.data;
}

// Translation (LLM via backend Groq proxy)
export async function translateTexts(texts: string[], targetLang: string): Promise<string[]> {
  const r = await client.post<{ translations: string[] }>('/translate', { texts, target_lang: targetLang });
  return r.data.translations;
}
