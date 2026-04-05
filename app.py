import os
import json
import boto3
import requests
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID', '58SGJUBGOB')
ALERT_EMAIL = os.environ.get('ALERT_EMAIL')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL')
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL')
CLAUDE_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0'

ALLOWLISTED_PRINCIPALS = [
    'pierreguard-scan-dev',
    'pierreguard-ops-dev',
    'pierreguard-watch-dev',
    'AWS-AI-Training',
]

AI_USER_AGENT_SIGNATURES = [
    'boto3', 'langchain', 'openai-python', 'anthropic-sdk',
    'httpx', 'aiohttp', 'requests/2', 'llm-agent', 'bedrock-agent',
    'smolagents', 'autogen', 'crewai', 'python-httpx',
]

def get_client(service):
    return boto3.client(
        service,
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )


def call_claude(prompt):
    client = get_client('bedrock-runtime')
    body = json.dumps({
        'anthropic_version': 'bedrock-2023-05-31',
        'max_tokens': 3000,
        'temperature': 0,
        'messages': [{'role': 'user', 'content': prompt}]
    })
    response = client.invoke_model(
        modelId=CLAUDE_MODEL,
        body=body,
        contentType='application/json',
        accept='application/json'
    )
    result = json.loads(response['body'].read())
    return result['content'][0]['text']


def query_knowledge_base(query):
    try:
        client = get_client('bedrock-agent-runtime')
        response = client.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {'numberOfResults': 5}
            }
        )
        results = []
        for r in response.get('retrievalResults', []):
            results.append(r['content']['text'])
        return '\n\n'.join(results)[:3000]
    except Exception as e:
        print(f'KB error: {str(e)}')
        return ''


def fetch_cloudtrail_events(hours=24):
    try:
        client = get_client('cloudtrail')
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(hours=hours)
        response = client.lookup_events(
            StartTime=start_time,
            EndTime=end_time,
            MaxResults=50
        )
        events = []
        for e in response.get('Events', []):
            raw = json.loads(e.get('CloudTrailEvent', '{}'))
            events.append({
                'event_name': e.get('EventName'),
                'event_time': str(e.get('EventTime')),
                'username': e.get('Username', 'unknown'),
                'source_ip': raw.get('sourceIPAddress', 'unknown'),
                'user_agent': raw.get('userAgent', 'unknown'),
                'event_source': raw.get('eventSource', 'unknown'),
                'resources': [r.get('ResourceName', '') for r in e.get('Resources', [])],
                'read_only': raw.get('readOnly', True)
            })
        return events
    except Exception as e:
        print(f'CloudTrail error: {str(e)}')
        return []


def fetch_guardduty_findings():
    try:
        client = get_client('guardduty')
        detectors = client.list_detectors()
        if not detectors['DetectorIds']:
            return []
        detector_id = detectors['DetectorIds'][0]
        finding_ids = client.list_findings(
            DetectorId=detector_id,
            FindingCriteria={'Criterion': {'severity': {'Gte': 4}}},
            MaxResults=20
        ).get('FindingIds', [])
        if not finding_ids:
            return []
        findings = client.get_findings(
            DetectorId=detector_id,
            FindingIds=finding_ids
        ).get('Findings', [])
        return [{
            'id': f['Id'],
            'title': f['Title'],
            'severity': f['Severity'],
            'type': f['Type'],
            'description': f['Description'],
            'account': f['AccountId'],
            'region': f['Region'],
            'created': f['CreatedAt']
        } for f in findings]
    except Exception as e:
        print(f'GuardDuty error: {str(e)}')
        return []


def load_skills():
    try:
        with open('SKILLS.md', 'r') as f:
            return f.read()
    except Exception:
        return ''


def detect_ai_agent_signals(events):
    signals = []
    principal_calls = {}

    for event in events:
        username = event.get('username', 'unknown')
        user_agent = event.get('user_agent', '').lower()
        event_source = event.get('event_source', '')
        event_name = event.get('event_name', '')

        if username in ALLOWLISTED_PRINCIPALS:
            continue

        for sig in AI_USER_AGENT_SIGNATURES:
            if sig in user_agent:
                signals.append({
                    'type': 'ai_user_agent',
                    'principal': username,
                    'detail': f'AI framework signature detected: {sig}',
                    'user_agent': user_agent,
                    'event': event_name,
                    'severity': 'HIGH'
                })
                break

        if username not in principal_calls:
            principal_calls[username] = []
        principal_calls[username].append({
            'service': event_source.replace('.amazonaws.com', ''),
            'call': event_name,
            'time': event.get('event_time'),
            'ip': event.get('source_ip')
        })

    for principal, calls in principal_calls.items():
        if principal in ALLOWLISTED_PRINCIPALS:
            continue

        services = set(c['service'] for c in calls)
        if len(services) >= 4:
            signals.append({
                'type': 'cross_service_sweep',
                'principal': principal,
                'detail': f'Touched {len(services)} services: {", ".join(services)}',
                'call_count': len(calls),
                'severity': 'CRITICAL'
            })
        elif len(services) >= 2:
            security_services = {'guardduty', 'cloudtrail', 'config', 'securityhub'}
            if services & security_services:
                signals.append({
                    'type': 'security_service_access',
                    'principal': principal,
                    'detail': f'Accessed security services: {", ".join(services & security_services)}',
                    'severity': 'HIGH'
                })

        call_names = [c['call'] for c in calls]
        recon_sequences = [
            ['ListUsers', 'GetUser'],
            ['ListRoles', 'GetRole'],
            ['DescribeVpcs', 'DescribeSubnets'],
            ['GetFindings', 'ListDetectors'],
        ]
        for seq in recon_sequences:
            if all(s in call_names for s in seq):
                signals.append({
                    'type': 'recon_sequence',
                    'principal': principal,
                    'detail': f'Reconnaissance sequence detected: {" -> ".join(seq)}',
                    'severity': 'HIGH'
                })
                break

        if 'GetCallerIdentity' in call_names:
            signals.append({
                'type': 'credential_validation',
                'principal': principal,
                'detail': 'GetCallerIdentity called — common first step for automated agents',
                'severity': 'MEDIUM'
            })

    return signals


def calculate_threat_level(signals, guardduty_findings):
    if not signals and not guardduty_findings:
        return 'LOW', 0

    score = 0
    for s in signals:
        if s['severity'] == 'CRITICAL':
            score += 10
        elif s['severity'] == 'HIGH':
            score += 4
        elif s['severity'] == 'MEDIUM':
            score += 2
        else:
            score += 1

    for f in guardduty_findings:
        severity = f.get('severity', 0)
        if severity >= 8:
            score += 8
        elif severity >= 5:
            score += 4
        else:
            score += 2

    if score >= 10:
        return 'CRITICAL', score
    elif score >= 7:
        return 'HIGH', score
    elif score >= 4:
        return 'MEDIUM', score
    else:
        return 'LOW', score


def send_slack_alert(threat_level, report_summary, signals, score):
    if not SLACK_WEBHOOK_URL:
        return
    try:
        emoji = {'CRITICAL': '🚨', 'HIGH': '⚠️', 'MEDIUM': '🟡', 'LOW': '🟢'}
        color = {'CRITICAL': '#dc2626', 'HIGH': '#d97706', 'MEDIUM': '#ca8a04', 'LOW': '#16a34a'}

        signal_text = '\n'.join([f"• {s['type'].replace('_', ' ').title()}: {s['detail']}" for s in signals[:5]])

        payload = {
            'attachments': [{
                'color': color.get(threat_level, '#64748b'),
                'blocks': [
                    {
                        'type': 'header',
                        'text': {
                            'type': 'plain_text',
                            'text': f"{emoji.get(threat_level, '🔍')} PierreGuard Watch — {threat_level} Threat Detected"
                        }
                    },
                    {
                        'type': 'section',
                        'fields': [
                            {'type': 'mrkdwn', 'text': f'*Threat Level:*\n{threat_level}'},
                            {'type': 'mrkdwn', 'text': f'*Confidence Score:*\n{score}'},
                            {'type': 'mrkdwn', 'text': f'*Signals Detected:*\n{len(signals)}'},
                            {'type': 'mrkdwn', 'text': f'*Time:*\n{datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}'},
                        ]
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': f'*Key Signals:*\n{signal_text if signal_text else "No specific signals"}'
                        }
                    },
                    {
                        'type': 'section',
                        'text': {
                            'type': 'mrkdwn',
                            'text': f'*AI Analysis Summary:*\n{report_summary[:500]}...'
                        }
                    }
                ]
            }]
        }
        requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=10)
        print('Slack alert sent')
    except Exception as e:
        print(f'Slack error: {str(e)}')


def send_email_alert(threat_level, report, signals, score):
    if not ALERT_EMAIL or not SES_SENDER_EMAIL:
        return
    try:
        client = get_client('ses')
        signal_list = '\n'.join([f"- {s['type'].replace('_', ' ').title()}: {s['detail']}" for s in signals])
        body = f"""PIERREGUAR D WATCH — CRITICAL SECURITY ALERT

Threat Level: {threat_level}
Confidence Score: {score}
Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}

SIGNALS DETECTED:
{signal_list if signal_list else 'No specific signals'}

FULL AI ANALYSIS:
{report}

---
PierreGuard AI Security Platform v1.0
This alert was generated automatically. Review and investigate immediately.
"""
        client.send_email(
            Source=SES_SENDER_EMAIL,
            Destination={'ToAddresses': [ALERT_EMAIL]},
            Message={
                'Subject': {
                    'Data': f'[{threat_level}] PierreGuard Watch Security Alert — Score {score}'
                },
                'Body': {
                    'Text': {'Data': body}
                }
            }
        )
        print('Email alert sent')
    except Exception as e:
        print(f'SES error: {str(e)}')


def analyse_with_claude(events, guardduty_findings, signals, kb_context, skills):
    events_summary = []
    for e in events[:20]:
        events_summary.append({
            'event': e['event_name'],
            'user': e['username'],
            'service': e['event_source'],
            'ip': e['source_ip'],
            'agent': e['user_agent'][:100] if e['user_agent'] else 'unknown',
            'time': e['event_time']
        })

    prompt = (
        "You are the PierreGuard Watch security monitoring agent.\n\n"
        "Apply the following skills framework to analyse the security data:\n\n"
        "SKILLS FRAMEWORK:\n" + skills[:2000] + "\n\n"
        "KNOWLEDGE BASE CONTEXT:\n" + kb_context[:1500] + "\n\n"
        "CLOUDTRAIL EVENTS (last 24 hours):\n"
        + json.dumps(events_summary, indent=2, default=str) + "\n\n"
        "GUARDDUTY FINDINGS:\n"
        + json.dumps(guardduty_findings[:5], indent=2, default=str) + "\n\n"
        "PRE-DETECTED SIGNALS:\n"
        + json.dumps(signals, indent=2, default=str) + "\n\n"
        "Produce a structured security report following the REPORT STRUCTURE "
        "defined in the skills framework. Be specific about principals, "
        "services, and indicators. Classify each finding and provide "
        "recommended immediate actions."
    )
    return call_claude(prompt)


@app.route('/api/watch-scan', methods=['POST'])
def watch_scan():
    try:
        print('PierreGuard Watch scan started...')

        print('Loading skills framework...')
        skills = load_skills()

        print('Querying knowledge base...')
        kb_context = query_knowledge_base(
            'AI agent detection reconnaissance credential anomaly threat detection'
        )

        print('Fetching CloudTrail events...')
        events = fetch_cloudtrail_events(hours=24)
        print(f'Fetched {len(events)} events')

        print('Fetching GuardDuty findings...')
        guardduty_findings = fetch_guardduty_findings()
        print(f'Found {len(guardduty_findings)} GuardDuty findings')

        print('Running signal detection...')
        signals = detect_ai_agent_signals(events)
        print(f'Detected {len(signals)} signals')

        threat_level, score = calculate_threat_level(signals, guardduty_findings)
        print(f'Threat level: {threat_level} (score: {score})')

        print('Running Claude analysis...')
        report = analyse_with_claude(
            events, guardduty_findings, signals, kb_context, skills
        )

        report_summary = report[:500] if report else ''

        if threat_level in ['HIGH', 'CRITICAL']:
            print('Sending Slack alert...')
            send_slack_alert(threat_level, report_summary, signals, score)

        if threat_level == 'CRITICAL':
            print('Sending email alert...')
            send_email_alert(threat_level, report, signals, score)

        principals_flagged = list(set([s['principal'] for s in signals]))

        return jsonify({
            'status': 'success',
            'threat_level': threat_level,
            'confidence_score': score,
            'events_analysed': len(events),
            'guardduty_findings': len(guardduty_findings),
            'signals_detected': len(signals),
            'signals': signals,
            'principals_flagged': principals_flagged,
            'guardduty': guardduty_findings,
            'events': events[:20],
            'report': report,
            'alerts_sent': {
                'slack': threat_level in ['HIGH', 'CRITICAL'],
                'email': threat_level == 'CRITICAL'
            }
        })

    except Exception as e:
        print(f'Watch scan error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'PierreGuard Watch',
        'version': '1.0',
        'knowledge_base': KNOWLEDGE_BASE_ID
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)