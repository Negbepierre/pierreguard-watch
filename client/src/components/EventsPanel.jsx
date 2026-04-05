function EventsPanel({ events }) {
  const getAiSignal = (userAgent) => {
    if (!userAgent) return null
    const ua = userAgent.toLowerCase()
    const sigs = ['boto3', 'langchain', 'openai', 'anthropic', 'httpx', 'aiohttp', 'llm-agent', 'bedrock-agent', 'smolagents', 'autogen', 'crewai']
    return sigs.find(s => ua.includes(s)) || null
  }

  const getSeverity = (eventName, userAgent) => {
    const critical = ['DeleteTrail', 'StopLogging', 'DeleteDetector']
    const high = ['CreateUser', 'AttachUserPolicy', 'CreateAccessKey', 'PutUserPolicy', 'UpdateAccessKey']
    const medium = ['GetCallerIdentity', 'AssumeRole', 'ListUsers', 'ListRoles', 'GetFindings', 'ListDetectors']
    if (critical.some(c => eventName?.includes(c))) return 'CRITICAL'
    if (high.some(h => eventName?.includes(h))) return 'HIGH'
    if (getAiSignal(userAgent)) return 'HIGH'
    if (medium.some(m => eventName?.includes(m))) return 'MEDIUM'
    return 'NORMAL'
  }

  const getBadgeStyle = (level) => {
    const styles = {
      CRITICAL: { bg: 'rgba(220,38,38,0.2)', text: '#fca5a5', border: 'rgba(220,38,38,0.4)' },
      HIGH: { bg: 'rgba(217,119,6,0.2)', text: '#fcd34d', border: 'rgba(217,119,6,0.4)' },
      MEDIUM: { bg: 'rgba(202,138,4,0.15)', text: '#fde68a', border: 'rgba(202,138,4,0.3)' },
      NORMAL: { bg: 'rgba(22,163,74,0.1)', text: '#86efac', border: 'rgba(22,163,74,0.2)' },
    }
    return styles[level] || styles.NORMAL
  }

  const getServiceStyle = (source) => {
    const svc = source?.replace('.amazonaws.com', '').toLowerCase()
    const colors = {
      iam: { bg: 'rgba(220,38,38,0.1)', text: '#fca5a5' },
      sts: { bg: 'rgba(217,119,6,0.1)', text: '#fcd34d' },
      cloudtrail: { bg: 'rgba(30,64,175,0.15)', text: '#93c5fd' },
      guardduty: { bg: 'rgba(124,58,237,0.15)', text: '#c4b5fd' },
      ec2: { bg: 'rgba(8,145,178,0.15)', text: '#67e8f9' },
      s3: { bg: 'rgba(22,163,74,0.1)', text: '#86efac' },
      cloudshell: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
    }
    return colors[svc] || { bg: 'rgba(100,116,139,0.1)', text: '#64748b' }
  }

  const formatTime = (t) => {
    try { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
    catch { return t }
  }

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#13151f', border: '1px solid #1e2435' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2435' }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>CloudTrail Event Feed</div>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
          Last 24 hours · {events?.length || 0} events · AI agent signatures highlighted
        </div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
        {!events || events.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#334155', fontSize: '14px' }}>No events in the last 24 hours.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e2435' }}>
                {['Time', 'Event', 'Service', 'Principal', 'IP', 'Severity'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => {
                const severity = getSeverity(event.event_name, event.user_agent)
                const aiSig = getAiSignal(event.user_agent)
                const svcStyle = getServiceStyle(event.event_source)
                const badgeStyle = getBadgeStyle(severity)
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1d2a', background: aiSig ? 'rgba(220,38,38,0.04)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569' }}>{formatTime(event.event_time)}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {aiSig && <span style={{ fontSize: '12px' }}>🤖</span>}
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#f1f5f9' }}>{event.event_name}</span>
                      </div>
                      {aiSig && <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#dc2626', marginTop: '2px' }}>AI: {aiSig}</div>}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: '500', padding: '3px 8px', borderRadius: '6px', background: svcStyle.bg, color: svcStyle.text }}>
                        {event.event_source?.replace('.amazonaws.com', '').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{event.username || 'unknown'}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#334155' }}>{event.source_ip?.substring(0, 15)}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: badgeStyle.bg, color: badgeStyle.text, border: `1px solid ${badgeStyle.border}` }}>
                        {severity}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default EventsPanel
