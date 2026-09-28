// src/components/Certificates/CertificatesView.jsx
import { useState } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import s from './CertificatesView.module.css';

export default function CertificatesView() {
  const { completedMissions, badges, showToast } = useStore();
  const [showCert, setShowCert] = useState(null);

  const lab1Missions = LAB_DATA[1].missions;
  const lab2Missions = LAB_DATA[2].missions;
  const lab1Done = lab1Missions.every((m) => completedMissions[m.id]);
  const lab2Done = lab2Missions.every((m) => completedMissions[m.id]);

  const certCode = () => `NR-${Math.random().toString(36).substr(2,4).toUpperCase()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;

  return (
    <div className={s.wrap}>
      <div className={s.title}>// CREDENTIALS VAULT</div>
      <div className={s.grid}>
        {[
          { labId: 1, title: 'Ghost in the Machine', color: 'green', done: lab1Done, cert: 'Advanced AI Security Analyst' },
          { labId: 2, title: 'The Deepfake Deal', color: 'cyan', done: lab2Done, cert: 'Cloud Infrastructure Security Engineer' },
        ].map((c) => {
          const neon = `var(--neon-${c.color})`;
          return (
            <div key={c.labId} className={s.certCard} style={{ borderColor: c.done ? `rgba(${c.color === 'green' ? '0,255,170':'0,212,255'},0.35)` : 'var(--border)' }}>
              <div className={s.certLabel} style={{ color: neon }}>CASE {c.labId === 1 ? 'NC-114' : 'VC-233'}</div>
              <div className={s.certTitle}>{c.title}</div>
              <div className={s.certBadgeArea}>
                <div className={s.certBadge} style={{ borderColor: neon, boxShadow: c.done ? `0 0 20px ${neon}44` : 'none' }}>
                  <div className={s.certBadgeInner}>{c.done ? '🏆' : '🔒'}</div>
                </div>
              </div>
              <div className={s.certCourseTitle}>{c.cert}</div>
              {c.done ? (
                <button className={s.viewBtn} style={{ color: neon, borderColor: `rgba(${c.color === 'green' ? '0,255,170':'0,212,255'},0.4)` }}
                  onClick={() => setShowCert(c)}>
                  VIEW CERTIFICATE
                </button>
              ) : (
                <div className={s.lockedMsg}>Complete all 5 missions to unlock</div>
              )}
            </div>
          );
        })}
      </div>

      {showCert && (
        <div className={s.certModal} onClick={() => setShowCert(null)}>
          <div className={s.certDocument} onClick={(e) => e.stopPropagation()}>
            <div className={s.certDoc}>
              <div className={s.certDocHeader}>
                <div className={s.certDocTitle}>NEXARANGE CYBER OPERATIONS PLATFORM</div>
                <div className={s.certDocSub}>Certificate of Achievement</div>
              </div>
              <div className={s.certDocAwardText}>This certifies that</div>
              <div className={s.certDocName}>NAVEEN</div>
              <div className={s.certDocAwardText}>has successfully completed all missions in</div>
              <div className={s.certDocTrack}>{showCert.cert}</div>
              <div className={s.certDocCase}>Case ID: {showCert.labId === 1 ? 'NC-114' : 'VC-233'} · {new Date().toLocaleDateString('en-GB')}</div>
              <div className={s.certDocCode}>Verification Code: <span style={{color:'var(--neon-cyan)'}}>{certCode()}</span></div>
            </div>
            <div className={s.certActions}>
              <button className={s.dlBtn} onClick={() => { showToast('Certificate PDF downloaded!', 'cyan'); }}>⬇ DOWNLOAD PDF</button>
              <button className={s.closeBtn} onClick={() => setShowCert(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
