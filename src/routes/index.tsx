import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute, RoleGuard } from '@/components/guards';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { EditProfilePage } from '@/pages/EditProfilePage';
import { TokensPage } from '@/pages/TokensPage';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { EventChatPage } from '@/pages/EventChatPage';
import { CreateEventPage } from '@/pages/CreateEventPage';
import { EditEventPage } from '@/pages/EditEventPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { MyItemsPage } from '@/pages/MyItemsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ChatPage } from '@/pages/ChatPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { MissionsPage } from '@/pages/MissionsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { DialogPage } from '@/pages/DialogPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { PrivacySettingsPage } from '@/pages/PrivacySettingsPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { OrganizationsPage, OrganizationDetailPage } from '@/pages/OrganizationsPage';
import { PartnersPage } from '@/pages/PartnersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'events/create', element: <CreateEventPage /> },
      { path: 'events/:id', element: <EventDetailPage /> },
      { path: 'events/:id/edit', element: <EditEventPage /> },
      { path: 'tokens', element: <TokensPage /> },
      { path: 'missions', element: <MissionsPage /> },
      { path: 'chats', element: <ChatPage initialTab="chats" /> },
      { path: 'chat/event/:eventId', element: <EventChatPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/edit', element: <EditProfilePage /> },
      { path: 'privacy', element: <PrivacySettingsPage /> },
      { path: 'friends', element: <FriendsPage /> },
      { path: 'messages', element: <ChatPage initialTab="messages" /> },
      { path: 'messages/:dialogId', element: <DialogPage /> },
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'marketplace/my', element: <MyItemsPage /> },
      { path: 'rewards', element: <RewardsPage /> },
      { path: 'organizations', element: <OrganizationsPage /> },
      { path: 'organizations/:id', element: <OrganizationDetailPage /> },
      { path: 'partners', element: <PartnersPage /> },
      // Provider dashboards now live in /profile (role-aware). Keep redirects for old links.
      { path: 'organization', element: <Navigate to="/profile" replace /> },
      { path: 'partner', element: <Navigate to="/profile" replace /> },
      { path: 'notifications', element: <NotificationsPage /> },
      {
        path: 'admin',
        element: (
          <RoleGuard role="admin">
            <AdminPage />
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '/404',
    element: <NotFoundPage />,
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
