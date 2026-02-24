import { useState, useEffect } from 'react'
import Sparkline from '../components/Sparkline'

const API = 'http://localhost:8000'

export default function RoutingPipelines() {
    const [rules, setRules] = useState([])
    const [throughput, setThroughput] = useState([])

    useEffect(() => {
        fetch(`${API}/api/v1/routing/rules`).then(r => r.json()).then(setRules)
        fetch(`${API}/api/v1/routing/throughput`).then(r => r.json()).then(setThroughput)
    }, [])

    const latest = throughput[throughput.length - 1] || {}
    const totalIn = throughput.reduce((s, p) => s + (p.events_in || 0), 0)
    const totalDropped = throughput.reduce((s, p) => s + (p.events_dropped || 0), 0)

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Routing & Pipelines</h1>
                <p>High-performance event routing, rule engine & throughput telemetry</p>
            </div>

            {/* KPI Row */}
            <div className="grid-4 mb-6">
                <div className="kpi-card">
                    <div className="kpi-label">Events In (30m)</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-cyan)' }}>{totalIn.toLocaleString()}</div>
                    <div className="kpi-sub">Total pipeline ingress</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Dropped Events</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-red)' }}>{totalDropped.toLocaleString()}</div>
                    <div className="kpi-sub">Below 1% threshold</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Active Rules</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>{rules.filter(r => r.enabled).length}</div>
                    <div className="kpi-sub">of {rules.length} total rules</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">P99 Latency</div>
                    <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>{latest.p99_latency_ms?.toFixed(0)}ms</div>
                    <div className="kpi-sub">Last sample</div>
                </div>
            </div>

            {/* Throughput Chart */}
            <div className="card mb-6">
                <div className="card-header">
                    <span className="card-title">Pipeline Throughput (last 30 min)</span>
                    <div className="flex gap-3 text-xs">
                        <span style={{ color: 'var(--accent-cyan)' }}>— Events In</span>
                        <span style={{ color: 'var(--accent-green)' }}>— Events Routed</span>
                        <span style={{ color: 'var(--accent-red)' }}>— Dropped</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                    <div>
                        <div className="text-xs text-muted mb-1">Events In</div>
                        <Sparkline data={throughput.map(p => p.events_in)} color="var(--accent-cyan)" height={56} width={700} />
                    </div>
                    <div>
                        <div className="text-xs text-muted mb-1">Events Routed</div>
                        <Sparkline data={throughput.map(p => p.events_routed)} color="var(--accent-green)" height={56} width={700} />
                    </div>
                    <div>
                        <div className="text-xs text-muted mb-1">P99 Latency (ms)</div>
                        <Sparkline data={throughput.map(p => p.p99_latency_ms)} color="var(--accent-amber)" height={40} width={700} />
                    </div>
                </div>
            </div>

            {/* Routing Rules Table */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Routing Rules</span>
                    <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>+ Add Rule</button>
                </div>
                <table className="data-table">
                    <thead><tr>
                        <th>Priority</th><th>Rule Name</th><th>Condition</th>
                        <th>Target</th><th>Matches / hr</th><th>Avg Latency</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                        {rules.map(r => (
                            <tr key={r.id}>
                                <td>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: 26, height: 26, borderRadius: '50%', fontWeight: 700, fontSize: '0.8rem',
                                        background: r.priority <= 3 ? 'rgba(239,68,68,0.2)' : r.priority <= 6 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)',
                                        color: r.priority <= 3 ? 'var(--accent-red)' : r.priority <= 6 ? 'var(--accent-amber)' : 'var(--accent-green)',
                                    }}>{r.priority}</span>
                                </td>
                                <td className="fw-600">{r.name}</td>
                                <td><span className="mono text-xs" style={{ color: 'var(--accent-cyan)' }}>{r.condition}</span></td>
                                <td><span className="pill pill-purple">{r.target}</span></td>
                                <td className="fw-600 text-accent">{r.matches_last_hour.toLocaleString()}</td>
                                <td><span className="mono text-xs">{r.avg_latency_ms}ms</span></td>
                                <td>
                                    <span className={`pill ${r.enabled ? 'pill-green' : 'pill-gray'}`}>
                                        {r.enabled ? '● Active' : '○ Disabled'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
