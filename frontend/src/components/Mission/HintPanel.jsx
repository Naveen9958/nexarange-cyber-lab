// src/components/Mission/HintPanel.jsx — Progressive Tactical Intel & Command Chips System
import { useState } from 'react';
import useStore from '../../store/useStore';
import { cyberAudio } from '../../utils/cyberAudio';
import s from './HintPanel.module.css';

export default function HintPanel({ hints = [], mission, onClose, onApplyAnswer }) {
  const [hintIdx, setHintIdx] = useState(-1);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const { applyHintPenalty } = useStore();

  // Tiered hint fallback if mission has fewer than 3 hints
  const preparedHints = hints.length > 0 ? hints : [
    { text: 'Analyze the active service banners and audit logs for anomalous parameters.', penalty: 10 },
    { text: 'Inspect target headers in Burp Suite or run Kali quick presets.', penalty: 20 },
    { text: `Direct Solution: ${mission?.answer || 'FLAG{...}'}`, penalty: 30 }
  ];

  function revealHint() {
    const next = hintIdx + 1;
    if (next >= preparedHints.length) return;
    cyberAudio.playCommandBlip();
    setHintIdx(next);
    if (preparedHints[next].penalty) {
      applyHintPenalty(mission?.id, preparedHints[next].penalty);
    }
  }

  const copyToClipboard = (cmd) => {
    navigator.clipboard?.writeText(cmd);
    cyberAudio.playSuccessChime();
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Helper to extract shell commands from hint text
  const extractCommand = (text) => {
    const match = text.match(/(nmap\s+[^\n]+|jwt_tool\s+[^\n]+|cat\s+[^\n]+|python3\s+[^\n]+|curl\s+[^\n]+)/i);
    return match ? match[1].trim() : null;
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.panel} onClick={(e) => e.stopPropagation()}>
        <div className={s.panelHeader}>
          <div className={s.panelTitleWrap}>
            <span className={s.panelIcon}>💡</span>
            <span className={s.panelTitle}>TACTICAL INTEL & SMART HINTS</span>
          </div>
          <button className={s.close} onClick={onClose} aria-label="Close intel panel">✕</button>
        </div>

        <p className={s.desc}>
          Step-by-step progressive operational guidance. Revealing tactical intel deducts a small XP penalty from your dossier.
        </p>

        {/* Revealed Hints */}
        <div className={s.hintsList}>
          {hintIdx >= 0 && preparedHints.slice(0, hintIdx + 1).map((h, i) => {
            const cmd = extractCommand(h.text);
            const isSolution = i === preparedHints.length - 1 && preparedHints.length >= 3;

            return (
              <div key={i} className={`${s.hintBox} ${isSolution ? s.solutionBox : ''}`}>
                <div className={s.hintHeaderRow}>
                  <span className={s.hintNum}>
                    {i === 0 ? 'LEVEL 1: CONCEPT INTEL' : i === 1 ? 'LEVEL 2: COMMAND SYNTAX' : 'LEVEL 3: DIRECT SOLUTION'}
                  </span>
                  <span className={s.hintPenalty}>(-{h.penalty} XP applied)</span>
                </div>
                <div className={s.hintText}>{h.text}</div>

                {cmd && (
                  <div className={s.commandChipWrap}>
                    <code className={s.commandCode}>{cmd}</code>
                    <button
                      type="button"
                      className={s.copyChipBtn}
                      onClick={() => copyToClipboard(cmd)}
                    >
                      {copiedCmd === cmd ? '✓ COPIED' : '📋 COPY CMD'}
                    </button>
                  </div>
                )}

                {isSolution && mission?.answer && (
                  <button
                    type="button"
                    className={s.applyFlagBtn}
                    onClick={() => {
                      if (onApplyAnswer) onApplyAnswer(mission.answer);
                      onClose();
                    }}
                  >
                    ⚡ AUTO-SUBMIT FLAG TO ANSWER BOX
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Reveal Next Hint Button */}
        {hintIdx < preparedHints.length - 1 ? (
          <button className={s.revealBtn} onClick={revealHint}>
            <span>
              Unlock {hintIdx === -1 ? 'Level 1: Concept Intel' : hintIdx === 0 ? 'Level 2: Command Syntax' : 'Level 3: Full Solution'}
            </span>
            <span className={s.revealBtnPenalty}>(-{preparedHints[hintIdx + 1]?.penalty || 15} XP)</span>
          </button>
        ) : (
          <div className={s.noMore}>✓ All operational intelligence layers unlocked for this mission.</div>
        )}
      </div>
    </div>
  );
}
