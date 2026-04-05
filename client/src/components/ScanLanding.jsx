function ScanLanding({ onScan, scanning, error, user, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* Header */}
      <header style={{ background: '#13151f', borderBottom: '1px solid #1e2435' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>{user?.role} · {user?.id}</div>
            </div>
            <button onClick={onLogout} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #1e2435', color: '#475569', background: 'transparent', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' }}>AI Threat Monitor</h1>
          <p style={{ fontSize: '14px', color: '#475569' }}>Scanning your AWS environment for AI agent activity and security anomalies.</p>
        </div>

        {/* Connected environment card */}
        <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#13151f', border: '1px solid #1e2435', marginBottom: '24px' }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2435' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(220,38,38,0.1)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Monitored AWS Environment</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Live CloudTrail and GuardDuty data</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Live</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { label: 'Account ID', value: '964308144601' },
              { label: 'Account Name', value: 'PierreGuard Technologies' },
              { label: 'Environment', value: 'Production' },
              { label: 'Region', value: 'us-east-1' },
              { label: 'GuardDuty', value: 'Active' },
              { label: 'CloudTrail', value: 'Enabled' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '16px 24px',
                borderRight: i % 3 !== 2 ? '1px solid #1e2435' : 'none',
                borderBottom: i < 3 ? '1px solid #1e2435' : 'none'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#334155', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detection capabilities */}
        <div style={{ borderRadius: '16px', padding: '24px', background: '#13151f', border: '1px solid #1e2435', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px' }}>Detection Capabilities</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { skill: 'Skill 1', name: 'Reconnaissance Detection', desc: 'Cross-service mapping and infrastructure sweep patterns' },
              { skill: 'Skill 2', name: 'AI Agent Fingerprinting', desc: 'Framework signatures, timing patterns, call sequences' },
              { skill: 'Skill 3', name: 'Credential Anomaly Detection', desc: 'Unusual key usage, GetCallerIdentity, privilege enumeration' },
              { skill: 'Skill 4', name: 'Read Volume Analysis', desc: 'Data enumeration and exfiltration preparation patterns' },
              { skill: 'Skill 5', name: 'Cross-Service Sweep', desc: 'Comprehensive environment mapping detection' },
              { skill: 'ALERT', name: 'Slack + Email Alerts', desc: 'HIGH triggers Slack. CRITICAL triggers Slack and email.', isAlert: true },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
                borderRadius: '10px',
                background: item.isAlert ? 'rgba(220,38,38,0.05)' : 'rgba(255,255,255,0.02)',
                border: item.isAlert ? '1px solid rgba(220,38,38,0.2)' : '1px solid #1e2435'
              }}>
                <span style={{
                  fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                  fontFamily: 'monospace', fontWeight: '700', flexShrink: 0, marginTop: '2px',
                  background: 'rgba(220,38,38,0.15)', color: '#dc2626'
                }}>{item.skill}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: item.isAlert ? '#fca5a5' : '#f1f5f9', marginBottom: '2px' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scan button */}
        <div style={{ borderRadius: '16px', padding: '24px', background: '#13151f', border: '1px solid #1e2435' }}>
          {scanning ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '52px', height: '52px', margin: '0 auto 16px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(220,38,38,0.2)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#dc2626', animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px' }}>Scanning for threats...</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Fetching CloudTrail events and GuardDuty findings</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>Running all 5 skills against live data</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>Ready to scan</div>
                <div style={{ fontSize: '12px', color: '#475569' }}>Analyses last 24 hours of CloudTrail events. Takes 20 to 40 seconds.</div>
              </div>
              <button onClick={onScan} style={{
                padding: '12px 32px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px', background: '#dc2626',
                color: 'white', border: 'none', cursor: 'pointer'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Start Threat Scan
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '16px', padding: '16px 24px', borderRadius: '10px', fontSize: '14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}>
            Scan failed: {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default ScanLanding
