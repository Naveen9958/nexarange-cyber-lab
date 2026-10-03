// src/components/Friends/FriendsView.jsx — Operator Squad & Peer Intelligence
import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { FRIENDS, FRIEND_REQUESTS } from '../../data/labData';
import {
  IconUsers,
  IconZap,
  IconShield,
  IconCheckCircle,
  IconSearch,
} from '../Common/Icons';
import s from './FriendsView.module.css';

export default function FriendsView() {
  const {
    friends,
    friendRequests,
    initFriends,
    acceptRequest,
    declineRequest,
    addFriend,
    showToast,
  } = useStore();

  const [newName, setNewName] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'online'
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (friends.length === 0) {
      initFriends(FRIENDS, FRIEND_REQUESTS);
    }
  }, []);

  function handleSendRequest() {
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed) return;

    if (friends.some((f) => f.name.toUpperCase() === trimmed)) {
      showToast(`Operator ${trimmed} is already in your squad.`, 'warning');
      return;
    }

    showToast(`Transmission dispatched: Squad invite sent to ${trimmed}`, 'info');
    setNewName('');
  }

  const onlineCount = friends.filter((f) => f.online).length;

  const filteredFriends = friends.filter((f) => {
    if (filter === 'online' && !f.online) return false;
    if (search.trim()) {
      return f.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className={s.wrap}>
      {/* ── Page Header ── */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>OPERATOR SQUAD NETWORK</h1>
          <p className={s.subtitle}>
            Coordinate investigation tracks, share threat telemetry, and build syndicate defensive teams.
          </p>
        </div>

        {/* Add Operator Form */}
        <div className={s.inviteBox}>
          <input
            className={s.inviteInput}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
            placeholder="Enter operator callsign..."
          />
          <button className={s.inviteBtn} onClick={handleSendRequest}>
            + SEND INVITE
          </button>
        </div>
      </div>

      {/* ── Incoming Invitations ── */}
      {friendRequests.length > 0 && (
        <section className={s.section}>
          <div className={s.sectionTitleRow}>
            <span className={s.sectionTitle}>// INCOMING SQUAD REQUESTS ({friendRequests.length})</span>
            <span className={s.pendingBadge}>ACTION REQUIRED</span>
          </div>

          <div className={s.requestsGrid}>
            {friendRequests.map((req) => (
              <div key={req.name} className={s.requestCard}>
                <div className={s.reqAvatarWrap}>
                  <div className={s.reqAvatar}>{req.name[0]}</div>
                </div>

                <div className={s.reqDetails}>
                  <div className={s.reqName}>{req.name}</div>
                  <div className={s.reqMeta}>
                    <span>{req.xp.toLocaleString()} XP</span>
                    <span className={s.metaDot}>•</span>
                    <span>AI Security Track</span>
                  </div>
                </div>

                <div className={s.reqActions}>
                  <button
                    className={s.acceptBtn}
                    onClick={() => acceptRequest(req.name)}
                  >
                    ACCEPT
                  </button>
                  <button
                    className={s.declineBtn}
                    onClick={() => declineRequest(req.name)}
                  >
                    DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Active Squad Operators ── */}
      <section className={s.section}>
        <div className={s.squadControls}>
          <div className={s.sectionTitleRow}>
            <span className={s.sectionTitle}>// ACTIVE SQUAD OPERATORS</span>
            <span className={s.onlineBadge}>
              <span className={s.onlineDot} /> {onlineCount} ONLINE NOW
            </span>
          </div>

          <div className={s.filterGroup}>
            <div className={s.filterTabs}>
              <button
                className={`${s.tabBtn} ${filter === 'all' ? s.tabActive : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({friends.length})
              </button>
              <button
                className={`${s.tabBtn} ${filter === 'online' ? s.tabActive : ''}`}
                onClick={() => setFilter('online')}
              >
                Online ({onlineCount})
              </button>
            </div>

            <div className={s.searchWrap}>
              <IconSearch size={14} className={s.searchIcon} />
              <input
                className={s.searchInput}
                placeholder="Filter squad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={s.operatorsGrid}>
          {filteredFriends.map((f) => (
            <div key={f.name} className={s.operatorCard}>
              <div className={s.cardTop}>
                <div className={s.avatarContainer}>
                  <div className={s.opAvatar}>{f.avatar}</div>
                  <span className={`${s.liveStatus} ${f.online ? s.liveOnline : s.liveOffline}`} />
                </div>

                <div className={s.statusTag}>
                  {f.online ? 'ONLINE' : 'STANDBY'}
                </div>
              </div>

              <div className={s.cardBody}>
                <div className={s.operatorCallsign}>{f.name}</div>
                <div className={s.opTrackBadge}>{f.track || 'AI Security Specialization'}</div>

                <div className={s.opStatusBox}>
                  <span className={s.statusLabel}>CURRENT ACTIVITY:</span>
                  <span className={s.statusText}>{f.status}</span>
                </div>
              </div>

              <div className={s.cardFooter}>
                <div className={s.xpCounter}>
                  <IconZap size={14} />
                  <span>{f.xp.toLocaleString()} XP</span>
                </div>
                <span className={s.activeTimestamp}>
                  {f.online ? 'Active 2m ago' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
