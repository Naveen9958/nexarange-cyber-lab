// src/components/Toast/ToastSystem.jsx — Unified Alert & Notification System
import React from 'react';
import useStore from '../../store/useStore';
import {
  IconCheckCircle,
  IconAlertCircle,
  IconZap,
  IconAward,
} from '../Common/Icons';
import s from './Toast.module.css';

export default function ToastSystem() {
  const { toasts, removeToast } = useStore();

  return (
    <div className={s.toastContainer} aria-live="polite">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        return (
          <div
            key={toast.id}
            className={`${s.toast} ${s['toast_' + type]}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
          >
            <div className={s.toastIconCol}>
              {type === 'success' && <IconCheckCircle size={18} className={s.iconSuccess} />}
              {type === 'warning' && <IconAlertCircle size={18} className={s.iconWarning} />}
              {type === 'error' && <IconAlertCircle size={18} className={s.iconError} />}
              {type === 'badge' && <span className={s.badgeEmoji}>{toast.emoji || '🏅'}</span>}
              {type === 'info' && <IconZap size={18} className={s.iconInfo} />}
            </div>

            <div className={s.toastContent}>
              {toast.title && <div className={s.toastTitle}>{toast.title}</div>}
              <div className={s.toastMessage}>{toast.text}</div>
            </div>

            <button
              className={s.closeBtn}
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
