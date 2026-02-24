import { useLocation } from 'react-router-dom'

const PAGE_META = {
    '/': { title: 'Platform Overview', sub: 'Real-time AIOps operational intelligence' },
    '/ingestion': { title: 'Ingestion Hub', sub: 'Universal vendor adapter layer & data collectors' },
    '/intelligence': { title: 'Intelligence Layer', sub: 'Topology-aware correlation & anomaly detection' },
    '/alerts': { title: 'Alerts & Incidents', sub: 'Prioritised incident management & runbook automation' },
    '/mlops': { title: 'MLOps Lifecycle', sub: 'Model registry, drift detection & retraining pipelines' },
    '/routing': { title: 'Routing & Pipelines', sub: 'High-performance event routing & rule engine' },
    '/settings': { title: 'Settings & Connectors', sub: 'Platform configuration & connector management' },
}

export default function TopBar({ liveMetrics }) {
    const { pathname } = useLocation()
    const meta = PAGE_META[pathname] || PAGE_META['/']

    return (
        <header className="topbar">
            <div>
                <div className="topbar-title">{meta.title}</div>
                <div className="topbar-subtitle">{meta.sub}</div>
            </div>
            <div className="topbar-right">
                {liveMetrics && (
                    <>
                        <div className="topbar-metric">
                            <span className="metric-label">Events/s</span>
                            <span className="metric-value">{liveMetrics.events_per_sec?.toLocaleString()}</span>
                        </div>
                        <div className="topbar-metric">
                            <span className="metric-label">Alerts</span>
                            <span className="metric-value" style={{ color: 'var(--accent-red)' }}>
                                {liveMetrics.active_alerts}
                            </span>
                        </div>
                        <div className="topbar-metric">
                            <span className="metric-label">CPU</span>
                            <span className="metric-value">{liveMetrics.cpu_pct}%</span>
                        </div>
                    </>
                )}
                <div className="topbar-metric">
                    <div className="live-dot"></div>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.8rem' }}>LIVE</span>
                </div>
            </div>
        </header>
    )
}
