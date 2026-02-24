import { useState, useEffect } from 'react'
import Sparkline from '../components/Sparkline'

const API = 'http://localhost:8000'

const TYPE_COLOR = {
    'Syslog': 'pill-blue', 'SNMP': 'pill-purple', 'REST API': 'pill-green',
    'gRPC': 'pill-cyan', 'Kafka': 'pill-amber', 'Agent': 'pill-gray',
    'OpenTelemetry': 'pill-pink',
}

function statusPill(st) {
    const map = { healthy: 'pill-green', degraded: 'pill-amber', down: 'pill-red' }
    return map[st] || 'pill-gray'
}

export default function IngestionHub() {
    const [connectors, setConnectors] = useState([])
    const [throughput, setThroughput] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetch(`${API}/api/v1/ingestion/connectors`).then(r => r.json()).then(setConnectors)
        fetch(`${API}/api/v1/ingestion/throughput`).then(r => r.json()).then(setThroughput)
    }, [])

    const filtered = connectors.filter(c =>
        c.vendor.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase())
    )
    const stats = {
        total: connectors.length,
        healthy: connectors.filter(c => c.status === 'healthy').length,
        degraded: connectors.filter(c => c.status === 'degraded').length,
        down: connectors.filter(c => c.status === 'down').length,
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Ingestion Hub</h1>
                <p>Universal vendor-agnostic data collection — {stats.total} connectors active</p>
            </div>

            {/* Summary pills */}
            <div className="flex gap-3 mb-6">
                <div className="pill pill-green">✔ {stats.healthy} Healthy</div>
                <div className="pill pill-amber">⚠ {stats.degraded} Degraded</div>
                <div className="pill pill-red">✖ {stats.down} Down</div>
                <div className="pill pill-blue" style={{ marginLeft: 'auto' }}>Total Events Collected: Live</div>
            </div>

            {/* Throughput sparklines for top vendors */}
            {throughput.length > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <span className="card-title">Top Vendor Throughput (last 60 min)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                        {throughput.map(s => (
                            <div key={s.vendor}>
                                <div className="text-xs fw-600 mb-2 truncate" title={s.vendor}>{s.vendor}</div>
                                <Sparkline data={s.points.map(p => p.value)} color="var(--accent-cyan)" height={48} width={120} />
                                <div className="text-xs text-muted mt-1">
                                    {s.points[s.points.length - 1]?.value?.toLocaleString()} ev/min
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Connector Cards */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Vendor Connectors</span>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Filter connectors…"
                        style={{
                            background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)',
                            borderRadius: 8, padding: '6px 12px', color: 'var(--text-primary)',
                            fontSize: '0.82rem', outline: 'none', width: 200,
                        }}
                    />
                </div>
                <div className="grid-auto">
                    {filtered.map(c => (
                        <div key={c.id} className="connector-card">
                            <div className="flex items-center justify-between mb-2">
                                <div className="connector-name">{c.vendor}</div>
                                <div className={`pill ${statusPill(c.status)}`}>
                                    <span className={`status-dot ${c.status}`} style={{ width: 6, height: 6 }}></span>
                                    {c.status}
                                </div>
                            </div>
                            <div className="connector-type mb-2">
                                <span className={`pill ${TYPE_COLOR[c.type] || 'pill-gray'}`}>{c.type}</span>
                            </div>
                            <div className="text-xs text-muted" style={{ lineHeight: 1.8 }}>
                                <div>Events/min: <span className="text-primary fw-600">{c.events_per_min?.toLocaleString() || '—'}</span></div>
                                <div>Schema: <span className="mono">{c.schema_version}</span> · {c.normalised_fields} fields</div>
                                <div>Latency: <span className="text-accent">{c.latency_ms ? `${c.latency_ms}ms` : '—'}</span></div>
                            </div>
                            <div className="mt-2">
                                <div className="progress-bar-wrap">
                                    <div className={`progress-bar-fill ${c.status === 'healthy' ? 'green' : c.status === 'degraded' ? 'amber' : 'red'}`}
                                        style={{ width: `${Math.min(100, (c.events_per_min / 120))}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
