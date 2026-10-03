// src/components/Certificates/CertificatesView.jsx — Official Credentials Vault
import { useState } from 'react';
import useStore from '../../store/useStore';
import { LAB_DATA } from '../../data/labData';
import {
  IconAward,
  IconLock,
  IconUnlock,
  IconDownload,
  IconCheckCircle,
  IconShield,
} from '../Common/Icons';
import s from './CertificatesView.module.css';

export default function CertificatesView() {
  const { completedMissions, showToast, operator } = useStore();
  const [activeCert, setActiveCert] = useState(null);

  const certData = [
    {
      labId: 1,
      caseId: 'NC-114',
      track: 'AI Security Operations',
      name: 'Advanced AI Security Analyst (AISA)',
      code: 'NR-AISA-9941',
      issuer: 'NexaRange Cyber Range Institute',
      completedCount: LAB_DATA[1]?.missions.filter((m) => completedMissions[m.id]).length || 0,
      totalCount: LAB_DATA[1]?.missions.length || 5,
      isUnlocked: (LAB_DATA[1]?.missions.filter((m) => completedMissions[m.id]).length || 0) === 5,
      requirements: 'Neutralize all 5 autonomous agent attack vectors in Lab 01',
      description: 'Accreditation verifying demonstrated capability in detecting token validator bypasses, MCP connector privilege escalation, prompt injections, and zero-trust policy enforcement.',
    },
    {
      labId: 2,
      caseId: 'VC-233',
      track: 'Cloud Infrastructure & Synthetic Media',
      name: 'Cloud Forensics & Deepfake Incident Specialist (CFDIS)',
      code: 'NR-CFDIS-8402',
      issuer: 'NexaRange Cyber Range Institute',
      completedCount: LAB_DATA[2]?.missions.filter((m) => completedMissions[m.id]).length || 0,
      totalCount: LAB_DATA[2]?.missions.length || 5,
      isUnlocked: (LAB_DATA[2]?.missions.filter((m) => completedMissions[m.id]).length || 0) === 5,
      requirements: 'Complete all 5 cloud investigation & cryptographic migration vectors in Lab 02',
      description: 'Accreditation validating competence in analyzing synthetic audio deepfakes, malicious Python wheel supply chains, rogue Kubernetes workloads, and quantum-resistant algorithm transitions.',
    },
    {
      labId: 3,
      caseId: 'ON-307',
      track: 'AI Red Teaming & LLM Defense',
      name: 'Advanced LLM Security & RAG Defense Specialist (ALSD)',
      code: 'NR-ALSD-3071',
      issuer: 'NexaRange Cyber Range Institute',
      completedCount: LAB_DATA[3]?.missions.filter((m) => completedMissions[m.id]).length || 0,
      totalCount: LAB_DATA[3]?.missions.length || 5,
      isUnlocked: (LAB_DATA[3]?.missions.filter((m) => completedMissions[m.id]).length || 0) === 5,
      requirements: 'Neutralize all 5 vector poisoning & jailbreak attack vectors in Lab 03',
      description: 'Accreditation verifying mastery in vector database knowledge corruption detection, indirect prompt injection mitigation, unauthorized MCP tool audit, and neural defense mesh deployment.',
    },
    {
      labId: 4,
      caseId: 'AG-418',
      track: 'SOC Defense & Incident Response',
      name: 'Enterprise Ransomware Incident Responder (ERIR)',
      code: 'NR-ERIR-4188',
      issuer: 'NexaRange Cyber Range Institute',
      completedCount: LAB_DATA[4]?.missions.filter((m) => completedMissions[m.id]).length || 0,
      totalCount: LAB_DATA[4]?.missions.length || 5,
      isUnlocked: (LAB_DATA[4]?.missions.filter((m) => completedMissions[m.id]).length || 0) === 5,
      requirements: 'Contain all 5 ransomware lateral movement & extortion vectors in Lab 04',
      description: 'Accreditation certifying capability in Sysmon phishing macro tracing, dark web extortion intelligence, Kubernetes cryptor containment, synthetic audio forensics, and memory key extraction.',
    },
    {
      labId: 5,
      caseId: 'TF-590',
      track: 'Application Security & API Defense',
      name: 'Cloud API & Zero-Day Penetration Tester (CZPT)',
      code: 'NR-CZPT-5902',
      issuer: 'NexaRange Cyber Range Institute',
      completedCount: LAB_DATA[5]?.missions.filter((m) => completedMissions[m.id]).length || 0,
      totalCount: LAB_DATA[5]?.missions.length || 5,
      isUnlocked: (LAB_DATA[5]?.missions.filter((m) => completedMissions[m.id]).length || 0) === 5,
      requirements: 'Eliminate all 5 OWASP API security vulnerabilities in Lab 05',
      description: 'Accreditation validating expertise in Broken Object Level Authorization (BOLA), JWT algorithm confusion attacks, production GraphQL introspection defense, and API gateway zero-trust quarantines.',
    },
  ];

  return (
    <div className={s.wrap}>
      {/* ── Page Header ── */}
      <div className={s.header}>
        <div>
          <h1 className={s.title}>OPERATIONAL CREDENTIALS VAULT</h1>
          <p className={s.subtitle}>
            Cryptographically sealed certifications awarded upon successful resolution and forensic debrief of full-spectrum cyber incidents.
          </p>
        </div>
      </div>

      {/* ── Certificate Cards Grid ── */}
      <div className={s.certsGrid}>
        {certData.map((c) => {
          const progressPct = Math.round((c.completedCount / c.totalCount) * 100);

          return (
            <div
              key={c.code}
              className={`${s.certCard} ${c.isUnlocked ? s.cardUnlocked : s.cardLocked}`}
            >
              <div className={s.cardTopRow}>
                <span className={s.caseBadge}>CASE: {c.caseId}</span>
                <span className={`${s.statusBadge} ${c.isUnlocked ? s.statusUnlocked : s.statusLocked}`}>
                  {c.isUnlocked ? (
                    <>
                      <IconCheckCircle size={14} /> UNLOCKED & ISSUED
                    </>
                  ) : (
                    <>
                      <IconLock size={14} /> IN PROGRESS
                    </>
                  )}
                </span>
              </div>

              {/* Certificate Seal Emblem */}
              <div className={s.sealArea}>
                <div className={`${s.sealCircle} ${c.isUnlocked ? s.sealActive : ''}`}>
                  <IconAward size={36} />
                </div>
              </div>

              <div className={s.certDetails}>
                <span className={s.trackLabel}>{c.track.toUpperCase()}</span>
                <h3 className={s.certName}>{c.name}</h3>
                <p className={s.certDesc}>{c.description}</p>
              </div>

              {/* Requirements & Progress */}
              <div className={s.progressSection}>
                <div className={s.progLabelRow}>
                  <span className={s.reqText}>{c.requirements}</span>
                  <span className={s.progNumbers}>
                    {c.completedCount} / {c.totalCount} ({progressPct}%)
                  </span>
                </div>
                <div className={s.progressBar}>
                  <div
                    className={s.progressFill}
                    style={{
                      width: `${progressPct}%`,
                      background: c.isUnlocked ? 'var(--status-success)' : 'var(--cyan-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className={s.cardActions}>
                {c.isUnlocked ? (
                  <button className={s.viewCertBtn} onClick={() => setActiveCert(c)}>
                    <IconAward size={16} />
                    <span>VIEW ACCREDITATION</span>
                  </button>
                ) : (
                  <div className={s.lockedNotice}>
                    <IconLock size={14} />
                    <span>Complete {c.totalCount - c.completedCount} more missions in Operation 0{c.labId} to unlock</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Certificate Preview Modal ── */}
      {activeCert && (
        <div className={s.modalBackdrop} onClick={() => setActiveCert(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Parchment Styled Certificate Document */}
            <div className={s.certDoc}>
              <div className={s.docBorder}>
                <div className={s.docCornerTopLeft} />
                <div className={s.docCornerTopRight} />
                <div className={s.docCornerBottomLeft} />
                <div className={s.docCornerBottomRight} />

                <div className={s.docHeader}>
                  <div className={s.docOrg}>NEXARANGE CYBER RANGE OPERATIONS</div>
                  <div className={s.docSeal}>SEAL OF PROFESSIONAL DEMONSTRATION</div>
                  <h2 className={s.docTitle}>CERTIFICATE OF OPERATIONAL MASTERY</h2>
                </div>

                <div className={s.docBody}>
                  <p className={s.certifyText}>This credential hereby confirms that security operator</p>
                  <div className={s.operatorNameDisplay}>{operator.name.toUpperCase()}</div>
                  <p className={s.competencyText}>
                    has successfully solved, mitigated, and forensically documented all threat stages within the enterprise incident scenario:
                  </p>
                  <div className={s.accreditationTitle}>{activeCert.name}</div>
                  <p className={s.caseNotice}>Case Enclave: {activeCert.caseId} • {activeCert.track}</p>
                </div>

                <div className={s.docFooter}>
                  <div className={s.signCol}>
                    <div className={s.signatureLine}>Devika Rao / AI SecOps Lead</div>
                    <span className={s.signLabel}>INCIDENT COMMAND CHAIR</span>
                  </div>

                  <div className={s.hashCol}>
                    <span className={s.hashLabel}>VERIFICATION SERIAL</span>
                    <span className={s.hashVal}>{activeCert.code}</span>
                    <span className={s.hashDate}>ISSUED: {new Date().toLocaleDateString('en-GB')}</span>
                  </div>

                  <div className={s.signCol}>
                    <div className={s.signatureLine}>NexaRange Range Director</div>
                    <span className={s.signLabel}>SYSTEMS VERIFICATION</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className={s.modalControls}>
              <button
                className={s.downloadBtn}
                onClick={() => {
                  showToast(`Verification PDF for ${activeCert.code} generated.`, 'success');
                }}
              >
                <IconDownload size={16} />
                <span>DOWNLOAD CREDENTIAL (PDF)</span>
              </button>
              <button className={s.closeModalBtn} onClick={() => setActiveCert(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
