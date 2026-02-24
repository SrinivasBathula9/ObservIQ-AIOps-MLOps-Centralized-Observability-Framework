import { useState, useEffect } from 'react'
import Sparkline from '../components/Sparkline'

const API = 'http://localhost:8000'

const STAGE_PILL = { production: 'pill-green', staging: 'pill-amber', archived: 'pill-gray' }
const JOB_PILL = { completed: 'pill-green', running: 'pill-blue', queued: 'pill-amber', failed: 'pill-red' }

export default function MLOpsLifecycle() {
    const [models, setModels] = useState([])
    const [jobs, setJobs] = useState([])
    const [feedback, setFeedback] = useState([])
    const [history, setHistory] = useState([])
    const [tab, setTab] = useState('registry')

    useEffect(() => {
        fetch(`${API}/api/v1/mlops/models`).then(r => r.json()).then(setModels)
        fetch(`${API}/api/v1/mlops/jobs`).then(r => r.json()).then(setJobs)
        fetch(`${API}/api/v1/mlops/feedback`).then(r => r.json()).then(setFeedback)
        fetch(`${API}/api/v1/mlops/accuracy-history`).then(r => r.json()).then(setHistory)
    }, [])

    const tabStyle = (t) => ({
        padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
        background: tab === t ? 'rgba(139,92,246,0.18)' : 'transparent',
        color: tab === t ? 'var(--accent-purple)' : 'var(--text-muted)',
        border: tab === t ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
    })

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>MLOps Lifecycle</h1>
                <p>Model registry, accuracy drift monitoring, retraining pipelines & feedback loops</p>
            </div>

            {/* Summary */}
            <div className="grid-4 mb-6">
                {[
                    ['Production Models', models.filter(m => m.stage === 'production').length, 'pill-green'],
                    ['In Staging', models.filter(m => m.stage === 'staging').length, 'pill-amber'],
                    ['Retraining Jobs', jobs.filter(j => j.status === 'running').length, 'pill-blue'],
                    ['Drifted Models', models.filter(m => m.status === 'degraded').length, 'pill-red'],
                ].map(([label, val, cls]) => (
                    <div key={label} className="kpi-card">
                        <div className="kpi-label">{label}</div>
                        <div className="kpi-value"><span className={`pill ${cls}`}>{val}</span></div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mb-6">
                {[['registry', '⊙ Model Registry'], ['jobs', '⟳ Retraining Jobs'], ['drift', '◈ Accuracy Drift'], ['feedback', '⬡ Feedback Loop']].map(([t, l]) => (
                    <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{l}</button>
                ))}
            </div>

            {tab === 'registry' && (
                <div className="card">
                    <div className="card-header"><span className="card-title">Model Registry</span></div>
                    <table className="data-table">
                        <thead><tr>
                            <th>Model Name</th><th>Version</th><th>Stage</th><th>Accuracy</th>
                            <th>Drift %</th><th>Framework</th><th>Samples</th><th>Status</th>
                        </tr></thead>
                        <tbody>{models.map(m => (
                            <tr key={m.id}>
                                <td className="fw-600">{m.name}</td>
                                <td><span className="mono text-xs">{m.version}</span></td>
                                <td><span className={`pill ${STAGE_PILL[m.stage]}`}>{m.stage}</span></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="progress-bar-wrap" style={{ width: 60 }}>
                                            <div className="progress-bar-fill green" style={{ width: `${m.accuracy}%` }}></div>
                                        </div>
                                        <span className="mono text-xs">{m.accuracy}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: m.drift_pct > 6 ? 'var(--accent-red)' : m.drift_pct > 3 ? 'var(--accent-amber)' : 'var(--accent-green)' }}
                                        className="mono fw-600">{m.drift_pct}%</span>
                                </td>
                                <td className="text-xs text-muted">{m.framework}</td>
                                <td className="text-xs text-muted">{m.training_samples?.toLocaleString()}</td>
                                <td><span className={`pill ${m.status === 'healthy' ? 'pill-green' : 'pill-red'}`}>{m.status}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {tab === 'jobs' && (
                <div className="card">
                    <div className="card-header"><span className="card-title">Retraining Job Queue</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {jobs.map(j => (
                            <div key={j.id} className="gauge-wrap">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="fw-600 text-sm">{j.model}</span>
                                        <span className={`pill ${JOB_PILL[j.status]} ml-2`}>{j.status}</span>
                                    </div>
                                    <div className="text-xs text-muted">Trigger: <b className="text-primary">{j.trigger}</b></div>
                                </div>
                                <div className="progress-bar-wrap">
                                    <div className={`progress-bar-fill ${j.status === 'failed' ? 'red' : 'purple'}`}
                                        style={{ width: `${j.progress_pct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted mt-1">
                                    <span>{j.progress_pct}% complete</span>
                                    <span>{j.dataset_size?.toLocaleString()} samples</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'drift' && (
                <div className="card">
                    <div className="card-header"><span className="card-title">Accuracy Drift — 30-Day Trend</span></div>
                    {history.map((s, i) => (
                        <div key={s.model} style={{ marginBottom: 24 }}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-sm fw-600">{s.model}</div>
                                <div className="text-xs text-muted">Latest: {s.points[s.points.length - 1]?.accuracy}%</div>
                            </div>
                            <Sparkline
                                data={s.points.map(p => p.accuracy)}
                                color={['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)'][i % 3]}
                                height={56} width={600} />
                        </div>
                    ))}
                </div>
            )}

            {tab === 'feedback' && (
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Feedback Loop Events</span>
                        <span className="pill pill-purple">{feedback.length} events</span>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Model</th><th>Event Type</th><th>Operator</th><th>Impact</th><th>Time</th></tr></thead>
                        <tbody>{feedback.map(f => (
                            <tr key={f.id}>
                                <td className="text-xs fw-600 truncate" style={{ maxWidth: 160 }}>{f.model}</td>
                                <td><span className="mono text-xs">{f.event_type}</span></td>
                                <td className="text-xs text-muted">{f.operator}</td>
                                <td><span className={`pill ${f.impact === 'high' ? 'pill-red' : f.impact === 'medium' ? 'pill-amber' : 'pill-green'}`}>{f.impact}</span></td>
                                <td className="ts">{new Date(f.ts).toLocaleString()}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
