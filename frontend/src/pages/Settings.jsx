const CONNECTORS_PREVIEW = [
    { name: 'Cisco Syslog', type: 'Syslog', status: 'healthy' },
    { name: 'AWS CloudWatch', type: 'REST API', status: 'healthy' },
    { name: 'Palo Alto NGFW', type: 'SNMP', status: 'degraded' },
    { name: 'Kubernetes Events', type: 'Agent', status: 'healthy' },
]

const NOTIFICATION_CHANNELS = [
    { name: 'PagerDuty', icon: '🔔', status: 'configured' },
    { name: 'Slack #ops-alerts', icon: '💬', status: 'configured' },
    { name: 'Email NOC Team', icon: '✉', status: 'configured' },
    { name: 'ServiceNow', icon: '🎫', status: 'pending' },
]

const RBAC_ROLES = [
    { role: 'Platform Admin', users: 3, perms: 'Full Access' },
    { role: 'NOC Engineer', users: 12, perms: 'Read + Acknowledge' },
    { role: 'ML Engineer', users: 5, perms: 'MLOps Full Access' },
    { role: 'Read-Only', users: 8, perms: 'Dashboard View' },
]

function Section({ title, children }) {
    return (
        <div className="card mb-6">
            <div className="card-header"><span className="card-title">{title}</span></div>
            {children}
        </div>
    )
}

export default function Settings() {
    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Settings & Configuration</h1>
                <p>Connector management, RBAC roles and notification channel settings</p>
            </div>

            {/* Platform Config */}
            <Section title="Platform Configuration">
                <div className="grid-2">
                    {[
                        ['Data Retention', '90 days', 'var(--accent-blue)'],
                        ['Normalisation Schema', 'v2.4 (OCSF)', 'var(--accent-green)'],
                        ['ML Inference Endpoint', 'http://ml-service:8080', 'var(--accent-purple)'],
                        ['Alerting Threshold', 'Anomaly Score > 0.75', 'var(--accent-amber)'],
                        ['Retraining Schedule', 'Every 7 days or drift > 5%', 'var(--accent-cyan)'],
                        ['Topology Refresh', '30 seconds', 'var(--accent-pink)'],
                    ].map(([k, v, c]) => (
                        <div key={k} className="gauge-wrap flex items-center justify-between">
                            <div className="text-xs text-muted">{k}</div>
                            <div className="mono text-xs fw-600" style={{ color: c }}>{v}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Connector Management */}
            <Section title="Connector Management">
                <div style={{ marginBottom: 16 }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>+ Add Connector</button>
                </div>
                <table className="data-table">
                    <thead><tr><th>Connector</th><th>Protocol</th><th>Health</th><th>Actions</th></tr></thead>
                    <tbody>
                        {CONNECTORS_PREVIEW.map(c => (
                            <tr key={c.name}>
                                <td className="fw-600">{c.name}</td>
                                <td><span className="pill pill-blue">{c.type}</span></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className={`status-dot ${c.status}`}></div>
                                        {c.status}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Edit</button>
                                        <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--accent-red)' }}>Remove</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* RBAC */}
            <Section title="Role-Based Access Control (RBAC)">
                <table className="data-table">
                    <thead><tr><th>Role</th><th>Users</th><th>Permissions</th><th>Actions</th></tr></thead>
                    <tbody>
                        {RBAC_ROLES.map(r => (
                            <tr key={r.role}>
                                <td className="fw-600">{r.role}</td>
                                <td><span className="pill pill-blue">{r.users}</span></td>
                                <td className="text-secondary text-sm">{r.perms}</td>
                                <td><button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Manage</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Notification Channels */}
            <Section title="Notification Channels">
                <div className="grid-2">
                    {NOTIFICATION_CHANNELS.map(n => (
                        <div key={n.name} className="gauge-wrap flex items-center justify-between">
                            <div className="flex items-center gap-2 fw-600">
                                <span style={{ fontSize: '1.2rem' }}>{n.icon}</span> {n.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`pill ${n.status === 'configured' ? 'pill-green' : 'pill-amber'}`}>{n.status}</span>
                                <button className="btn btn-ghost" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>Configure</button>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    )
}
