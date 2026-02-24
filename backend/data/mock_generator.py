"""
Mock data generator — deterministic, realistic data for all framework entities.
"""
import random
import time
from datetime import datetime, timedelta

random.seed(42)

VENDORS = [
    "Cisco", "Palo Alto Networks", "Fortinet", "Juniper", "CheckPoint",
    "AWS CloudWatch", "Azure Monitor", "GCP Cloud Logging", "Datadog", "Splunk",
    "Kubernetes", "Prometheus", "Zabbix", "Nagios", "SolarWinds",
    "CrowdStrike", "Elastic", "Dynatrace", "New Relic", "OpenTelemetry"
]

SEVERITIES = ["P1", "P2", "P3", "P4"]
ALERT_STATUSES = ["active", "acknowledged", "resolved", "investigating"]
SERVICES = [
    "api-gateway", "auth-service", "payments", "inventory", "notification",
    "ml-inference", "data-pipeline", "cdn", "vpc-router", "firewall-cluster"
]
MODEL_NAMES = [
    "AnomalyDetector-LSTM", "TopologyCorrelator-GNN", "RCA-RandomForest",
    "LogClassifier-BERT", "ThreatScorer-XGBoost", "LatencyPredictor-Prophet",
    "MetricForecaster-SARIMA", "AlertDeduplicator-AE", "SentimentNLP", "DriftDetector-IQR"
]
PIPELINE_STATUSES = ["healthy", "healthy", "healthy", "degraded", "down"]
ROUTING_TARGETS = ["Alertmanager", "PagerDuty", "Slack#ops", "Email-NOC", "ServiceNow", "Jira"]


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


def past_iso(minutes_ago: int):
    return (datetime.utcnow() - timedelta(minutes=minutes_ago)).isoformat() + "Z"


# ─── Overview KPIs ────────────────────────────────────────────────────────────
def get_kpis():
    base_events = 4_823_441
    delta = random.randint(-5000, 15000)
    return {
        "total_events_ingested": base_events + delta,
        "events_per_second": round(random.uniform(1200, 1800), 1),
        "active_alerts": random.randint(12, 28),
        "critical_alerts": random.randint(2, 6),
        "pipeline_health_score": round(random.uniform(88, 98), 1),
        "model_accuracy_avg": round(random.uniform(91, 97), 2),
        "mttr_minutes": round(random.uniform(6.2, 9.8), 1),
        "vendors_connected": len(VENDORS),
        "topology_nodes": 247,
        "topology_edges": 512,
        "updated_at": now_iso(),
    }


# ─── Live stream tick ─────────────────────────────────────────────────────────
def get_live_tick():
    return {
        "ts": now_iso(),
        "events_per_sec": round(random.uniform(1100, 1900), 1),
        "cpu_pct": round(random.uniform(22, 68), 1),
        "mem_pct": round(random.uniform(40, 72), 1),
        "alert_delta": random.choice([-1, 0, 0, 0, 1, 2]),
        "active_alerts": random.randint(12, 30),
    }


# ─── Ingestion Hub ────────────────────────────────────────────────────────────
def get_connectors():
    connectors = []
    for i, vendor in enumerate(VENDORS):
        status = random.choice(PIPELINE_STATUSES)
        connectors.append({
            "id": f"conn-{i+1:03d}",
            "vendor": vendor,
            "type": random.choice(["Syslog", "SNMP", "REST API", "gRPC", "Kafka", "Agent", "OpenTelemetry"]),
            "status": status,
            "events_per_min": random.randint(200, 12000) if status != "down" else 0,
            "last_seen": past_iso(random.randint(0, 15)),
            "schema_version": f"v{random.randint(1,3)}.{random.randint(0,9)}",
            "normalised_fields": random.randint(18, 64),
            "latency_ms": round(random.uniform(1.2, 45.0), 1) if status != "down" else None,
        })
    return connectors


def get_ingestion_throughput():
    """Time-series throughput for the last 60 minutes, per top-5 vendors."""
    top5 = VENDORS[:5]
    series = []
    for vendor in top5:
        points = []
        for m in range(59, -1, -1):
            points.append({
                "ts": past_iso(m),
                "value": random.randint(3000, 18000),
            })
        series.append({"vendor": vendor, "points": points})
    return series


# ─── Intelligence Layer ───────────────────────────────────────────────────────
def get_topology():
    nodes = []
    edges = []
    node_types = ["router", "firewall", "server", "pod", "database", "cdn", "loadbalancer"]
    envs = ["prod", "staging", "dev"]
    for i in range(60):
        nodes.append({
            "id": f"node-{i}",
            "label": f"{random.choice(node_types)}-{i:02d}",
            "type": random.choice(node_types),
            "env": random.choice(envs),
            "health": random.choice(["healthy", "healthy", "healthy", "degraded", "critical"]),
            "alerts": random.randint(0, 5),
        })
    for i in range(90):
        src = random.randint(0, 59)
        tgt = random.randint(0, 59)
        if src != tgt:
            edges.append({
                "source": f"node-{src}",
                "target": f"node-{tgt}",
                "latency_ms": round(random.uniform(0.5, 120), 1),
                "error_rate": round(random.uniform(0, 5), 2),
            })
    return {"nodes": nodes, "edges": edges}


def get_anomalies():
    anomalies = []
    categories = ["latency_spike", "error_rate_surge", "traffic_anomaly", "auth_failure_burst", "log_volume_drop"]
    for i in range(20):
        anomalies.append({
            "id": f"ano-{i+1:04d}",
            "category": random.choice(categories),
            "service": random.choice(SERVICES),
            "score": round(random.uniform(0.55, 0.99), 3),
            "detected_at": past_iso(random.randint(0, 120)),
            "description": f"Detected unusual pattern in {random.choice(SERVICES)} metrics.",
            "status": random.choice(["open", "open", "investigating", "resolved"]),
            "correlated_events": random.randint(3, 45),
        })
    return sorted(anomalies, key=lambda x: x["score"], reverse=True)


def get_correlations():
    correlations = []
    for i in range(10):
        chain_len = random.randint(2, 5)
        chain = [random.choice(SERVICES) for _ in range(chain_len)]
        correlations.append({
            "id": f"corr-{i+1:04d}",
            "root_cause": chain[0],
            "chain": chain,
            "confidence": round(random.uniform(0.70, 0.99), 2),
            "impact_score": round(random.uniform(30, 100), 1),
            "detected_at": past_iso(random.randint(1, 60)),
            "event_count": random.randint(10, 200),
        })
    return correlations


# ─── Alerts & Incidents ───────────────────────────────────────────────────────
ALERT_TITLES = [
    "High CPU utilization detected",
    "Memory threshold exceeded",
    "Network packet loss > 5%",
    "Authentication failures spike",
    "API latency P99 > 2s",
    "Disk I/O saturation",
    "Firewall rule violation burst",
    "Certificate expiry in 7 days",
    "BGP route flapping detected",
    "Database connection pool exhausted",
    "ML model accuracy drift detected",
    "Log ingestion pipeline stalled",
    "Anomalous outbound traffic pattern",
    "DNS resolution failure rate elevated",
    "Service mesh mTLS handshake failures",
]


def get_alerts():
    alerts = []
    for i in range(25):
        sev = random.choice(SEVERITIES)
        status = random.choice(ALERT_STATUSES)
        created = random.randint(1, 180)
        alerts.append({
            "id": f"INC-{10000 + i}",
            "title": random.choice(ALERT_TITLES),
            "severity": sev,
            "status": status,
            "service": random.choice(SERVICES),
            "source_vendor": random.choice(VENDORS),
            "created_at": past_iso(created),
            "updated_at": past_iso(random.randint(0, created)),
            "assignee": random.choice(["noc-team", "platform-eng", "security", "unassigned"]),
            "probable_cause": f"Correlated with anomaly in {random.choice(SERVICES)}.",
            "runbook_url": f"https://wiki.internal/runbooks/{sev.lower()}-alert-response",
            "correlated_alerts": random.randint(0, 8),
            "ttd_minutes": round(random.uniform(0.5, 15), 1),
        })
    return sorted(alerts, key=lambda x: (SEVERITIES.index(x["severity"]), x["created_at"]))


# ─── MLOps Lifecycle ──────────────────────────────────────────────────────────
def get_models():
    models = []
    for i, name in enumerate(MODEL_NAMES):
        acc = round(random.uniform(84.0, 98.5), 2)
        drift = round(random.uniform(0.0, 8.5), 2)
        models.append({
            "id": f"mdl-{i+1:03d}",
            "name": name,
            "version": f"{random.randint(1,4)}.{random.randint(0,9)}.{random.randint(0,9)}",
            "stage": random.choice(["production", "production", "staging", "archived"]),
            "accuracy": acc,
            "drift_pct": drift,
            "status": "degraded" if drift > 6 else "healthy",
            "last_trained": past_iso(random.randint(1440, 20160)),
            "next_retrain": past_iso(-random.randint(30, 2880)),
            "training_samples": random.randint(50_000, 2_000_000),
            "framework": random.choice(["scikit-learn", "PyTorch", "TensorFlow", "XGBoost", "statsmodels"]),
        })
    return models


def get_retraining_jobs():
    jobs = []
    statuses = ["queued", "running", "completed", "failed"]
    for i in range(8):
        progress = random.randint(0, 100)
        jobs.append({
            "id": f"job-{i+1:04d}",
            "model": random.choice(MODEL_NAMES),
            "trigger": random.choice(["drift_threshold", "scheduled", "manual", "accuracy_drop"]),
            "status": random.choice(statuses),
            "progress_pct": progress,
            "started_at": past_iso(random.randint(5, 120)),
            "estimated_completion": past_iso(-random.randint(10, 60)),
            "dataset_size": random.randint(10_000, 500_000),
        })
    return jobs


def get_feedback_events():
    events = []
    for i in range(30):
        events.append({
            "id": f"fb-{i+1:04d}",
            "model": random.choice(MODEL_NAMES),
            "event_type": random.choice(["false_positive", "false_negative", "confirmed_anomaly", "operator_override"]),
            "operator": random.choice(["alice@ops", "bob@noc", "carol@mleng", "automated"]),
            "ts": past_iso(random.randint(0, 720)),
            "impact": random.choice(["low", "medium", "high"]),
        })
    return sorted(events, key=lambda x: x["ts"], reverse=True)


def get_model_accuracy_history():
    """30-day accuracy trend for top 3 models."""
    series = []
    for name in MODEL_NAMES[:3]:
        points = []
        acc = random.uniform(90, 97)
        for d in range(29, -1, -1):
            acc += random.uniform(-0.5, 0.4)
            acc = max(80, min(99.9, acc))
            points.append({
                "date": (datetime.utcnow() - timedelta(days=d)).strftime("%Y-%m-%d"),
                "accuracy": round(acc, 2),
            })
        series.append({"model": name, "points": points})
    return series


# ─── Routing & Pipelines ──────────────────────────────────────────────────────
def get_routing_rules():
    rules = []
    conditions = [
        "severity == P1", "source_vendor == 'Cisco'", "service == 'payments'",
        "anomaly_score > 0.85", "event_type == 'auth_failure'", "env == 'prod'",
        "topology_depth > 3", "correlated_alerts > 5",
    ]
    for i in range(12):
        rules.append({
            "id": f"rule-{i+1:04d}",
            "name": f"Route-{chr(65+i)}",
            "condition": random.choice(conditions),
            "target": random.choice(ROUTING_TARGETS),
            "priority": random.randint(1, 10),
            "enabled": random.choice([True, True, True, False]),
            "matches_last_hour": random.randint(0, 450),
            "avg_latency_ms": round(random.uniform(2, 80), 1),
        })
    return sorted(rules, key=lambda x: x["priority"])


def get_pipeline_throughput():
    """Last 30 minutes pipeline throughput."""
    points = []
    for m in range(29, -1, -1):
        points.append({
            "ts": past_iso(m),
            "events_in": random.randint(8000, 25000),
            "events_routed": random.randint(7500, 24000),
            "events_dropped": random.randint(0, 200),
            "p99_latency_ms": round(random.uniform(15, 120), 1),
        })
    return points
