import { useNavigate, useLocation } from 'react-router-dom'

const NAV = [
    { section: 'Platform' },
    { path: '/', icon: '⬡', label: 'Overview' },
    { path: '/ingestion', icon: '⇄', label: 'Ingestion Hub' },
    { section: 'Intelligence' },
    { path: '/intelligence', icon: '◈', label: 'Intelligence Layer' },
    { path: '/alerts', icon: '⚡', label: 'Alerts & Incidents' },
    { section: 'Operations' },
    { path: '/mlops', icon: '⚙', label: 'MLOps Lifecycle' },
    { path: '/routing', icon: '⇢', label: 'Routing & Pipelines' },
    { section: 'System' },
    { path: '/settings', icon: '⊟', label: 'Settings' },
]

export default function Sidebar() {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">◈</div>
                <div className="sidebar-logo-text">
                    <h2>ObservIQ</h2>
                    <span>AIOps Platform</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {NAV.map((item, i) =>
                    item.section ? (
                        <div key={i} className="nav-section-label">{item.section}</div>
                    ) : (
                        <div
                            key={item.path}
                            className={`nav-item${pathname === item.path ? ' active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </div>
                    )
                )}
            </nav>
            <div className="sidebar-footer">
                <span className="version-tag">● Live</span>  v1.0.0
            </div>
        </aside>
    )
}
