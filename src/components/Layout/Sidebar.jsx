// src/components/Layout/Sidebar.jsx
import useStore from '../../store/useStore';
import s from './Sidebar.module.css';

const NAV = [
  { id: 'dashboard',   label: 'HQ',    icon: '⊞' },
  { id: 'labs',        label: 'LABS',  icon: '🧪' },
  { id: 'terminal',    label: 'TERM',  icon: '>' },
  { id: 'leaderboard', label: 'RANK',  icon: '📊' },
  { id: 'friends',     label: 'SQUAD', icon: '👥' },
  { id: 'analytics',   label: 'STATS', icon: '📈' },
  { id: 'certificates',label: 'CERTS', icon: '🏆' },
];

export default function Sidebar() {
  const { view, setView } = useStore();

  return (
    <nav className={s.sidebar}>
      <div className={s.logo}><span className={s.bracket}>[</span>NR<span className={s.bracket}>]</span></div>
      <div className={s.navItems}>
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`${s.navBtn} ${view === n.id ? s.active : ''}`}
            onClick={() => setView(n.id)}
            title={n.label}
          >
            <span className={s.navIcon}>{n.icon}</span>
            <span className={s.navLabel}>{n.label}</span>
          </button>
        ))}
      </div>
      <div className={s.user}>
        <div className={s.avatar}>N</div>
        <div className={s.userInfo}>
          <div className={s.userName}>NAVEEN</div>
          <div className={s.userRank}>ANALYST LVL 3</div>
        </div>
      </div>
    </nav>
  );
}
