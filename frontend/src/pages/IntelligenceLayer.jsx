import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

const API = 'http://localhost:8000'

const NODE_COLORS = {
    router: '#3b82f6', firewall: '#ef4444', server: '#8b5cf6',
    pod: '#06b6d4', database: '#f59e0b', cdn: '#10b981', loadbalancer: '#ec4899',
}
const HEALTH_GLOW = { healthy: '#10b981', degraded: '#f59e0b', critical: '#ef4444' }

function TopologyGraph({ data }) {
    const ref = useRef(null)
    useEffect(() => {
        if (!data || !ref.current) return
        const w = ref.current.clientWidth || 700, h = 420
        d3.select(ref.current).selectAll('*').remove()
        const svg = d3.select(ref.current).append('svg').attr('width', w).attr('height', h)

        svg.append('defs').append('filter').attr('id', 'glow')
            .append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur')

        const sim = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.edges).id(d => d.id).distance(70))
            .force('charge', d3.forceManyBody().strength(-220))
            .force('center', d3.forceCenter(w / 2, h / 2))
            .force('collision', d3.forceCollide(22))

        const link = svg.append('g')
            .selectAll('line').data(data.edges).join('line')
            .attr('stroke', 'rgba(255,255,255,0.07)').attr('stroke-width', 1.2)

        const node = svg.append('g')
            .selectAll('circle').data(data.nodes).join('circle')
            .attr('r', d => d.alerts > 2 ? 14 : 10)
            .attr('fill', d => NODE_COLORS[d.type] || '#64748b')
            .attr('stroke', d => HEALTH_GLOW[d.health] || '#64748b')
            .attr('stroke-width', 2.5)
            .style('cursor', 'grab')
            .call(d3.drag()
                .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
                .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
                .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
            )

        node.append('title').text(d => `${d.label}\nHealth: ${d.health}\nAlerts: ${d.alerts}`)

        sim.on('tick', () => {
            link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
            node.attr('cx', d => Math.max(14, Math.min(w - 14, d.x)))
                .attr('cy', d => Math.max(14, Math.min(h - 14, d.y)))
        })
        return () => sim.stop()
    }, [data])
    return <div ref={ref} style={{ width: '100%', minHeight: 420, background: 'rgba(0,0,0,0.2)', borderRadius: 12 }} />
}

export default function IntelligenceLayer() {
    const [topology, setTopology] = useState(null)
    const [anomalies, setAnomalies] = useState([])
    const [correlations, setCorrelations] = useState([])
    const [tab, setTab] = useState('topology')

    useEffect(() => {
        fetch(`${API}/api/v1/intelligence/topology`).then(r => r.json()).then(setTopology)
        fetch(`${API}/api/v1/intelligence/anomalies`).then(r => r.json()).then(setAnomalies)
        fetch(`${API}/api/v1/intelligence/correlations`).then(r => r.json()).then(setCorrelations)
    }, [])

    const tabStyle = (t) => ({
        padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
        background: tab === t ? 'rgba(59,130,246,0.18)' : 'transparent',
        color: tab === t ? 'var(--accent-blue)' : 'var(--text-muted)',
        border: tab === t ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        transition: 'all 0.15s ease',
    })

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Intelligence Layer</h1>
                <p>Topology-aware AIOps correlation, anomaly detection & root cause analysis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[['topology', '⊞ Topology Map'], ['anomalies', '⚠ Anomalies'], ['correlations', '⇒ Correlations']].map(([t, l]) => (
                    <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{l}</button>
                ))}
            </div>

            {tab === 'topology' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Live Infrastructure Topology</span>
                        <div className="flex gap-2">
                            {Object.entries(NODE_COLORS).map(([type, color]) => (
                                <span key={type} className="flex items-center gap-2 text-xs text-muted">
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}></span>{type}
                                </span>
                            ))}
                        </div>
                    </div>
                    {topology ? <TopologyGraph data={topology} /> : <div className="empty-state"><div className="empty-icon">◌</div><p>Loading topology…</p></div>}
                    <div className="flex gap-4 mt-4 text-xs text-muted">
                        <span>Nodes: <b className="text-primary">{topology?.nodes?.length}</b></span>
                        <span>Edges: <b className="text-primary">{topology?.edges?.length}</b></span>
                        <span style={{ color: HEALTH_GLOW.critical }}>● Critical</span>
                        <span style={{ color: HEALTH_GLOW.degraded }}>● Degraded</span>
                        <span style={{ color: HEALTH_GLOW.healthy }}>● Healthy</span>
                    </div>
                </div>
            )}

            {tab === 'anomalies' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Detected Anomalies</span>
                        <span className="pill pill-red">{anomalies.length} Active</span>
                    </div>
                    <table className="data-table">
                        <thead><tr>
                            <th>Category</th><th>Service</th><th>Anomaly Score</th>
                            <th>Correlated Events</th><th>Status</th><th>Detected</th>
                        </tr></thead>
                        <tbody>{anomalies.map(a => (
                            <tr key={a.id}>
                                <td><span className="mono text-xs">{a.category}</span></td>
                                <td><span className="pill pill-blue">{a.service}</span></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="progress-bar-wrap" style={{ width: 80 }}>
                                            <div className="progress-bar-fill red" style={{ width: `${a.score * 100}%` }}></div>
                                        </div>
                                        <span className="mono text-xs" style={{ color: a.score > 0.8 ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                                            {(a.score * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="text-accent fw-600">{a.correlated_events}</td>
                                <td><span className={`pill ${a.status === 'open' ? 'pill-red' : a.status === 'investigating' ? 'pill-amber' : 'pill-green'}`}>{a.status}</span></td>
                                <td className="ts">{new Date(a.detected_at).toLocaleTimeString()}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'correlations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {correlations.map(c => (
                        <div key={c.id} className="card">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="pill pill-purple">RCA #{c.id}</span>
                                    <span className="text-xs text-muted ml-2">Confidence: <b style={{ color: 'var(--accent-green)' }}>{(c.confidence * 100).toFixed(0)}%</b></span>
                                </div>
                                <span className="pill pill-red">Impact: {c.impact_score.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {c.chain.map((node, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        <span className={`pill ${i === 0 ? 'pill-red' : 'pill-blue'}`}>{node}</span>
                                        {i < c.chain.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-muted mt-3">
                                {c.event_count} events correlated · {new Date(c.detected_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
