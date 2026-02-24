/**
 * Inline SVG sparkline — accepts an array of numbers.
 */
export default function Sparkline({ data = [], color = 'var(--accent-blue)', height = 36, width = 100 }) {
    if (!data.length) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    })
    const path = `M${pts.join(' L')}`
    const fill = `M${pts[0]} L${pts.join(' L')} L${width},${height} L0,${height} Z`
    return (
        <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width={width} height={height} preserveAspectRatio="none">
            <defs>
                <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fill} fill={`url(#sg-${color})`} />
            <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
