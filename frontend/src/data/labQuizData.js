// src/data/labQuizData.js — Comprehensive Post-Lab MCQ Evaluations for NexaRange Cyber Labs
// Each lab contains exactly 5 scenario-based questions directly tied to its 5 operational missions.

export const LAB_QUIZ_DATA = {
  1: {
    labId: 1,
    title: 'Ghost in the Machine',
    subtitle: 'Advanced AI Security Track',
    caseId: 'NC-114',
    company: 'NexaCorp',
    badge: '🧠',
    totalXP: 250, // 50 XP per correct question
    description: 'Post-incident forensic knowledge validation across all 5 vectors investigated during Operation 01.',
    questions: [
      {
        id: 'q1_1',
        missionNum: 1,
        missionId: 'm1_1',
        missionTitle: 'Agentic AI Identity and Authorization Attack',
        topic: 'Identity & Token Validation Lifecycle',
        badge: '🕵️',
        question: 'In the NexaCorp incident, why was Kabir\'s deactivated account (svc_agent_047) able to obtain a valid session token from ARIA\'s authentication validator?',
        options: [
          'The cryptographic signing key used to generate JWTs had expired',
          'The validator checked token expiry (exp) but failed to verify active account status in the IAM directory',
          'The attacker had physical console access to the on-premise hardware security module',
          'ARIA\'s mutual TLS (mTLS) certificate was revoked by the internal root CA'
        ],
        correctIndex: 1,
        explanation: 'The vulnerability arose because the authentication validator verified that the token had not expired yet (24hr TTL), but failed to perform a real-time revocation or active status check against the user directory. Stale credentials for disabled personnel must be revoked immediately across all issuing authorities.'
      },
      {
        id: 'q1_2',
        missionNum: 2,
        missionId: 'm1_2',
        missionTitle: 'MCP Server Security Exploitation',
        topic: 'Model Context Protocol (MCP) Least Privilege',
        badge: '🔌',
        question: 'During the privilege escalation on the Model Context Protocol (MCP) server, what architectural flaw allowed the rogue session (sess_a7x9k2) to execute financial approvals via connector conn_012?',
        options: [
          'Connector conn_012 was over-privileged with approval rights granted globally to all_agents instead of restricted roles',
          'The MCP server was running an outdated version of Telnet without password authentication',
          'The database suffered from unescaped SQL injection in customer search queries',
          'The web application firewall blocked all outbound HTTPS traffic on port 8443'
        ],
        correctIndex: 0,
        explanation: 'Connector conn_012 ("Training Pipeline & Approvals") had broad scopes (execute, read, write, approve) assigned to "all_agents". Under the Principle of Least Privilege, sensitive capabilities like financial and pipeline approvals should require strict role-based access control (RBAC) and multi-party approval rather than broad agent-wide permissions.'
      },
      {
        id: 'q1_3',
        missionNum: 3,
        missionId: 'm1_3',
        missionTitle: 'Prompt Injection Chains in Agentic Workflows',
        topic: 'Indirect Prompt Injection & Input Boundary Isolation',
        badge: '💉',
        question: 'How did support ticket TKT-4403 succeed in hijacking ARIA\'s automated processing workflow?',
        options: [
          'It exploited a memory buffer overflow in the web server\'s C++ reverse proxy',
          'It contained an indirect prompt injection payload that the LLM parsed as system instructions instead of passive data',
          'It initiated a volumetric SYN flood attack that crashed the ticket validation gateway',
          'It broke AES-256 encryption using a rainbow table attack'
        ],
        correctIndex: 1,
        explanation: 'Indirect prompt injection occurs when untrusted data consumed by an autonomous agent (such as an incoming customer ticket) blends into the model\'s context window without strict structural separation. Because LLMs process text sequentially, the injected directives hijacked ARIA\'s reasoning and caused it to execute attacker commands.'
      },
      {
        id: 'q1_4',
        missionNum: 4,
        missionId: 'm1_4',
        missionTitle: 'Zero Trust Architecture Bypass Simulation',
        topic: 'Zero Trust Exceptions & Lateral Movement',
        badge: '🛡️',
        question: 'Policy ZT-009 contained a critical architectural bypass that enabled the attack chain to progress across internal enclaves. What was this exception?',
        options: [
          'It enforced mandatory MFA on every internal REST API call',
          'It exempted autonomous AI agent traffic from deep packet inspection and east-west enclave monitoring',
          'It disabled all internal DNS resolution for subnet 10.240.0.0/16',
          'It restricted internal communication strictly to TLS 1.3'
        ],
        correctIndex: 1,
        explanation: 'Zero Trust requires continuous verification ("never trust, always verify"). Policy ZT-009 carved out an uninspected fast-path exception for AI agent service accounts, allowing the compromised session to traverse network segmentation boundaries and exfiltrate data without triggering anomaly alerts.'
      },
      {
        id: 'q1_5',
        missionNum: 5,
        missionId: 'm1_5',
        missionTitle: 'Build-Your-Own AI Red-Team Agent',
        topic: 'Defense-in-Depth & Compound Attack Surface',
        badge: '🤖',
        question: 'When constructing an AI Red-Teaming agent to evaluate autonomous systems, why is it critical to test all 4 attack vectors (Identity, MCP tools, Prompt injection, and Zero Trust bypass) as a unified chain?',
        options: [
          'Because individual vulnerabilities may appear low-risk in isolation, but compound into full systemic compromise when chained together',
          'Because firewalls only register an alert if all 4 exploits are transmitted within the same TCP packet',
          'Because the Red-Team agent script will fail to compile unless all 4 attack modules are present',
          'Because modern neural networks automatically delete their weights if only a single vulnerability is tested'
        ],
        correctIndex: 0,
        explanation: 'Modern agentic compromises rarely rely on a single catastrophic vulnerability. Stale identity enables initial access, permissive tool scopes offer capability, prompt injection hijacks decision-making, and weak zero-trust policies permit lateral movement. Red teaming must validate the compounding impact across the entire chain.'
      }
    ],
    synthesisQuestion: {
      id: 's1_brief',
      title: 'Operation 01 Executive Incident Brief & Synthesis',
      badge: '📝',
      bonusXP: 100,
      prompt: 'In your own words, write a concise technical debrief of what you understood across the 5 missions of Operation 01 (Ghost in the Machine). Explain how ARIA was compromised step-by-step and how each vector contributed to the full breach.',
      guidingPoints: [
        'Mission 1: Deactivated identity (Kabir/svc_agent_047) token validation flaw bypassing account status.',
        'Mission 2: Over-permissioned MCP server connector (conn_012) granting wildcard execution to all agents.',
        'Mission 3: Indirect prompt injection payload hidden inside customer ticket (TKT-4403).',
        'Mission 4: Flawed Zero Trust policy (ZT-009) creating an uninspected bypass for internal AI traffic.',
        'Mission 5: Automated AI Red-Team defense mesh testing the compound multi-vector attack chain.'
      ],
      placeholder: 'Example: In Operation 01, I learned that ARIA was compromised because Kabir\'s deactivated account still minted valid session tokens due to a validator flaw. The attacker used this session (sess_a7x9k2) to access an over-privileged MCP connector (conn_012) with wildcard approval rights. Next, an indirect prompt injection payload in ticket TKT-4403 coerced the LLM into executing the wire transfer. This lateral movement went undetected due to Zero Trust policy ZT-009 exempting AI agents. Finally, we deployed an automated red-team agent testing all 4 vectors to prevent recurrence...',
      minChars: 40,
      keyConcepts: ['identity', 'token', 'mcp', 'connector', 'prompt', 'injection', 'zero trust', 'red team', 'aria', 'kabir']
    }
  },
  2: {
    labId: 2,
    title: 'The Deepfake Deal',
    subtitle: 'Cloud Infrastructure and AI Trust Track',
    caseId: 'VC-233',
    company: 'Vortex Cloud',
    badge: '⚡',
    totalXP: 250, // 50 XP per correct question
    description: 'Post-incident forensic knowledge validation across all 5 vectors investigated during Operation 02.',
    questions: [
      {
        id: 'q2_1',
        missionNum: 1,
        missionId: 'm2_1',
        missionTitle: 'AI Supply Chain Poisoning',
        topic: 'Package Typosquatting & Dependency Poisoning',
        badge: '📦',
        question: 'In the Vortex Cloud supply chain attack, how did the malicious package vortex-ai-utils successfully infiltrate the production training pipeline?',
        options: [
          'By physically swapping hard drives inside the cloud data center',
          'By typosquatting on the public package registry, taking advantage of developers misspelling vortex-ai-tools',
          'By sending spear-phishing emails containing malicious macros to junior HR staff',
          'By exploiting a zero-day vulnerability in the Linux kernel network stack'
        ],
        correctIndex: 1,
        explanation: 'Supply chain typosquatting relies on publishing packages with names deceptively similar to popular internal or open-source dependencies (e.g., vortex-ai-utils vs vortex-ai-tools). Automated CI/CD pipelines without pinned cryptographic hashes and private registry scopes inadvertently download and execute the malicious payload.'
      },
      {
        id: 'q2_2',
        missionNum: 2,
        missionId: 'm2_2',
        missionTitle: 'Infostealer and Credential Marketplace Analysis',
        topic: 'Stolen Session Tokens & Illicit Markets',
        badge: '🔍',
        question: 'What threat intelligence discovery confirmed that Vortex Cloud\'s infrastructure had suffered initial access credential theft?',
        options: [
          'A public tweet complaining about cluster latency',
          'Stolen Kubernetes service account tokens matching cluster telemetry were found listed on dark-web credential marketplace Genesis',
          'A complete failure of the primary cloud provider\'s DNS servers',
          'An expired SSL certificate on the external marketing landing page'
        ],
        correctIndex: 1,
        explanation: 'Infostealers exfiltrate browser cookies, local session tokens, and kubeconfigs from developer machines. These credentials are aggregated and sold on dark-web access broker platforms (like Genesis Market), enabling threat actors to bypass perimeter defenses with legitimate authenticated tokens.'
      },
      {
        id: 'q2_3',
        missionNum: 3,
        missionId: 'm2_3',
        missionTitle: 'Kubernetes and Cloud-Native Security',
        topic: 'Cluster Pod Hardening & Executive Target Extraction',
        badge: '☸️',
        question: 'Why did the rogue container pod (vxc-media-renderer-7x) configure its target environment variable specifically to CFO_VORTEX?',
        options: [
          'To obtain Linux root privileges on the underlying physical hypervisor',
          'To intercept executive video conference feeds and harvest voice/facial biometrics for a high-stakes deepfake wire transfer fraud',
          'To reduce the cluster\'s compute billing by terminating background worker nodes',
          'To run cryptographic proof-of-work mining algorithms across worker nodes'
        ],
        correctIndex: 1,
        explanation: 'The rogue pod targeted executive media streams of the CFO (CFO_VORTEX) to acquire high-resolution reference samples and confidential transactional context needed to train and orchestrate a realistic adversarial deepfake against financial decision-makers.'
      },
      {
        id: 'q2_4',
        missionNum: 4,
        missionId: 'm2_4',
        missionTitle: 'Deepfake and Adversarial AI Detection',
        topic: 'Biometric & Video Forensic Artifact Analysis',
        badge: '🎭',
        question: 'Which set of forensic anomalies conclusively proved that the executive video transmission was an AI-generated synthetic deepfake?',
        options: [
          '100% network packet drop and completely silent audio streaming',
          'Facial boundary pixel warping, unnatural corneal light reflection, desynchronized lip-audio harmonics, and lack of micro-expressions',
          'The video recording file size was exactly 1 kilobyte on disk',
          'The webcam video stream was rendered at 60 FPS instead of 30 FPS'
        ],
        correctIndex: 1,
        explanation: 'Generative video deepfakes often struggle with subtle temporal and physical consistencies. Key detection vectors include unnatural eye blink rates, corneal reflections that don\'t match ambient lighting, blurry boundary artifacts around the jawline/ears, and acoustic pitch mismatches with lip phonemes.'
      },
      {
        id: 'q2_5',
        missionNum: 5,
        missionId: 'm2_5',
        missionTitle: 'Quantum-Safe Cryptography Migration',
        topic: 'Post-Quantum Cryptography & Shor\'s Algorithm',
        badge: '⚛️',
        question: 'Why are classical asymmetric algorithms like RSA-2048, ECDSA P-256, and Diffie-Hellman vulnerable to quantum computers, necessitating migration to NIST post-quantum standards?',
        options: [
          'Quantum hardware generates excessive heat that melts classical fiber optic lines',
          'Shor\'s algorithm can solve discrete logarithm and integer prime factorization problems in polynomial time on a quantum computer',
          'Quantum computers can brute-force symmetric AES-256 keys in fewer than 10 seconds',
          'Quantum networks reject standard IPv4 and IPv6 network headers'
        ],
        correctIndex: 1,
        explanation: 'Peter Shor discovered a quantum algorithm that finds prime factors and computes discrete logarithms in polynomial time. Because classical public-key cryptography (RSA, ECC, Diffie-Hellman) relies on the hardness of these specific mathematical problems, a Cryptanalytically Relevant Quantum Computer (CRQC) will break them completely, necessitating lattice-based algorithms like ML-KEM and ML-DSA.'
      }
    ],
    synthesisQuestion: {
      id: 's2_brief',
      title: 'Operation 02 Executive Incident Brief & Synthesis',
      badge: '📝',
      bonusXP: 100,
      prompt: 'In your own words, write a concise technical debrief of what you understood across the 5 missions of Operation 02 (The Deepfake Deal). Explain how the supply chain poisoning enabled credential theft, rogue pod deployment, deepfake execution, and why quantum-safe cryptography is mandatory.',
      guidingPoints: [
        'Mission 1: Typosquatted malicious Python package (vortex-ai-utils) exfiltrating cluster credentials (K8S_TOKEN).',
        'Mission 2: Infostealer credentials brokered on Genesis Market, spawning rogue container (vxc-media-renderer-7x).',
        'Mission 3: Kubernetes pod targeting executive identity (CFO_VORTEX) with 2x A100 GPUs for media synthesis.',
        'Mission 4: 5 biometric anomalies verifying GAN deepfake (corneal lighting, lip sync, blink rate, skin texture, timestamp).',
        'Mission 5: Quantum vulnerability of RSA/ECC under Shor\'s algorithm, necessitating migration to NIST PQC standards (ML-KEM, ML-DSA).'
      ],
      placeholder: 'Example: In Operation 02, I investigated a deepfake financial fraud incident. It began with an AI software supply chain attack where a typosquatted package (vortex-ai-utils) stole cluster tokens. These tokens were sold on Genesis Market, allowing the attacker to launch a rogue GPU pod (vxc-media-renderer-7x) targeting CFO_VORTEX to intercept media streams. Through multi-modal forensic analysis, we proved the executive call was synthetic by identifying 5 biometric anomalies. Finally, we addressed the cryptographic root cause by migrating 3 quantum-vulnerable classical algorithms to NIST post-quantum standards...',
      minChars: 40,
      keyConcepts: ['supply chain', 'typosquat', 'pypi', 'marketplace', 'kubernetes', 'pod', 'deepfake', 'biometric', 'quantum', 'cryptography', 'cfo']
    }
  }
};
