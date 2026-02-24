/**
 * Animated SVG ring for health / score display.
 */
export default function LiveRing({ value = 0, max = 100, size = 90, color = 'var(--accent-blue)', label = '' }) {
    const r = (size - 14) / 2
    const circumference = 2 * Math.PI * r
    const offset = circumference - (value / max) * circumference
    const pct = Math.round((value / max) * 100)

    return (
        <svg className="score-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
            />
            <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
                fill="var(--text-primary)" fontSize={size * 0.18} fontWeight="700">{value.toFixed ? value.toFixed(0) : value}</text>
            <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle"
                fill="var(--text-muted)" fontSize={size * 0.1}>{label}</text>
        </svg>
    )
}
