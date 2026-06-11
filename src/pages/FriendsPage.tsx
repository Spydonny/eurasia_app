import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from '@/components/ui';
import {
  openDialog,
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  searchUsers,
} from '@/api';
import type { Friend, FriendRequest, BlockedUser } from '@/types';

type Tab = 'friends' | 'requests' | 'search' | 'blocked';

interface UserRowProps {
  avatarUrl?: string;
  displayName?: string;
  username: string;
  children?: React.ReactNode;
}

function UserRow({ avatarUrl, displayName, username, children }: UserRowProps) {
  return (
    <div className="user-row">
      <div className="user-row__main">
        <div className="user-row__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : (
            (displayName || username)?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <div className="user-row__name">{displayName || username}</div>
          <div className="user-row__meta">@{username}</div>
        </div>
      </div>
      <div className="user-row__actions">{children}</div>
    </div>
  );
}

export function FriendsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs: { key: Tab; labelKey: string }[] = [
    { key: 'friends', labelKey: 'friends.tab_friends' },
    { key: 'requests', labelKey: 'friends.tab_requests' },
    { key: 'search', labelKey: 'friends.tab_search' },
    { key: 'blocked', labelKey: 'friends.tab_blocked' },
  ];

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [f, r, b] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getBlockedUsers(),
      ]);
      setFriends(f);
      setRequests(r);
      setBlocked(b);
    } catch {
      setError(t('friends.error_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (activeTab !== 'search') {
      loadFriends();
    }
  }, [activeTab, loadFriends]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch {
      setError(t('friends.error_send'));
    }
  };

  const handleAccept = async (userId: string) => {
    try {
      await acceptFriendRequest(userId);
      await loadFriends();
    } catch {
      setError(t('friends.error_accept'));
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await declineFriendRequest(userId);
      await loadFriends();
    } catch {
      setError(t('friends.error_decline'));
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeFriend(userId);
      setFriends(prev => prev.filter(f => f.id !== userId));
    } catch {
      setError(t('friends.error_remove'));
    }
  };

  const handleBlock = async (userId: string) => {
    try {
      await blockUser(userId);
      await loadFriends();
    } catch {
      setError(t('friends.error_block'));
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      setBlocked(prev => prev.filter(b => b.blocked_id !== userId));
    } catch {
      setError(t('friends.error_unblock'));
    }
  };

  const handleMessage = async (userId: string) => {
    try {
      const dialog = await openDialog(userId);
      navigate(`/messages/${dialog.id}`);
    } catch {
      setError(t('messages.open_failed'));
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page__title">{t('friends.title')}</h1>
        <Link to="/messages" className="btn btn--ghost btn--sm"><Icons.conversation size={16} /> {t('messages.title')}</Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-tabs" style={{ margin: '16px 0', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`filter-tab ${activeTab === tab.key ? 'filter-tab--active' : ''}`}
          >
            {t(tab.labelKey)}
            {tab.key === 'requests' && requests.length > 0 && ` (${requests.length})`}
          </button>
        ))}
      </div>

      {loading && activeTab !== 'search' ? (
        <div className="page-loader">{t('common.loading')}</div>
      ) : (
        <>
          {activeTab === 'friends' && (
            friends.length === 0 ? (
              <div className="empty-state">
                <Icons.friends className="empty-state__icon" size={32} />
                <p className="empty-state__text">{t('friends.empty_friends')}</p>
              </div>
            ) : (
              friends.map(friend => (
                <UserRow key={friend.id} avatarUrl={friend.avatar_url} displayName={friend.display_name} username={friend.username}>
                  <button className="btn btn--primary btn--sm" onClick={() => handleMessage(friend.id)}>
                    {t('messages.write')}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleRemove(friend.id)}>
                    {t('friends.remove')}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleBlock(friend.id)}>
                    {t('friends.block')}
                  </button>
                </UserRow>
              ))
            )
          )}

          {activeTab === 'requests' && (
            requests.length === 0 ? (
              <div className="empty-state">
                <Icons.empty className="empty-state__icon" size={32} />
                <p className="empty-state__text">{t('friends.empty_requests')}</p>
              </div>
            ) : (
              requests.map(req => (
                <UserRow key={req.id} avatarUrl={req.avatar_url} displayName={req.display_name} username={req.username}>
                  <button className="btn btn--primary btn--sm" onClick={() => handleAccept(req.user_id)}>
                    {t('friends.accept')}
                  </button>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleDecline(req.user_id)}>
                    {t('friends.decline')}
                  </button>
                </UserRow>
              ))
            )
          )}

          {activeTab === 'search' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  className="input"
                  style={{ flex: 1 }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder={t('friends.search_placeholder')}
                />
                <button className="btn btn--primary" onClick={handleSearch}>
                  {t('common.search')}
                </button>
              </div>
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <UserRow key={user.id} avatarUrl={user.avatar_url} displayName={user.display_name} username={user.username}>
                    <button className="btn btn--primary btn--sm" onClick={() => handleSendRequest(user.id)}>
                      {t('friends.add_friend')}
                    </button>
                  </UserRow>
                ))
              ) : searchQuery && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{t('friends.no_users')}</p>
              )}
            </div>
          )}

          {activeTab === 'blocked' && (
            blocked.length === 0 ? (
              <div className="empty-state">
                <Icons.block className="empty-state__icon" size={32} />
                <p className="empty-state__text">{t('friends.empty_blocked')}</p>
              </div>
            ) : (
              blocked.map(b => (
                <UserRow key={b.id} avatarUrl={b.avatar_url} displayName={b.display_name} username={b.username}>
                  <button className="btn btn--ghost btn--sm" onClick={() => handleUnblock(b.blocked_id)}>
                    {t('friends.unblock')}
                  </button>
                </UserRow>
              ))
            )
          )}
        </>
      )}
    </div>
  );
}
