// src/App.jsx — Root Application with Protected Routes & Session Routing
import { useState, useCallback, useEffect } from 'react';
import useStore from './store/useStore';

import BootScreen from './components/Boot/BootScreen';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import OperatorModal from './components/Layout/OperatorModal';
import ProfileDropdown from './components/Layout/ProfileDropdown';
import LogoutModal from './components/Auth/LogoutModal';
import LogoutPage from './components/Auth/LogoutPage';
import LoginPage from './components/Auth/LoginPage';
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
  const { theme, isAuthenticated, route, isVerifyingSession } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme || 'dark');
  }, [theme]);

  // Synchronize authenticated session with backend
  useEffect(() => {
    useStore.getState().syncSession?.();
  }, []);

  // Handle browser back/forward buttons and enforce protected routes
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const isAuth = useStore.getState().isAuthenticated;
      if (!isAuth && currentPath !== '/logout' && currentPath !== '/login') {
        window.history.replaceState(null, '', '/login');
        useStore.setState({ route: '/login' });
      } else {
        useStore.setState({ route: currentPath });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Startup session verification screen (Requirement 20)
  if (isVerifyingSession) {
    return (
      <div className="verifying-session-screen">
        <div className="verifying-session-box">
          <div className="verifying-logo-wrap">
            <img src="/nexarange-logo.png" alt="NexaRange" className="verifying-logo" />
            <div className="verifying-spinner" />
          </div>
          <div className="verifying-status-label">ZERO-TRUST ENCLAVE</div>
          <div className="verifying-text">VERIFYING SECURE SESSION...</div>
          <div className="verifying-subtext">Cryptographic handshake with NexaRange Command Center</div>
        </div>
      </div>
    );
  }

  // Unauthenticated users are strictly guarded against protected dashboard routes
  if (!isAuthenticated) {
    if (route === '/logout') {
      return (
        <>
          <LogoutPage />
          <ToastSystem />
        </>
      );
    }
    return (
      <>
        <LoginPage />
        <ToastSystem />
      </>
    );
  }

  // Explicit route views for authenticated users
  if (route === '/logout') {
    return (
      <>
        <LogoutPage />
        <ToastSystem />
      </>
    );
  }

  if (route === '/login') {
    return (
      <>
        <LoginPage />
        <ToastSystem />
      </>
    );
  }

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
      <ProfileDropdown />
      <LogoutModal />
      <ToastSystem />
    </div>
  );
}
