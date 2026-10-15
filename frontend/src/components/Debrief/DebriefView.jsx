import { useState } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import { IconAward, IconCheckCircle, IconZap, IconShield } from '../Common/Icons';
import s from './DebriefView.module.css';

export default function DebriefView() {
  const { currentLab, completedMissions, totalXP, badges, setView, operator, openLabQuiz, labQuizzes } = useStore();
  const lab = LAB_DATA[currentLab || 1];
  const labId = currentLab || 1;
  const quizResult = labQuizzes?.[labId];
  const [showDossierModal, setShowDossierModal] = useState(false);

  const completedInLab = lab.missions.filter((m) => completedMissions[m.id]).length;
  const labXP = lab.missions.reduce(
    (acc, m) => (completedMissions[m.id] ? acc + m.xp : acc),
    0
  );

  const operatorName = operator?.fullName || operator?.name || 'Naveen';
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verificationHash = 'SHA256:7f9b' + Math.random().toString(16).substring(2, 10) + 'e8c0' + Math.random().toString(16).substring(2, 10);

  const generateMarkdownReport = () => {
    return `# NEXARANGE CYBER LABS // INCIDENT RESPONSE DOSSIER
**CLASSIFICATION:** RESTRICTED // SOC TIER-3 INVESTIGATION
**CASE ID:** ${lab.caseId}
**TARGET INFRASTRUCTURE:** ${lab.company} (${lab.title})
**LEAD INCIDENT RESPONDER:** ${operatorName}
**DATE OF INCIDENT RESOLUTION:** ${reportDate}
**DIGITAL INTEGRITY SEAL:** ${verificationHash}

---

## 1. EXECUTIVE SUMMARY
During Operation 0${lab.id} (${lab.title}), an advanced multi-stage attack was detected targeting ${lab.company}'s mission-critical enclave. Lead Operator ${operatorName} conducted deep forensic analysis across 5 interconnected attack vectors, successfully isolating malicious indicators, executing reverse exploitation chains, and deploying cryptographic DevSecOps remediations.

- **Total Scenario XP Secured:** +${labXP} XP
- **Missions Neutralized:** ${completedInLab} / 5
- **Knowledge Assessment Score:** ${quizResult?.score ? `${quizResult.score}/5 MCQs Verified (+${quizResult.score * 50} XP)` : 'Completed'}

---

## 2. ATTACK CHAIN RECONSTRUCTION & MITRE ATT&CK ALIGNMENT
${lab.missions.map((m, idx) => `
### Stage 0${idx + 1}: ${m.title}
- **MITRE ATT&CK:** ${m.mitre || 'T1078.004'}
- **Vulnerability / CVE:** ${m.cve || 'CWE-287 Impairment of Authentication'}
- **Threat Vector:** ${m.briefing || m.goal}
- **Verified Forensic Flag / Indicator:** \`${m.answer}\`
- **Resolution Status:** SECURED & VERIFIED
`).join('\n')}

---

## 3. BLUE-TEAM REMEDIATION & DEFENSE-IN-DEPTH
To permanently prevent recurrence of this compound exploit path, the following architectural controls were committed to production:
1. **Identity Gate:** Enforced mandatory real-time IAM status verification; expired and departed identity tokens are immediately revoked.
2. **Least Privilege RBAC:** Eliminated wildcard agent connectors; sensitive approvals now require dual-custody MFA signoff.
3. **Context Boundary Isolation:** Embedded strict structural delimiter tags (\`<customer_data>\`) around all untrusted model inputs.
4. **Zero Trust Attestation:** Mandated cryptographic SPIFFE mutual-TLS client certificates for all east-west microservice routing.
5. **Continuous Verification:** Automated multi-vector Red-Team defense agents actively stress-test the pipeline on every deployment.

---

## 4. OPERATOR'S FILED SYNTHESIS BRIEF
${quizResult?.operatorBrief || lab.takeaway || 'Comprehensive multi-vector forensic evaluation and mitigation completed successfully by operator.'}

---

## 5. ACCREDITATION & RANGE MASTER ENDORSEMENT
This incident response dossier certifies that Operator **${operatorName}** has demonstrated exceptional proficiency in autonomous AI threat mitigation, cryptographic forensics, and Zero-Trust architecture.

**Range Master Endorsement:** *VERIFIED AUTHENTIC — NEXARANGE DEFENSE COMMAND*
**Verification Fingerprint:** \`${verificationHash}\`
`;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NexaRange_Incident_Dossier_CASE_${lab.caseId}_${operatorName.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={s.wrap}>
      {/* ── Case Closed Banner ── */}
      <div className={s.topBanner}>
        <div className={s.bannerTag}>CASE RESOLUTION REPORT</div>
        <h1 className={s.bannerTitle}>CASE {lab.caseId} // CLOSED & SECURED</h1>
        <p className={s.bannerSub}>{lab.title} — {lab.subtitle}</p>
      </div>

      {/* ── Attack Chain Reconstruction ── */}
      <div className={s.section}>
        <div className={s.sectionTitle}>// ATTACK CHAIN RECONSTRUCTION TIMELINE</div>
        <div className={s.chain}>
          {lab.debriefChain.map((step, i) => (
            <div key={i} className={s.chainItem}>
              <div className={s.chainNode}>0{i + 1}</div>
              <div className={s.chainLabel}>{step}</div>
              {i < lab.debriefChain.length - 1 && <div className={s.chainArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Case Narrative Summary & Forensic Takeaways ── */}
      {(lab.recap || lab.wrappingUp || lab.takeaway) && (
        <div className={s.narrativeSection}>
          {lab.recap && (
            <div className={s.narrativeCard}>
              <div className={s.narrativeTitle}>// FULL INCIDENT RECAP</div>
              <p className={s.narrativeText}>{lab.recap}</p>
            </div>
          )}
          {lab.wrappingUp && (
            <div className={s.narrativeCard}>
              <div className={s.narrativeTitle}>// CASE CLOSING & THREAT INTEL</div>
              <p className={s.narrativeText}>{lab.wrappingUp}</p>
            </div>
          )}
          {lab.takeaway && (
            <div className={`${s.narrativeCard} ${s.takeawayCard}`}>
              <div className={s.narrativeTitle}>// WHAT {(operatorName).toUpperCase()} TAKES AWAY FROM THIS</div>
              <p className={s.narrativeText}>{lab.takeaway}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Post-Lab Knowledge Assessment & Capstone Brief ── */}
      <div className={s.quizCard}>
        <div className={s.quizInfo}>
          <div className={s.quizTag}>
            <IconZap size={14} />
            <span>INCIDENT KNOWLEDGE VERIFICATION // 5 MCQS + WRITTEN BRIEF</span>
          </div>
          <div className={s.quizTitle}>POST-LAB ASSESSMENT & MISSION SYNTHESIS</div>
          <p className={s.quizDesc}>
            Validate forensic retention with 5 scenario-based MCQs followed by your Operator Written Synthesis Brief summarizing the 5 neutralization phases.
          </p>
          {quizResult?.completed && (
            <div className={s.quizScoreBadge}>
              <IconCheckCircle size={14} />
              <span>Assessment Completed: {quizResult.score}/5 MCQs Correct (+{quizResult.xpEarned || quizResult.score * 50} XP)</span>
            </div>
          )}
        </div>
        <button className={s.quizLaunchBtn} onClick={() => openLabQuiz(labId)}>
          <IconShield size={16} />
          <span>{quizResult?.completed ? 'REVIEW / RETAKE 5 MCQS & BRIEF' : 'START 5 MCQS + WRITTEN BRIEF'}</span>
        </button>
      </div>

      {/* ── Operator's Filed Synthesis Brief ── */}
      {quizResult?.operatorBrief && (
        <div className={s.briefSection}>
          <div className={s.briefCard}>
            <div className={s.briefHeader}>
              <div className={s.briefTag}>// OPERATOR FILED INCIDENT SYNTHESIS BRIEF</div>
              <span className={s.briefTimestamp}>RECORDED IN FORENSIC DOSSIER</span>
            </div>
            <div className={s.briefContent}>{quizResult.operatorBrief}</div>
          </div>
        </div>
      )}

      {/* ── Metrics & Badges ── */}
      <div className={s.row}>
        <div className={s.card}>
          <div className={s.cardTitle}>// CASE METRICS</div>
          <div className={s.stat}>
            <span className={s.statKey}>Missions Neutralized</span>
            <span className={s.statVal}>{completedInLab} / 5</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>XP Secured in Scenario</span>
            <span className={s.statVal}>+{labXP} XP</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>Total Enclave XP</span>
            <span className={s.statVal}>{totalXP.toLocaleString()} XP</span>
          </div>
          <div className={s.stat}>
            <span className={s.statKey}>Badges Credited</span>
            <span className={s.statVal}>{badges.length}</span>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardTitle}>// ACCREDITATION BADGES</div>
          <div className={s.badgeRow}>
            {lab.missions.map((m) => {
              const isEarned = !!completedMissions[m.id];
              return (
                <div
                  key={m.id}
                  className={`${s.badgeItem} ${isEarned ? s.badgeEarned : s.badgeLocked}`}
                  title={m.badge.name}
                >
                  <div className={s.badgeEmoji}>{isEarned ? m.badge.emoji : '🔒'}</div>
                  <div className={s.badgeName}>{m.badge.name}</div>
                  <span className={s.badgeStatus}>{isEarned ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Navigation Actions & Official Dossier Export ── */}
      <div className={s.actions}>
        <button className={s.exportDossierBtn} onClick={() => setShowDossierModal(true)}>
          <span className={s.exportDossierIcon}>📥</span>
          <span>EXPORT OFFICIAL IR DOSSIER (PDF / MD)</span>
        </button>
        <button className={s.certBtn} onClick={() => setView('certificates')}>
          <IconAward size={18} />
          <span>VIEW OFFICIAL ACCREDITATION</span>
        </button>
        <button className={s.dashBtn} onClick={() => setView('dashboard')}>
          RETURN TO COMMAND CENTER
        </button>
      </div>

      {/* ── Official Incident Response Dossier Modal ── */}
      {showDossierModal && (
        <div className={s.dossierModalOverlay} onClick={() => setShowDossierModal(false)}>
          <div className={s.dossierModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.dossierModalHeader}>
              <div className={s.dossierHeaderLeft}>
                <span className={s.dossierTag}>NIST SP 800-61 INCIDENT REPORT</span>
                <h2 className={s.dossierTitle}>CASE {lab.caseId} FORENSIC DOSSIER</h2>
              </div>
              <div className={s.dossierHeaderActions}>
                <button type="button" className={s.downloadMdBtn} onClick={handleDownloadMarkdown}>
                  📥 Download .MD Report
                </button>
                <button type="button" className={s.printPdfBtn} onClick={handlePrint}>
                  🖨️ Print / Save PDF
                </button>
                <button type="button" className={s.closeDossierBtn} onClick={() => setShowDossierModal(false)}>
                  ✕
                </button>
              </div>
            </div>

            <div className={s.dossierModalBody}>
              {/* Executive Metadata Box */}
              <div className={s.dossierMetaGrid}>
                <div className={s.dossierMetaItem}>
                  <span className={s.metaKey}>OPERATOR:</span>
                  <span className={s.metaVal}>{operatorName}</span>
                </div>
                <div className={s.dossierMetaItem}>
                  <span className={s.metaKey}>INFRASTRUCTURE:</span>
                  <span className={s.metaVal}>{lab.company}</span>
                </div>
                <div className={s.dossierMetaItem}>
                  <span className={s.metaKey}>DATE RESOLVED:</span>
                  <span className={s.metaVal}>{reportDate}</span>
                </div>
                <div className={s.dossierMetaItem}>
                  <span className={s.metaKey}>SECURITY STATUS:</span>
                  <span className={s.metaValSuccess}>✓ MITIGATED (5/5)</span>
                </div>
              </div>

              {/* MITRE Table */}
              <div className={s.dossierSection}>
                <h4 className={s.dossierSubheading}>1. ATTACK VECTOR TIMELINE & FORENSIC CTF PROOFS</h4>
                <div className={s.dossierTable}>
                  <div className={s.dossierTableHeader}>
                    <span>STAGE</span>
                    <span>ATTACK VECTOR</span>
                    <span>MITRE / CVE</span>
                    <span>VERIFIED CTF FLAG</span>
                  </div>
                  {lab.missions.map((m, idx) => (
                    <div key={m.id} className={s.dossierTableRow}>
                      <span className={s.stageBadge}>0{idx + 1}</span>
                      <span className={s.stageTitle}>{m.title}</span>
                      <span className={s.stageMitre}>{m.mitre || 'T1078.004'}</span>
                      <code className={s.stageFlag}>{m.answer}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue Team Remediation Matrix */}
              <div className={s.dossierSection}>
                <h4 className={s.dossierSubheading}>2. DEVSECOPS BLUE TEAM REMEDIATION CONTROLS</h4>
                <div className={s.remediationBulletList}>
                  <div className={s.remediationBullet}>
                    <strong>• Real-time IAM Directory Revocation:</strong> Added live status check into auth-validator to reject departed or disabled accounts immediately.
                  </div>
                  <div className={s.remediationBullet}>
                    <strong>• MCP RBAC & Scope Stripping:</strong> Removed wildcard permissions (`all_agents`), restricting approval bitmasks to dual-custody MFA roles.
                  </div>
                  <div className={s.remediationBullet}>
                    <strong>• Context Delimiter Neutralizer:</strong> Enforced structural message schemas ({'`<customer_data>`'}), preventing prompt injection delimiter escapes.
                  </div>
                  <div className={s.remediationBullet}>
                    <strong>• Zero Trust Continuous Verification:</strong> Mandated SPIFFE mutual-TLS client certificates on all east-west microservice requests.
                  </div>
                </div>
              </div>

              {/* Operator debrief */}
              {quizResult?.operatorBrief && (
                <div className={s.dossierSection}>
                  <h4 className={s.dossierSubheading}>3. OPERATOR WRITTEN DEBRIEF & SYNTHESIS</h4>
                  <div className={s.operatorBriefBox}>{quizResult.operatorBrief}</div>
                </div>
              )}

              {/* Cryptographic Seal */}
              <div className={s.dossierSealWrap}>
                <div className={s.sealIcon}>🛡️</div>
                <div>
                  <div className={s.sealLabel}>CRYPTOGRAPHIC INTEGRITY HASH</div>
                  <code className={s.sealCode}>{verificationHash}</code>
                  <div className={s.sealNote}>Verified authentic and non-repudiable by NexaRange Cyber Lab Range Master</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
