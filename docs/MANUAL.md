# User Manual
## PierreGuard Watch — AI Agent & Threat Monitor

**Live URL:** https://pierreguard-watch.netlify.app
**GitHub:** https://github.com/Negbepierre/pierreguard-watch
**Built by:** Inegbenose Pierre

---

## What This Tool Does

PierreGuard Watch monitors a live AWS environment for AI agent activity,
reconnaissance patterns, and security anomalies. It reads CloudTrail events
and GuardDuty findings, applies a five-skill reasoning framework, and
produces a classified threat report. HIGH findings trigger a Slack alert.
CRITICAL findings trigger Slack and email.

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| pierre@pierreguard.ai | pierre2026 | Chief Security Officer |
| analyst@pierreguard.ai | analyst2026 | Security Analyst |
| soc@pierreguard.ai | soc2026 | SOC Engineer |

---

## How to Use It

### Step 1 — Sign In

Go to the live URL and sign in with one of the demo credentials above.

### Step 2 — Review the Scan Configuration

The landing screen shows:
- Connected AWS account details
- All five detection skills with descriptions
- Alert routing configuration
- Scan button

### Step 3 — Start the Scan

Click **Start Threat Scan**. The backend will:

1. Load the SKILLS.md reasoning framework
2. Query the PierreGuard Knowledge Base for security standards
3. Pull the last 24 hours of CloudTrail management events
4. Pull active GuardDuty findings
5. Run Python signal detection across all five skills
6. Send everything to Claude via AWS Bedrock for full analysis
7. Route alerts based on threat level
8. Return the complete SOC report

Takes approximately 20 to 40 seconds.

### Step 4 — Review the Dashboard

**Stats bar**
- Threat Level with confidence score
- Events analysed from CloudTrail
- Signals detected by the skills framework
- Principals flagged as suspicious
- Active GuardDuty findings

**Threat Signals panel**
- Overall threat level and score
- Flagged principals with badges
- Detailed signal cards showing type, severity, and detail
- AI agent indicators including user agent strings
- Alert dispatch status for Slack and email

**AI Threat Analysis Report**
Tabbed sections:
- Summary: Overall threat assessment
- Findings: Detailed findings per skill
- Principals: Suspicious identity analysis
- Actions: Recommended immediate steps
- Compliance: CIS, SOC2, ISO27001 assessment
- GuardDuty: Active findings with severity scores

**CloudTrail Event Feed**
- Every API call in the last 24 hours
- AI agent signature highlighting with robot icon
- Service colour coding by AWS service
- Per-event severity classification
- Source IP and principal for every event

---

## Understanding the Five Skills

### Skill 1 — Reconnaissance Detection
Fires when a principal calls 3 or more Describe or List operations across
different service domains within 10 minutes, or when call volume exceeds
20 read operations in 5 minutes. Indicates systematic infrastructure mapping.

### Skill 2 — AI Agent Fingerprint Detection
Fires when a user agent string matches a known AI framework signature such
as boto3, langchain, openai-python, anthropic-sdk, httpx, or similar.
Also detects burst-pause timing patterns and logically sequenced call chains
characteristic of agentic AI systems.

The key distinction between AI agents and scripts is the call sequence logic.
A script runs fixed commands. An AI agent calls ListUsers, then GetUser for
each interesting result, then ListAttachedUserPolicies for users with elevated
permissions. That semantic logic at machine speed is the fingerprint.

### Skill 3 — Credential Anomaly Detection
Fires when GetCallerIdentity is the first call in a session — a classic
automated agent validation step. Also fires on unfamiliar source IPs,
privilege enumeration patterns, and access from unexpected geographic regions.

### Skill 4 — Unusual Read Volume Detection
Fires when read API call volume significantly exceeds normal patterns,
or when paginated list operations suggest complete resource enumeration.
Indicates data harvesting preparation.

### Skill 5 — Cross-Service Sweep Detection
Fires when a single principal touches 4 or more distinct AWS service domains
within 10 minutes. Automatically escalates to CRITICAL if the sweep includes
security services like GuardDuty, CloudTrail, Config, or SecurityHub. These
services reveal your defences, making their inclusion in a sweep particularly
dangerous.

---

## Alert Routing

| Threat Level | Dashboard | Slack | Email |
|-------------|-----------|-------|-------|
| LOW | Yes | No | No |
| MEDIUM | Yes | No | No |
| HIGH | Yes | Yes | No |
| CRITICAL | Yes | Yes | Yes |

Slack alerts go to the PierreGuard security channel with full signal details
and a summary of the AI analysis.

Email alerts go to the security team with the complete report, full signal
list, and recommended immediate actions.

---

## The Known-Good Allowlist

The following principals are on the allowlist and will not trigger alerts
even if their activity matches suspicious patterns:

- pierreguard-scan-dev
- pierreguard-ops-dev
- pierreguard-watch-dev
- AWS-AI-Training
- resource-explorer-2

Allowlisted principals have their confidence scores reduced by 50% and
are noted in the report as known internal accounts. To add a principal
to the allowlist, update the ALLOWLISTED_PRINCIPALS list in app.py and
the KNOWN-GOOD ALLOWLIST section in SKILLS.md.

---

## What Happens Behind the Scenes

1. React frontend sends POST to Flask backend
2. Backend loads SKILLS.md reasoning framework
3. Backend queries PierreGuard Knowledge Base via Bedrock
4. Backend calls CloudTrail API to pull last 24 hours of events
5. Backend calls GuardDuty API to pull active findings
6. Python signal detection runs all five skills against the data
7. Signals and confidence score calculated
8. If HIGH or CRITICAL, Slack alert sent via webhook
9. If CRITICAL, email sent via AWS SES
10. All data sent to Claude via Bedrock with SKILLS.md and KB context
11. Claude produces structured threat report following skills framework
12. Results returned to React dashboard

---

## Technical Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| AI agent detection | User agent signatures, timing patterns, call sequence logic |
| Skills-based reasoning | SKILLS.md as active decision protocols not passive context |
| CloudTrail monitoring | Live API event analysis via boto3 |
| GuardDuty integration | Threat finding cross-reference |
| Confidence scoring | Multi-signal weighted scoring with override rules |
| Alert routing | Slack webhook + AWS SES based on threat threshold |
| Known-good allowlist | False positive prevention for internal accounts |
| Knowledge base extension | New KB documents for AI agent and threat detection |
| Least privilege | Dedicated IAM user with minimum permissions |
| SKILLS.md framework | Structured security reasoning encoded as agent instructions |

---

## Running Locally

### Prerequisites
- Python 3.11 or above
- Node.js v18 or above
- AWS account with GuardDuty enabled and CloudTrail active
- Bedrock Knowledge Base with PierreGuard standards synced
- Verified SES email address
- Slack webhook URL

### Backend Setup
```bash
git clone https://github.com/Negbepierre/pierreguard-watch.git
cd pierreguard-watch
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
KNOWLEDGE_BASE_ID=58SGJUBGOB
ALERT_EMAIL=your@email.com
SES_SENDER_EMAIL=your@email.com
SLACK_WEBHOOK_URL=your_webhook


Start the backend:
```bash
PORT=5002 python app.py
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

---

## Interview Talking Points

**Why is AI agent detection important right now?**
Existing security tools were designed to detect humans and simple scripts.
AI agents behave differently — they reason about what they find, adapt their
approach, and execute logical call sequences at machine speed. GuardDuty does
not detect this. CloudTrail logs it but does not reason about it. PierreGuard
Watch fills that gap with a skills-based reasoning framework specifically
designed for AI agent behaviour patterns.

**What is the difference between SKILLS.md and RAG?**
RAG retrieves relevant documents and injects them as passive context before
the model generates a response. SKILLS.md defines active decision logic that
the agent executes step by step. The model does not just read the standards
— it follows structured investigation procedures, applies scoring rules, and
produces output in a required format. It is the difference between giving
someone a textbook and giving them a diagnostic protocol.

**How does the known-good allowlist prevent false positives?**
The monitoring agent itself calls AWS APIs using boto3, which would trigger
its own AI agent detection. The allowlist prevents the agent from alerting
on its own activity. Every known internal service account is listed with
a 50% score reduction. This means the system only escalates when activity
comes from an unfamiliar principal with unfamiliar patterns.

**What would a CRITICAL finding look like in practice?**
A principal not on the allowlist, using a langchain user agent string,
calling ListUsers then GetUser then ListAttachedUserPolicies in sequence,
then sweeping EC2, S3, and GuardDuty within five minutes, from an IP not
in known ranges. That would score 15+ points, trigger CRITICAL classification,
send an immediate Slack alert and email, and the report would include a
full session replay with recommended immediate action.

**What is the next version?**
Real-time monitoring using CloudWatch Events so the agent responds to API
calls as they happen rather than scanning on demand. Historical comparison
to identify new patterns versus persistent ones. Automated response workflows
where CRITICAL findings trigger isolation actions with human approval.