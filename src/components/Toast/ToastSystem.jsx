// src/components/Toast/ToastSystem.jsx
import useStore from '../../store/useStore';
import s from './Toast.module.css';

export default function ToastSystem() {
  const { xpToast, badgeToast } = useStore();
  return (
    <>
      {xpToast && (
        <div className={`${s.toast} ${s.xpToast}`}>
          <span className={s.toastIcon}>⚡</span>
          <span className={s.toastText}>{xpToast.text}</span>
        </div>
      )}
      {badgeToast && (
        <div className={`${s.toast} ${s.badgeToast}`}>
          <span className={s.toastEmoji}>{badgeToast.emoji}</span>
          <div className={s.toastInfo}>
            <div className={s.toastLabel}>BADGE UNLOCKED</div>
            <div className={s.toastName}>{badgeToast.name}</div>
          </div>
        </div>
      )}
    </>
  );
}
