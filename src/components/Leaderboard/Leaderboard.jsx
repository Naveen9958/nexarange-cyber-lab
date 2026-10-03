// src/components/Leaderboard/Leaderboard.jsx — Professional Global Rankings
import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { LEADERBOARD } from '../../data/labData';
import { IconTrophy, IconSearch, IconZap, IconShield, IconUser } from '../Common/Icons';
import s from './Leaderboard.module.css';

export default function Leaderboard() {
  const { totalXP, getRank, operator } = useStore();
  const [trackFilter, setTrackFilter] = useState('all'); // 'all' | 'ai' | 'cloud'
  const [search, setSearch] = useState('');

  const currentRank = getRank();

  // Dynamically update user's entry in leaderboard
  const dynamicLeaderboard = LEADERBOARD.map((entry) => {
    if (entry.isMe) {
      return {
        ...entry,
        name: operator.name,
        rank: currentRank,
        xp: totalXP,
        track: totalXP > 500 ? 'AI Security' : 'Enclave Trainee',
      };
    }
    return entry;
  });

  const podium = dynamicLeaderboard.slice(0, 3);

  const filteredList = dynamicLeaderboard.filter((entry) => {
    if (trackFilter === 'ai' && !entry.track.toLowerCase().includes('ai')) return false;
    if (trackFilter === 'cloud' && !entry.track.toLowerCase().includes('cloud')) return false;
    if (search.trim()) {
      return entry.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const nextMilestoneXP = 500;
  const xpToNextRank = Math.max(0, nextMilestoneXP - totalXP);

  return (
    <div className={s.wrap}>
      {/* ── Page Header ── */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>GLOBAL OPERATOR LEADERBOARD</h1>
          <p className={s.subtitle}>
            Competitive benchmarks across autonomous intelligence defense, cloud posture, and zero-trust engineering.
          </p>
        </div>

        {/* User Milestone Quick Banner */}
        <div className={s.userMilestoneCard}>
          <div className={s.userMilestoneLeft}>
            <div className={s.myRankPill}>RANK #{currentRank}</div>
            <div>
              <div className={s.myName}>{operator.name} (YOU)</div>
              <div className={s.myXp}>{totalXP.toLocaleString()} Total XP</div>
            </div>
          </div>
          <div className={s.userMilestoneRight}>
            <span className={s.nextTargetLabel}>NEXT MILESTONE</span>
            <span className={s.nextTargetVal}>
              {xpToNextRank > 0 ? `${xpToNextRank} XP to Rank #180` : 'Milestone Achieved!'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Metallic Top 3 Podium ── */}
      <div className={s.podiumSection}>
        <div className={s.podiumGrid}>
          {/* 2nd Place: Silver */}
          <div className={`${s.podiumCard} ${s.silverCard}`}>
            <div className={s.podiumCrown}>🥈 2ND PLACE</div>
            <div className={s.avatarCircle}>{podium[1].avatar}</div>
            <div className={s.podiumOperatorName}>{podium[1].name}</div>
            <div className={s.podiumTrack}>{podium[1].track}</div>
            <div className={s.podiumXP}>{podium[1].xp.toLocaleString()} XP</div>
            <div className={s.podiumPedestal} style={{ height: '70px' }}>
              <span>RANK 02</span>
            </div>
          </div>

          {/* 1st Place: Gold (Tallest) */}
          <div className={`${s.podiumCard} ${s.goldCard}`}>
            <div className={s.goldCrown}>👑 GLOBAL CHAMPION</div>
            <div className={`${s.avatarCircle} ${s.goldAvatar}`}>{podium[0].avatar}</div>
            <div className={s.podiumOperatorName}>{podium[0].name}</div>
            <div className={s.podiumTrack}>{podium[0].track}</div>
            <div className={`${s.podiumXP} ${s.goldXP}`}>{podium[0].xp.toLocaleString()} XP</div>
            <div className={s.podiumPedestal} style={{ height: '100px' }}>
              <span>RANK 01</span>
            </div>
          </div>

          {/* 3rd Place: Bronze */}
          <div className={`${s.podiumCard} ${s.bronzeCard}`}>
            <div className={s.podiumCrown}>🥉 3RD PLACE</div>
            <div className={s.avatarCircle}>{podium[2].avatar}</div>
            <div className={s.podiumOperatorName}>{podium[2].name}</div>
            <div className={s.podiumTrack}>{podium[2].track}</div>
            <div className={s.podiumXP}>{podium[2].xp.toLocaleString()} XP</div>
            <div className={s.podiumPedestal} style={{ height: '55px' }}>
              <span>RANK 03</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Controls ── */}
      <div className={s.controlsRow}>
        <div className={s.filterTabs}>
          <button
            className={`${s.tabBtn} ${trackFilter === 'all' ? s.tabActive : ''}`}
            onClick={() => setTrackFilter('all')}
          >
            All Tracks
          </button>
          <button
            className={`${s.tabBtn} ${trackFilter === 'ai' ? s.tabActive : ''}`}
            onClick={() => setTrackFilter('ai')}
          >
            AI Security
          </button>
          <button
            className={`${s.tabBtn} ${trackFilter === 'cloud' ? s.tabActive : ''}`}
            onClick={() => setTrackFilter('cloud')}
          >
            Cloud Infra
          </button>
        </div>

        <div className={s.searchBox}>
          <IconSearch size={15} />
          <input
            className={s.searchInput}
            placeholder="Search operator callsign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Rankings Table ── */}
      <div className={s.tableContainer}>
        <div className={s.tableHead}>
          <span className={s.colRank}>RANK</span>
          <span className={s.colOperator}>OPERATOR</span>
          <span className={s.colTrack}>SPECIALIZATION</span>
          <span className={s.colXP}>TOTAL XP</span>
        </div>

        <div className={s.tableBody}>
          {filteredList.map((entry) => {
            const isMe = entry.isMe;
            return (
              <div
                key={entry.rank}
                className={`${s.tableRow} ${isMe ? s.myRow : ''}`}
              >
                <div className={s.colRank}>
                  <span className={`${s.rankBadge} ${entry.rank <= 3 ? s.topRankBadge : ''}`}>
                    #{entry.rank}
                  </span>
                </div>

                <div className={s.colOperator}>
                  <div className={s.operatorAvatarSmall}>{entry.avatar}</div>
                  <div className={s.operatorNameText}>
                    <span>{entry.name}</span>
                    {isMe && <span className={s.youPill}>YOU</span>}
                  </div>
                </div>

                <div className={s.colTrack}>
                  <span className={s.trackPill}>{entry.track}</span>
                </div>

                <div className={s.colXP}>
                  <span className={s.xpValText}>{entry.xp.toLocaleString()} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
