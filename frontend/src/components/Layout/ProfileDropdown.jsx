// src/components/Layout/ProfileDropdown.jsx — Accessible, polished profile & appearance menu
import React, { useEffect, useRef, useState } from 'react';
import useStore from '../../store/useStore';
import {
  IconUser,
  IconSettings,
  IconSun,
  IconMoon,
  IconMonitor,
  IconLogOut,
  IconTarget,
} from '../Common/Icons';
import s from './ProfileDropdown.module.css';

export default function ProfileDropdown() {
  const {
    operator,
    getLevel,
    themeMode,
    setTheme,
    profileDropdownOpen,
    setProfileDropdownOpen,
    profileDropdownAnchor,
    setOperatorModalOpen,
    resetProgress,
    initiateLogout,
    showToast,
  } = useStore();

  const [confirmReset, setConfirmReset] = useState(false);
  const dropdownRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && profileDropdownOpen) {
        setProfileDropdownOpen(false);
        setConfirmReset(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileDropdownOpen, setProfileDropdownOpen]);

  // Close on click outside
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (e.target.closest('[data-profile-trigger="true"]')) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
        setConfirmReset(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileDropdownOpen, setProfileDropdownOpen]);

  if (!profileDropdownOpen) return null;

  const level = getLevel();

  const handleOpenProfile = () => {
    setProfileDropdownOpen(false);
    setOperatorModalOpen(true, 'profile');
  };

  const handleOpenSettings = () => {
    setProfileDropdownOpen(false);
    setOperatorModalOpen(true, 'settings');
  };

  const handleResetProgress = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetProgress();
    setConfirmReset(false);
    setProfileDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    initiateLogout();
  };

  const THEME_OPTIONS = [
    { id: 'dark', label: 'Dark', icon: IconMoon },
    { id: 'light', label: 'Light', icon: IconSun },
    { id: 'system', label: 'System', icon: IconMonitor },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`${s.dropdown} ${profileDropdownAnchor === 'header' ? s.anchorHeader : s.anchorSidebar}`}
      role="dialog"
      aria-label="Operator Profile and Appearance Settings"
      aria-modal="false"
    >
      {/* User Header */}
      <div className={s.userHeader}>
        <div className={s.avatar}>{operator.avatar}</div>
        <div className={s.userMeta}>
          <div className={s.userName}>{operator.name.toUpperCase()}</div>
          <div className={s.userRole}>
            Analyst Level 0{level}
          </div>
        </div>
      </div>

      <div className={s.divider} />

      {/* Navigation Actions */}
      <div className={s.section}>
        <button
          className={s.menuItem}
          onClick={handleOpenProfile}
          role="button"
          tabIndex={0}
        >
          <IconUser size={15} className={s.itemIcon} />
          <span className={s.itemText}>Profile</span>
          <span className={s.itemBadge}>LVL 0{level}</span>
        </button>

        <button
          className={s.menuItem}
          onClick={handleOpenSettings}
          role="button"
          tabIndex={0}
        >
          <IconSettings size={15} className={s.itemIcon} />
          <span className={s.itemText}>Settings</span>
        </button>
      </div>

      <div className={s.divider} />

      {/* Appearance Section */}
      <div className={s.themeSection}>
        <div className={s.themeHeading} id="appearance-heading">
          Appearance
        </div>
        <div
          className={s.themeGroup}
          role="radiogroup"
          aria-labelledby="appearance-heading"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`Switch appearance to ${opt.label}`}
                className={`${s.themeBtn} ${isSelected ? s.themeBtnActive : ''}`}
                onClick={() => setTheme(opt.id)}
                tabIndex={0}
              >
                <span className={`${s.radioBullet} ${isSelected ? s.bulletActive : ''}`}>
                  {isSelected ? '●' : '○'}
                </span>
                <Icon size={14} className={s.themeBtnIcon} />
                <span className={s.themeBtnLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={s.divider} />

      {/* Progress Reset (Separate from Logout) */}
      <div className={s.section}>
        {confirmReset ? (
          <div className={s.confirmBox}>
            <span className={s.confirmText}>Reset mission progress?</span>
            <div className={s.confirmActions}>
              <button
                type="button"
                className={s.confirmYes}
                onClick={handleResetProgress}
              >
                Confirm
              </button>
              <button
                type="button"
                className={s.confirmNo}
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className={s.menuItem}
            onClick={handleResetProgress}
            role="button"
            tabIndex={0}
          >
            <IconTarget size={15} className={s.itemIcon} />
            <span className={s.itemText}>Progress Reset</span>
          </button>
        )}
      </div>

      <div className={s.divider} />

      {/* Logout Action (Triggers Confirmation Modal) */}
      <div className={s.section}>
        <button
          className={`${s.menuItem} ${s.logoutItem}`}
          onClick={handleLogoutClick}
          role="button"
          tabIndex={0}
        >
          <IconLogOut size={15} className={s.logoutIcon} />
          <span className={s.itemText}>Logout</span>
        </button>
      </div>
    </div>
  );
}
