// src/components/Friends/FriendsView.jsx
import { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { FRIENDS, FRIEND_REQUESTS } from '../../data/labData';
import s from './FriendsView.module.css';

export default function FriendsView() {
  const { friends, friendRequests, initFriends, addFriend, acceptRequest, declineRequest, showToast } = useStore();
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (friends.length === 0) initFriends(FRIENDS, FRIEND_REQUESTS);
  }, []);

  function sendReq() {
    if (!newName.trim()) return;
    showToast(`Friend request sent to ${newName.toUpperCase()}`, 'cyan');
    setNewName('');
  }

  return (
    <div className={s.wrap}>
      <div className={s.section}>
        <div className={s.sectionTitle}>// SQUAD NETWORK</div>
        <div className={s.addRow}>
          <input className={s.addInput} value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendReq()} placeholder="Enter operator name..." />
          <button className={s.addBtn} onClick={sendReq}>+ SEND REQUEST</button>
        </div>
      </div>

      {friendRequests.length > 0 && (
        <div className={s.section}>
          <div className={s.sectionTitle}>// INCOMING REQUESTS</div>
          {friendRequests.map((r) => (
            <div key={r.name} className={s.reqCard}>
              <div className={s.reqAvatar}>{r.name[0]}</div>
              <div className={s.reqName}>{r.name}</div>
              <div className={s.reqXP}>{r.xp.toLocaleString()} XP</div>
              <button className={s.acceptBtn} onClick={() => acceptRequest(r.name)}>ACCEPT</button>
              <button className={s.declineBtn} onClick={() => declineRequest(r.name)}>DECLINE</button>
            </div>
          ))}
        </div>
      )}

      <div className={s.section}>
        <div className={s.sectionTitle}>// ONLINE SQUAD ({friends.filter((f) => f.online).length} online)</div>
        <div className={s.friendGrid}>
          {friends.map((f) => (
            <div key={f.name} className={s.friendCard}>
              <div className={s.friendAvatarWrap}>
                <div className={s.friendAvatar}>{f.avatar}</div>
                <div className={`${s.onlineDot} ${f.online ? s.online : s.offline}`} />
              </div>
              <div className={s.friendName}>{f.name}</div>
              <div className={s.friendXP}>{f.xp.toLocaleString()} XP</div>
              <div className={s.friendStatus}>{f.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
