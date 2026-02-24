import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

const SEV_ORDER = ['P1', 'P2', 'P3', 'P4']

export default function AlertsIncidents() {
    const [alerts, setAlerts] = useState([])
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetch(`${API}/api/v1/alerts`).then(r => r.json()).then(setAlerts)
    }, [])

    const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

    const timeAgo = (iso) => {
        const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
        return diff < 60 ? `${diff}m ago` : `${Math.floor(diff / 60)}h ago`
    }

    return (
        <div className="fade-in">
            {selected && (
                <>
                    <div className="drawer-overlay" onClick={() => setSelected(null)} />
                    <div className="drawer slide-in">
                        <div className="flex items-center justify-between mb-6">
                            <span className={`pill sev-${selected.severity.toLowerCase()}`}>{selected.severity}</span>
                            <button className="btn btn-ghost" onClick={() => setSelected(null)}>✕ Close</button>
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{selected.title}</h2>
                        <div className="text-xs text-muted mb-4"><span className="mono">{selected.id}</span> · {selected.source_vendor}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            {[
                                ['Service', selected.service],
                                ['Status', selected.status],
                                ['Assignee', selected.assignee],
                                ['TTD', `${selected.ttd_minutes}m`],
                                ['Created', timeAgo(selected.created_at)],
                                ['Correlated', `${selected.correlated_alerts} alerts`],
                            ].map(([k, v]) => (
                                <div key={k} className="gauge-wrap">
                                    <div className="text-xs text-muted">{k}</div>
                                    <div className="fw-600 text-primary text-sm mt-1">{v}</div>
                                </div>
                            ))}
                        </div>

                        <div className="card mb-4" style={{ padding: 16 }}>
                            <div className="card-title mb-2">Probable Cause</div>
                            <div className="text-sm text-secondary">{selected.probable_cause}</div>
                        </div>

                        <a href={selected.runbook_url} target="_blank" rel="noreferrer" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                            📖 Open Runbook
                        </a>
                        <div className="flex gap-2 mt-3">
                            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>✓ Acknowledge</button>
                            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>⟳ Auto-Remediate</button>
                        </div>
                    </div>
                </>
            )}

            <div className="page-header">
                <h1>Alerts & Incidents</h1>
                <p>Prioritised incident management with automated runbook integration</p>
            </div>

            {/* Summary bar */}
            <div className="flex gap-3 mb-6">
                {['all', 'P1', 'P2', 'P3', 'P4'].map(f => {
                    const count = f === 'all' ? alerts.length : alerts.filter(a => a.severity === f).length
                    return (
                        <button key={f} onClick={() => setFilter(f)} className="pill"
                            style={{
                                cursor: 'pointer', border: 'none',
                                background: filter === f
                                    ? f === 'all' ? 'rgba(59,130,246,0.25)' : `rgba(var(--sev-${f === 'P1' ? '239,68,68' : f === 'P2' ? '249,115,22' : f === 'P3' ? '245,158,11' : '16,185,129'}), 0.25)`
                                    : 'var(--bg-glass)',
                                color: f === 'P1' ? 'var(--sev-p1)' : f === 'P2' ? 'var(--sev-p2)' : f === 'P3' ? 'var(--sev-p3)' : f === 'P4' ? 'var(--sev-p4)' : 'var(--text-secondary)',
                            }}>
                            {f === 'all' ? 'All' : f} ({count})
                        </button>
                    )
                })}
            </div>

            <div className="card">
                <table className="data-table">
                    <thead><tr>
                        <th>ID</th><th>Severity</th><th>Title</th><th>Service</th>
                        <th>Status</th><th>Source</th><th>Created</th>
                    </tr></thead>
                    <tbody>
                        {filtered.map(a => (
                            <tr key={a.id} onClick={() => setSelected(a)}>
                                <td><span className="mono text-xs">{a.id}</span></td>
                                <td><span className={`pill sev-${a.severity.toLowerCase()}`}>{a.severity}</span></td>
                                <td style={{ maxWidth: 220 }} className="truncate">{a.title}</td>
                                <td><span className="pill pill-blue">{a.service}</span></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className={`status-dot ${a.status}`}></div>
                                        {a.status}
                                    </div>
                                </td>
                                <td className="text-xs text-muted truncate">{a.source_vendor}</td>
                                <td className="ts">{timeAgo(a.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
