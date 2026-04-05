import SignalsPanel from './SignalsPanel'
import EventsPanel from './EventsPanel'
import ReportPanel from './ReportPanel'

function Dashboard({ data, onRescan, user }) {
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const getThreatStyle = (level) => {
    const styles = {
      CRITICAL: { bg: 'rgba(220,38,38,0.15)', text: '#fca5a5', border: 'rgba(220,38,38,0.4)' },
      HIGH: { bg: 'rgba(217,119,6,0.15)', text: '#fcd34d', border: 'rgba(217,119,6,0.4)' },
      MEDIUM: { bg: 'rgba(202,138,4,0.15)', text: '#fde68a', border: 'rgba(202,138,4,0.3)' },
      LOW: { bg: 'rgba(22,163,74,0.15)', text: '#86efac', border: 'rgba(22,163,74,0.3)' },
    }
    return styles[level] || styles.LOW
  }

  const ts = getThreatStyle(data.threat_level)

  const stats = [
    { label: 'Events Analysed', value: data.events_analysed, color: '#93c5fd', bg: 'rgba(30,64,175,0.1)', border: 'rgba(30,64,175,0.2)' },
    { label: 'Signals Detected', value: data.signals_detected, color: '#fca5a5', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.2)' },
    { label: 'Principals Flagged', value: data.principals_flagged?.length || 0, color: '#fcd34d', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.2)' },
    { label: 'GuardDuty Findings', value: data.guardduty_findings, color: '#c4b5fd', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* Header */}
      <header style={{ background: '#13151f', borderBottom: '1px solid #1e2435' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>PierreGuard</span>
              <span style={{ fontSize: '11px', marginLeft: '8px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', background: 'rgba(220,38,38,0.15)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)' }}>Watch</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#334155' }}>Scan completed</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#f1f5f9' }}>{now}</div>
            </div>
            <div style={{ borderLeft: '1px solid #1e2435', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{user?.role} · {user?.id}</div>
              </div>
              <button onClick={onRescan} style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                New Scan
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ borderRadius: '12px', padding: '20px', background: ts.bg, border: `1px solid ${ts.border}` }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: ts.text, opacity: 0.7, marginBottom: '4px' }}>Threat Level</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: ts.text }}>{data.threat_level}</div>
            <div style={{ fontSize: '11px', color: ts.text, opacity: 0.6, marginTop: '4px' }}>Score: {data.confidence_score}</div>
          </div>
          {stats.map((stat, i) => (
            <div key={i} style={{ borderRadius: '12px', padding: '20px', background: stat.bg, border: `1px solid ${stat.border}` }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: stat.color, opacity: 0.7, marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        {(data.alerts_sent?.slack || data.alerts_sent?.email) && (
          <div style={{ borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', marginBottom: '24px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fca5a5' }}>Alerts dispatched</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {data.alerts_sent?.slack && 'Slack notification sent to security channel. '}
                {data.alerts_sent?.email && 'Email alert sent to security team.'}
              </div>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
          <SignalsPanel
            signals={data.signals}
            principalsFlagged={data.principals_flagged}
            score={data.confidence_score}
            threatLevel={data.threat_level}
          />
          <ReportPanel
            report={data.report}
            guarddutyfFindings={data.guardduty}
          />
        </div>

        {/* Events */}
        <EventsPanel events={data.events} />

        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: '11px', color: '#1e2435' }}>
            PierreGuard Watch v1.0 — Powered by AWS CloudTrail, GuardDuty, Bedrock, and the PierreGuard Watch Skills Framework.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
