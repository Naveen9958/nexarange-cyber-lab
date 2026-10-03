// src/App.jsx — Root component
import { useState, useCallback } from 'react';
import useStore from './store/useStore';

import BootScreen from './components/Boot/BootScreen';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import OperatorModal from './components/Layout/OperatorModal';
import Dashboard from './components/Dashboard/Dashboard';
import LabsView from './components/Labs/LabsView';
import TerminalView from './components/Terminal/TerminalView';
import Leaderboard from './components/Leaderboard/Leaderboard';
import FriendsView from './components/Friends/FriendsView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import CertificatesView from './components/Certificates/CertificatesView';
import MissionView from './components/Mission/MissionView';
import DebriefView from './components/Debrief/DebriefView';
import ToastSystem from './components/Toast/ToastSystem';

import './App.css';

function ViewRouter() {
  const { view } = useStore();
  const map = {
    dashboard:    <Dashboard />,
    labs:         <LabsView />,
    terminal:     <TerminalView />,
    leaderboard:  <Leaderboard />,
    friends:      <FriendsView />,
    analytics:    <AnalyticsView />,
    certificates: <CertificatesView />,
    mission:      <MissionView />,
    debrief:      <DebriefView />,
  };
  return map[view] || <Dashboard />;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const handleBoot = useCallback(() => setBooted(true), []);

  if (!booted) return <BootScreen onComplete={handleBoot} />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <div className="app-content-container">
            <ViewRouter />
          </div>
        </main>
      </div>
      <OperatorModal />
      <ToastSystem />
    </div>
  );
}
