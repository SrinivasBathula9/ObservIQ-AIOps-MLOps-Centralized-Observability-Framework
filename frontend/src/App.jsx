import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Overview from './pages/Overview'
import IngestionHub from './pages/IngestionHub'
import IntelligenceLayer from './pages/IntelligenceLayer'
import AlertsIncidents from './pages/AlertsIncidents'
import MLOpsLifecycle from './pages/MLOpsLifecycle'
import RoutingPipelines from './pages/RoutingPipelines'
import Settings from './pages/Settings'

const WS_URL = 'ws://localhost:8000/ws/live'

export default function App() {
    const [liveMetrics, setLiveMetrics] = useState(null)
    const wsRef = useRef(null)

    useEffect(() => {
        function connect() {
            try {
                const ws = new WebSocket(WS_URL)
                wsRef.current = ws
                ws.onmessage = (e) => {
                    try { setLiveMetrics(JSON.parse(e.data)) } catch (_) { }
                }
                ws.onclose = () => setTimeout(connect, 3000)
                ws.onerror = () => ws.close()
            } catch (_) { }
        }
        connect()
        return () => wsRef.current?.close()
    }, [])

    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar />
                <div className="main-wrapper">
                    <TopBar liveMetrics={liveMetrics} />
                    <main className="page-content">
                        <Routes>
                            <Route path="/" element={<Overview live={liveMetrics} />} />
                            <Route path="/ingestion" element={<IngestionHub />} />
                            <Route path="/intelligence" element={<IntelligenceLayer />} />
                            <Route path="/alerts" element={<AlertsIncidents />} />
                            <Route path="/mlops" element={<MLOpsLifecycle />} />
                            <Route path="/routing" element={<RoutingPipelines />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </BrowserRouter>
    )
}
