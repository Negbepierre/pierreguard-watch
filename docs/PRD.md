# Product Requirements Document
## PierreGuard Watch — AI Agent & Threat Monitor
**Version:** 1.0
**Author:** Inegbenose Pierre
**Date:** April 2026
**Status:** Live

---

## 1. Problem Statement

The rise of AI agents as a threat vector represents a gap in existing cloud
security tooling. GuardDuty detects known threat signatures. CloudTrail logs
every API call. But neither was designed to reason about whether a series of
API calls is being made by an intelligent agent conducting systematic
reconnaissance rather than a human or a simple script.

AI agents behave differently from both. They make semantically logical call
sequences at machine speed. They exhibit burst-pause timing patterns as the
model processes results between bursts of activity. They use recognisable
framework user agent strings. They sweep multiple services in a short window
because they are executing a comprehensive instruction rather than performing
a specific task.

PierreGuard Watch fills this gap. It monitors CloudTrail and GuardDuty in
real time, applies a structured skills-based reasoning framework to classify
threat patterns including AI agent activity, and delivers immediate alerts
via Slack and email when confidence thresholds are exceeded.

---

## 2. Goal

Build an AI-powered threat monitoring system that:
- Reads live CloudTrail events and GuardDuty findings from an AWS account
- Applies a five-skill reasoning framework to detect AI agents, reconnaissance,
  credential anomalies, unusual read volumes, and cross-service sweeps
- Produces a structured threat report with confidence scoring and classification
- Sends Slack alerts for HIGH findings and email alerts for CRITICAL findings
- Displays a real-time SOC dashboard with threat signals, event feed, and
  AI-generated analysis report

---

## 3. Target Users

| User | Need |
|------|------|
| Security Engineer | Detect AI agent reconnaissance before it enables an attack |
| SOC Analyst | Triage suspicious CloudTrail patterns with AI-assisted context |
| CISO | Understand whether AI agents are probing the AWS environment |
| Cloud Architect | Validate that known-good automation is not being misidentified |

---

## 4. What Makes This Different

Most security tools detect known bad signatures. PierreGuard Watch detects
unknown bad patterns by reasoning about behaviour. The difference is:

A rules engine can flag: user agent contains boto3.
PierreGuard Watch reasons: this principal called ListUsers, then GetUser for
each result, then ListAttachedUserPolicies for interesting users, using a
boto3 user agent, from an IP not in known ranges, touching four service
domains in six minutes. That combination is consistent with an AI agent
conducting pre-attack reconnaissance.

The SKILLS.md file encodes this reasoning as structured protocols that Claude
executes against live data. This is not retrieval-augmented generation where
context is passively injected. It is active decision logic that the agent
follows step by step.

---

## 5. Core Features

### 5.1 Authentication
- Staff login with email and password
- Three demo users covering CSO, Analyst, and SOC Engineer roles
- Session persistence via localStorage

### 5.2 Scan Configuration Screen
- Shows monitored AWS account details
- Displays all five detection skills with descriptions
- Shows alert routing configuration
- One-click scan initiation

### 5.3 CloudTrail Monitoring
- Pulls last 24 hours of management events via boto3
- Extracts user agent strings, source IPs, and call sequences
- Identifies AI framework signatures in user agent strings
- Groups calls by principal for pattern analysis

### 5.4 GuardDuty Integration
- Pulls active findings with severity 4 and above
- Cross-references GuardDuty findings against CloudTrail principals
- Corroborating GuardDuty findings automatically escalate confidence score

### 5.5 Skills-Based Threat Detection
Five skills applied to every scan:

Skill 1 — Reconnaissance Detection: Flags when a principal calls 3 or more
Describe or List operations across different service domains within 10 minutes.

Skill 2 — AI Agent Fingerprint Detection: Identifies AI framework user agent
strings, burst-pause timing patterns, and logically sequenced call chains
characteristic of agentic AI systems.

Skill 3 — Credential Anomaly Detection: Flags GetCallerIdentity as a first
call, unusual source IPs, privilege enumeration patterns, and access from
unexpected regions.

Skill 4 — Unusual Read Volume Detection: Detects data enumeration behaviour
including paginated list operations and sequential resource access patterns.

Skill 5 — Cross-Service Sweep Detection: Flags when a principal touches 4 or
more distinct AWS service domains within 10 minutes, with automatic CRITICAL
escalation if security services are included.

### 5.6 Confidence Scoring
Each skill contributes weighted points to a total confidence score. Final
classification thresholds: LOW (1-3), MEDIUM (4-6), HIGH (7-9), CRITICAL (10+).
Override rules ensure certain combinations always escalate regardless of score.

### 5.7 Alert Routing
- LOW / MEDIUM: Dashboard only
- HIGH: Dashboard + Slack notification to security channel
- CRITICAL: Dashboard + Slack + SES email to security team

### 5.8 Known-Good Allowlist
A configurable allowlist in SKILLS.md prevents known internal service accounts
and automation tools from triggering false positives. Allowlisted principals
have their confidence scores reduced by 50% and are noted in the report.

### 5.9 SOC Dashboard
- Five-stat header: threat level, events analysed, signals detected,
  principals flagged, GuardDuty findings
- Alert dispatch banner when Slack or email has been sent
- Threat Signals panel: flagged principals, detailed signal cards with
  severity badges and AI agent metadata
- AI Threat Analysis Report: tabbed report with Summary, Findings,
  Principals, Actions, Compliance, and GuardDuty sections
- CloudTrail Event Feed: full event table with AI agent highlighting,
  service colour coding, and per-event severity classification

---

## 6. Technical Architecture
[React Frontend — Netlify]
↓ POST /api/watch-scan
[Python Flask Backend — Render]
↓ Load SKILLS.md (reasoning framework)
↓ boto3 — Amazon Bedrock Knowledge Bases
[PierreGuard Security Standards + AI Agent Detection Standards + Playbook]
↓ boto3 — AWS CloudTrail
[Last 24 hours management events]
↓ boto3 — Amazon GuardDuty
[Active threat findings]
↓ Python signal detection (5 skills)
[Pre-detection: AI agent signals, recon patterns, cross-service sweeps]
↓ boto3 — AWS Bedrock Runtime
[Claude 3 Haiku — full skills-based analysis]
↓ Conditional alert routing
[Slack webhook — HIGH and CRITICAL]
[AWS SES email — CRITICAL only]
↓ JSON response
[React SOC Dashboard]

---

## 7. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | SOC dashboard UI |
| Styling | Inline CSS | Consistent dark theme, no Tailwind dependency |
| Backend | Python + Flask | REST API |
| Signal Detection | Custom Python | 5-skill pattern matching |
| AI Analysis | Claude 3 Haiku via AWS Bedrock | Skills-based threat reasoning |
| Knowledge Base | Amazon Bedrock Knowledge Bases | RAG pipeline for security standards |
| Standards | PierreGuard KB (58SGJUBGOB) | AI Agent Detection Standards + Playbook |
| Skills Framework | SKILLS.md | Active reasoning protocols |
| CloudTrail | boto3 | Live API event monitoring |
| GuardDuty | boto3 | Threat finding integration |
| Alerts | Slack Webhook + AWS SES | HIGH and CRITICAL notifications |
| Hosting Frontend | Netlify | Git-connected deployment |
| Hosting Backend | Render | Python, always-on |

---

## 8. Knowledge Base Documents

The PierreGuard Knowledge Base (ID: 58SGJUBGOB) was extended with two new
documents for this project:

**PierreGuard AI Agent Detection Standards v1.0**
Defines the four AI agent signatures (user agent strings, timing patterns,
call sequence logic, cross-service coverage), confidence weights for each,
automatic escalation rules, and compliance alignment to CIS, NIST, ISO 27001,
and SOC 2.

**PierreGuard Threat Detection Playbook v1.0**
Defines the five skills as structured reasoning protocols with trigger
conditions, step-by-step investigation procedures, scoring guides, response
actions, and the required alert format for all notifications.

---

## 9. SKILLS.md Framework

The SKILLS.md file is the core intellectual property of this project. It
defines five skills as active reasoning protocols that the agent executes
against live security data. Unlike RAG where context is passively retrieved,
these skills define how the agent thinks, what it looks for, how it scores
its findings, and what format its output must follow.

The file also defines the known-good allowlist, the scoring aggregation rules,
the final classification thresholds, override rules for automatic escalation,
and a list of patterns that must not be flagged to minimise false positives.

---

## 10. IAM Security Design

Dedicated IAM user `pierreguard-watch-dev` with minimum required permissions:

| Policy | Access Level | Purpose |
|--------|-------------|---------|
| AWSCloudTrail_ReadOnlyAccess | Read only | Pull API events |
| AmazonGuardDutyReadOnlyAccess | Read only | Pull threat findings |
| AmazonBedrockFullAccess | Inference only | Call Claude and query KB |
| AmazonSESFullAccess | Send only | Dispatch email alerts |

If credentials are compromised, an attacker can only read security telemetry
and send emails from the verified sender address. They cannot modify any
AWS infrastructure.

---

## 11. Success Criteria

- [x] Login with PierreGuard credentials
- [x] Scan configuration screen with detection capabilities displayed
- [x] Live CloudTrail events pulled and analysed
- [x] GuardDuty findings integrated
- [x] All five skills applied to every scan
- [x] AI agent user agent detection working
- [x] Confidence scoring and classification working
- [x] Slack alert routing implemented
- [x] SES email alert routing implemented
- [x] Known-good allowlist preventing false positives
- [x] SOC dashboard with signals, report, and event feed
- [x] Application live at a public URL
- [x] SKILLS.md framework committed to GitHub

---

## 12. Future Improvements (Version 2)

- Real-time monitoring mode using CloudWatch Events instead of on-demand scan
- VPC Flow Logs integration for network-level AI agent detection
- Historical scan comparison to track threat pattern evolution over time
- Automated response workflows triggered by CRITICAL findings
- Multi-account monitoring across an AWS organisation
- ML-based baseline modelling to improve anomaly detection accuracy
- Integration with AWS Security Hub for unified findings dashboard
- Scheduled scans with daily digest emails

---

## 13. Key Concepts Demonstrated

**AI agent detection** — Novel security capability identifying AI framework
signatures, burst-pause timing, and logical call sequences characteristic
of agentic systems. Not available in existing security tooling.

**Skills-based reasoning** — SKILLS.md encodes security expertise as active
decision protocols rather than passive reference material. The agent does not
just retrieve context — it executes structured investigation procedures.

**Knowledge base extension** — Two new documents added to the existing
PierreGuard KB extending it from IAM governance into threat detection and
AI agent identification.

**Confidence scoring** — Multi-signal weighted scoring system that combines
evidence from multiple skills before classifying threat level, reducing false
positives while maintaining detection sensitivity.

**Least privilege alert architecture** — SES access scoped to a single
verified sender address. Slack access limited to one channel via webhook.
Both alert channels are write-only — the monitoring agent cannot read
from either.

**Defence against the monitoring agent itself** — The agent's own principal
is on the known-good allowlist, preventing it from detecting and alerting on
its own activity.