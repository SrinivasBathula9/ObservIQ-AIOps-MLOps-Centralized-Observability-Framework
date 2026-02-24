import { useState, useEffect, useRef } from 'react'
import Sparkline from '../components/Sparkline'
import LiveRing from '../components/LiveRing'

const API = 'http://localhost:8000'

function KpiCard({ label, value, sub, icon, trend, trendDir, color }) {
    return (
        <div className="kpi-card fade-in">
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
            <div className="kpi-sub">{sub}</div>
            {trend && <div className={`kpi-trend ${trendDir || 'neutral'}`}>{trend}</div>}
        </div>
    )
}

export default function Overview({ live }) {
    const [kpis, setKpis] = useState(null)
    const [history, setHistory] = useState([])
    const timerRef = useRef(null)

    useEffect(() => {
        fetch(`${API}/api/v1/overview/kpis`).then(r => r.json()).then(setKpis)
    }, [])

    useEffect(() => {
        if (live?.events_per_sec !== undefined) {
            setHistory(h => [...h.slice(-59), live.events_per_sec])
        }
    }, [live])

    if (!kpis) return <div className="empty-state"><div className="empty-icon">◌</div><p>Loading platform data…</p></div>

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Platform Overview</h1>
                <p>Live AIOps operational intelligence across {kpis.vendors_connected} connected data sources</p>
            </div>

            {/* KPI Grid */}
            <div className="grid-4 mb-6">
                <KpiCard label="Events Ingested" value={kpis.total_events_ingested?.toLocaleString()}
                    sub="Total since last reset" icon="⬡" trend="▲ 12.4%" trendDir="up" />
                <KpiCard label="Events / Second" value={live?.events_per_sec?.toLocaleString() || kpis.events_per_second}
                    sub="Real-time throughput" icon="⇄" color="var(--accent-cyan)" />
                <KpiCard label="Active Alerts" value={live?.active_alerts || kpis.active_alerts}
                    sub={`${kpis.critical_alerts} critical`} icon="⚡" color="var(--accent-red)"
                    trend={`${kpis.critical_alerts} P1`} trendDir="down" />
                <KpiCard label="Pipeline Health" value={`${kpis.pipeline_health_score}%`}
                    sub="All ingestion pipelines" icon="◈" color="var(--accent-green)" trend="▲ Stable" trendDir="up" />
            </div>
            <div className="grid-4 mb-6">
                <KpiCard label="Model Accuracy" value={`${kpis.model_accuracy_avg}%`}
                    sub="Avg across production models" icon="⚙" color="var(--accent-purple)" />
                <KpiCard label="MTTR" value={`${kpis.mttr_minutes}m`}
                    sub="Mean time to resolve" icon="⟳" color="var(--accent-amber)" trend="▼ 18% vs last week" trendDir="up" />
                <KpiCard label="Topology Nodes" value={kpis.topology_nodes?.toLocaleString()}
                    sub={`${kpis.topology_edges} active edges`} icon="⊞" />
                <KpiCard label="Vendors Connected" value={kpis.vendors_connected}
                    sub="Universal adapter layer" icon="⊕" color="var(--accent-cyan)" />
            </div>

            {/* Health Rings + Live Chart */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Platform Health Scores</span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'space-around', flexWrap: 'wrap', paddingTop: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                            <LiveRing value={kpis.pipeline_health_score} max={100} color="var(--accent-green)" label="Pipeline" size={100} />
                            <div className="text-xs text-muted mt-2">Ingestion Health</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <LiveRing value={kpis.model_accuracy_avg} max={100} color="var(--accent-purple)" label="ML Acc." size={100} />
                            <div className="text-xs text-muted mt-2">Model Accuracy</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <LiveRing value={100 - (live?.cpu_pct || 42)} max={100} color="var(--accent-blue)" label="CPU Avail" size={100} />
                            <div className="text-xs text-muted mt-2">CPU Available</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <LiveRing value={100 - (live?.mem_pct || 55)} max={100} color="var(--accent-cyan)" label="Mem Free" size={100} />
                            <div className="text-xs text-muted mt-2">Memory Free</div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Live Event Rate (60s window)</span>
                        <span className="pill pill-blue">WebSocket</span>
                    </div>
                    <div style={{ width: '100%', marginTop: 4 }}>
                        <Sparkline data={history} color="var(--accent-cyan)" height={90} width={420} />
                        {history.length === 0 && <div className="text-sm text-muted" style={{ paddingTop: 20 }}>Waiting for live data…</div>}
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div><div className="text-xs text-muted">Current</div>
                            <div className="fw-600 text-accent mono">{live?.events_per_sec?.toLocaleString() || '—'} /s</div></div>
                        <div><div className="text-xs text-muted">CPU</div>
                            <div className="fw-600 mono" style={{ color: 'var(--accent-amber)' }}>{live?.cpu_pct || '—'}%</div></div>
                        <div><div className="text-xs text-muted">Memory</div>
                            <div className="fw-600 mono" style={{ color: 'var(--accent-purple)' }}>{live?.mem_pct || '—'}%</div></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
