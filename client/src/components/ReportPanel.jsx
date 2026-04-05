import { useState } from 'react'

function ReportPanel({ report, guarddutyfFindings }) {
  const [activeTab, setActiveTab] = useState('summary')

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'findings', label: 'Findings', icon: '🔍' },
    { id: 'principals', label: 'Principals', icon: '👤' },
    { id: 'actions', label: 'Actions', icon: '⚡' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'guardduty', label: 'GuardDuty', icon: '🛡️' },
  ]

  const extractSection = (text, keyword, nextKeyword) => {
    if (!text) return ''
    const lines = text.split('\n')
    let inSection = false
    let result = []

    for (const line of lines) {
      const upper = line.toUpperCase()
      if (upper.includes(keyword.toUpperCase())) {
        inSection = true
        continue
      }
      if (inSection && nextKeyword && upper.includes(nextKeyword.toUpperCase())) {
        break
      }
      if (inSection) {
        result.push(line)
      }
    }
    return result.join('\n').trim()
  }

  const getSectionContent = (id) => {
    if (!report) return ''
    switch (id) {
      case 'summary':
        return extractSection(report, 'OVERALL THREAT ASSESSMENT', 'FINDINGS') ||
               extractSection(report, 'THREAT ASSESSMENT', 'FINDINGS') ||
               extractSection(report, 'SUMMARY', 'FINDINGS') || report.substring(0, 800)
      case 'findings':
        return extractSection(report, 'FINDINGS', 'SUSPICIOUS') ||
               extractSection(report, 'DETAILED FINDINGS', 'OVERALL') || ''
      case 'principals':
        return extractSection(report, 'SUSPICIOUS PRINCIPALS', 'RECOMMENDED') ||
               extractSection(report, 'PRINCIPALS', 'RECOMMENDED') || ''
      case 'actions':
        return extractSection(report, 'RECOMMENDED IMMEDIATE ACTIONS', 'COMPLIANCE') ||
               extractSection(report, 'RECOMMENDED ACTIONS', 'COMPLIANCE') ||
               extractSection(report, 'IMMEDIATE ACTIONS', 'COMPLIANCE') || ''
      case 'compliance':
        return extractSection(report, 'COMPLIANCE', '---') ||
               extractSection(report, 'COMPLIANCE NOTES', '---') || ''
      default:
        return ''
    }
  }

  const formatLines = (text) => {
    if (!text) return []
    return text.split('\n').map((line, i) => {
      const t = line.trim()
      if (!t) return { type: 'spacer', content: '', key: i }
      if (t.match(/^#{1,3}\s/)) return { type: 'heading', content: t.replace(/^#{1,3}\s/, ''), key: i }
      if (t.match(/^\d+\.\s+[A-Z]/)) return { type: 'heading', content: t, key: i }
      if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• '))
        return { type: 'bullet', content: t.replace(/^[-*•]\s*/, ''), key: i }
      if (t.match(/^(PASS|PARTIAL|FAIL)/i)) {
        const isPass = t.match(/^PASS/i)
        const isPartial = t.match(/^PARTIAL/i)
        return { type: isPass ? 'pass' : isPartial ? 'partial' : 'fail', content: t, key: i }
      }
      if (t.match(/^(CRITICAL|HIGH|MEDIUM|LOW):/i))
        return { type: 'alert', content: t, key: i }
      return { type: 'text', content: t, key: i }
    })
  }

  const renderLine = (line) => {
    switch (line.type) {
      case 'spacer':
        return <div key={line.key} className="h-2" />
      case 'heading':
        return (
          <h3 key={line.key} className="text-sm font-bold mt-4 mb-2"
            style={{ color: '#f1f5f9', borderBottom: '1px solid #1e2435', paddingBottom: '6px' }}>
            {line.content}
          </h3>
        )
      case 'bullet':
        return (
          <div key={line.key} className="flex gap-2 mb-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#dc2626' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              {line.content}
            </p>
          </div>
        )
      case 'alert':
        return (
          <div key={line.key} className="px-3 py-2 rounded-lg mb-2"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <p className="text-sm" style={{ color: '#fca5a5' }}>{line.content}</p>
          </div>
        )
      case 'pass':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(22,163,74,0.15)', color: '#86efac' }}>PASS</span>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {line.content.replace(/^PASS\s*/i, '')}
            </p>
          </div>
        )
      case 'partial':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(217,119,6,0.15)', color: '#fcd34d' }}>PARTIAL</span>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {line.content.replace(/^PARTIAL\s*/i, '')}
            </p>
          </div>
        )
      case 'fail':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#fca5a5' }}>FAIL</span>
            <p className="text-sm" style={{ color: '#64748b' }}>
              {line.content.replace(/^FAIL\s*/i, '')}
            </p>
          </div>
        )
      default:
        return (
          <p key={line.key} className="text-sm leading-relaxed mb-1"
            style={{ color: '#64748b' }}>
            {line.content}
          </p>
        )
    }
  }

  const renderGuardDuty = () => {
    if (!guarddutyfFindings || guarddutyfFindings.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">🛡️</p>
          <p className="text-sm font-semibold mb-1" style={{ color: '#86efac' }}>
            No active GuardDuty findings
          </p>
          <p className="text-xs" style={{ color: '#334155' }}>
            Your account has no active threat detections.
          </p>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {guarddutyfFindings.map((f, i) => (
          <div key={i} className="rounded-xl p-4"
            style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold" style={{ color: '#fca5a5' }}>{f.title}</p>
              <span className="text-xs px-2 py-0.5 rounded font-bold flex-shrink-0"
                style={{ background: 'rgba(220,38,38,0.2)', color: '#fca5a5' }}>
                {f.severity?.toFixed(1)}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: '#64748b' }}>{f.description}</p>
            <p className="text-xs font-mono" style={{ color: '#334155' }}>
              Type: {f.type} · Region: {f.region}
            </p>
          </div>
        ))}
      </div>
    )
  }

  const content = activeTab === 'guardduty' ? null : getSectionContent(activeTab)
  const lines = content ? formatLines(content) : []

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: '#13151f', border: '1px solid #1e2435' }}>

      <div className="px-6 py-4" style={{ borderBottom: '1px solid #1e2435' }}>
        <h2 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>
          AI Threat Analysis Report
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
          Generated by Claude via AWS Bedrock using PierreGuard Watch Skills Framework
        </p>
      </div>

      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid #1e2435' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
            style={{
              color: activeTab === tab.id ? '#dc2626' : '#475569',
              borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(220,38,38,0.05)' : 'transparent'
            }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-y-auto" style={{ maxHeight: '420px' }}>
        {activeTab === 'guardduty' ? renderGuardDuty() : (
          lines.length > 0 ? (
            lines.map(line => renderLine(line))
          ) : (
            <p className="text-sm" style={{ color: '#334155' }}>
              No content available for this section.
            </p>
          )
        )}
      </div>
    </div>
  )
}

export default ReportPanel