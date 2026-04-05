function SignalsPanel({ signals, principalsFlagged, score, threatLevel }) {

  const getSignalStyle = (severity) => {
    const styles = {
      CRITICAL: { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', text: '#fca5a5' },
      HIGH: { bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.3)', text: '#fcd34d' },
      MEDIUM: { bg: 'rgba(202,138,4,0.1)', border: 'rgba(202,138,4,0.3)', text: '#fde68a' },
      LOW: { bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.3)', text: '#86efac' },
    }
    return styles[severity] || styles.LOW
  }

  const getThreatStyle = (level) => {
    const styles = {
      CRITICAL: { bg: 'rgba(220,38,38,0.15)', border: 'rgba(220,38,38,0.4)', text: '#fca5a5' },
      HIGH: { bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.4)', text: '#fcd34d' },
      MEDIUM: { bg: 'rgba(202,138,4,0.15)', border: 'rgba(202,138,4,0.4)', text: '#fde68a' },
      LOW: { bg: 'rgba(22,163,74,0.15)', border: 'rgba(22,163,74,0.4)', text: '#86efac' },
    }
    return styles[level] || styles.LOW
  }

  const getSignalIcon = (type) => {
    const icons = { ai_user_agent: '🤖', cross_service_sweep: '🌐', security_service_access: '🔐', recon_sequence: '🔍', credential_validation: '🔑' }
    return icons[type] || '⚠️'
  }

  const formatType = (type) => type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const ts = getThreatStyle(threatLevel)

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#13151f', border: '1px solid #1e2435' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e2435' }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>Threat Signals</div>
        <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
          {signals?.length || 0} signals · {principalsFlagged?.length || 0} principals flagged
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Threat level */}
        <div style={{ borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', background: ts.bg, border: `1px solid ${ts.border}` }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: ts.text, opacity: 0.7, marginBottom: '4px' }}>Threat Level</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: ts.text }}>{threatLevel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: ts.text, opacity: 0.7, marginBottom: '4px' }}>Score</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: ts.text }}>{score}</div>
          </div>
        </div>

        {/* Principals */}
        {principalsFlagged && principalsFlagged.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155', marginBottom: '8px' }}>Principals Flagged</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {principalsFlagged.map((p, i) => (
                <span key={i} style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', fontWeight: '500', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Signals */}
        {signals && signals.length > 0 ? (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155', marginBottom: '12px' }}>Detected Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {signals.map((signal, i) => {
                const s = getSignalStyle(signal.severity)
                return (
                  <div key={i} style={{ borderRadius: '10px', padding: '16px', background: s.bg, border: `1px solid ${s.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{getSignalIcon(signal.type)}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: s.text }}>{formatType(signal.type)}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: s.text }}>{signal.severity}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: s.text, opacity: 0.8, marginBottom: '4px' }}>{signal.detail}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: s.text, opacity: 0.6 }}>Principal: {signal.principal}</div>
                    {signal.user_agent && (
                      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: s.text, opacity: 0.5, marginTop: '2px' }}>Agent: {signal.user_agent.substring(0, 50)}...</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: '12px', padding: '24px', textAlign: 'center', background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.2)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#86efac', marginBottom: '4px' }}>No suspicious signals detected</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>All activity consistent with known principals.</div>
          </div>
        )}

        {/* Alert status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Slack Alert', sent: threatLevel === 'HIGH' || threatLevel === 'CRITICAL', icon: '💬' },
            { label: 'Email Alert', sent: threatLevel === 'CRITICAL', icon: '📧' },
          ].map((alert, i) => (
            <div key={i} style={{ borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', background: alert.sent ? 'rgba(22,163,74,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${alert.sent ? 'rgba(22,163,74,0.3)' : '#1e2435'}` }}>
              <span style={{ fontSize: '18px' }}>{alert.icon}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: alert.sent ? '#86efac' : '#334155' }}>{alert.label}</div>
                <div style={{ fontSize: '11px', color: alert.sent ? '#86efac' : '#334155', opacity: 0.7 }}>{alert.sent ? 'Sent' : 'Not triggered'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SignalsPanel
