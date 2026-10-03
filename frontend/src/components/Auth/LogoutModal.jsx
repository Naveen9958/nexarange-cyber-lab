// src/components/Auth/LogoutModal.jsx — Session Termination Confirmation Dialog
import React, { useEffect } from 'react';
import useStore from '../../store/useStore';
import { IconLogOut, IconAlertCircle } from '../Common/Icons';
import s from './LogoutModal.module.css';

export default function LogoutModal() {
  const { logoutModalOpen, setLogoutModalOpen, confirmLogout } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && logoutModalOpen) {
        setLogoutModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoutModalOpen, setLogoutModalOpen]);

  if (!logoutModalOpen) return null;

  return (
    <div
      className={s.backdrop}
      onClick={() => setLogoutModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
    >
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <div className={s.iconWrap}>
            <IconAlertCircle size={22} className={s.warnIcon} />
          </div>
          <div>
            <h2 id="logout-dialog-title" className={s.title}>
              Terminate Session?
            </h2>
            <span className={s.badge}>SECURITY ACTION REQUIRED</span>
          </div>
        </div>

        <div className={s.body}>
          <p id="logout-dialog-desc" className={s.desc}>
            Your current command-center session will be closed. Unsaved session progress may be cleared.
          </p>

          <div className={s.sessionDetails}>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>AUTHENTICATION STATUS</span>
              <span className={s.detailValActive}>REVOCABLE</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>ENCLAVE CHANNEL</span>
              <span className={s.detailVal}>TLS 1.3 / ENCRYPTED</span>
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button
            type="button"
            className={s.cancelBtn}
            onClick={() => setLogoutModalOpen(false)}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className={s.logoutBtn}
            onClick={() => confirmLogout()}
          >
            <IconLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
