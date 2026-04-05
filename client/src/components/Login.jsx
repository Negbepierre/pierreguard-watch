import { useState } from 'react'

const DEMO_USERS = [
  { email: 'pierre@pierreguard.ai', password: 'pierre2026', name: 'Pierre Inegbenose', role: 'Chief Security Officer', id: 'PG-001' },
  { email: 'analyst@pierreguard.ai', password: 'analyst2026', name: 'Sarah Chen', role: 'Security Analyst', id: 'PG-002' },
  { email: 'soc@pierreguard.ai', password: 'soc2026', name: 'James Wright', role: 'SOC Engineer', id: 'PG-003' },
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem('pierreguard_watch_user', JSON.stringify(user))
      onLogin(user)
    } else {
      setError('Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0f1117' }}>

      {/* Left branding panel */}
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px',
        background: '#13151f',
        borderRight: '1px solid #1e2435'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9' }}>PierreGuard</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>Watch — AI Threat Monitor</div>
            </div>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#f1f5f9', lineHeight: '1.2', marginBottom: '16px' }}>
              AI Agent Detection<br />
              <span style={{ color: '#dc2626' }}>in Real Time</span>
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.7' }}>
              PierreGuard Watch monitors your AWS environment for AI agent activity,
              reconnaissance patterns, and credential anomalies. Powered by
              CloudTrail, GuardDuty, and a custom threat skills framework.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: '🤖', title: 'AI Agent Detection', desc: 'Identifies AI framework signatures and agentic behaviour patterns' },
              { icon: '🔍', title: 'Reconnaissance Monitoring', desc: 'Detects cross-service sweeps and infrastructure mapping' },
              { icon: '📧', title: 'Instant Alerts', desc: 'Slack and email notifications for HIGH and CRITICAL findings' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px',
                borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2435'
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#334155' }}>
          PierreGuard Watch v1.0 — Powered by AWS CloudTrail, GuardDuty, and Bedrock
        </div>
      </div>

      {/* Right login panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '32px'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ borderRadius: '16px', padding: '32px', background: '#13151f', border: '1px solid #1e2435' }}>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>Sign in</h2>
              <p style={{ fontSize: '14px', color: '#475569' }}>Access the PierreGuard Watch Threat Monitor</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
                  Email address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@pierreguard.ai"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2435',
                    color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                  }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid #1e2435',
                    color: '#f1f5f9', outline: 'none', boxSizing: 'border-box'
                  }} />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '13px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#fca5a5' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(220,38,38,0.4)' : '#dc2626', color: 'white'
                }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2435' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Demo credentials</p>
              <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>pierre@pierreguard.ai / pierre2026</p>
              <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>analyst@pierreguard.ai / analyst2026</p>
              <p style={{ fontSize: '11px', color: '#475569' }}>soc@pierreguard.ai / soc2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
