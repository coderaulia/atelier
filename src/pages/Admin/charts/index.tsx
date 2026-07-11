import { type ReactNode } from 'react'
import './AdminCharts.css'

// ── Formatters ──

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`
  if (n >= 1_000) return n.toLocaleString('en-US')
  return String(n)
}

export function fmtIDR(amount: number): string {
  if (!amount) return 'IDR 0'
  return `IDR ${amount.toLocaleString('en-US')}`
}

// ── Stat Tile ──

interface StatTileProps {
  label: string
  value: string | number
  sub?: string
  delta?: { value: number; label?: string; upIsGood?: boolean }
  spark?: number[]
}

export function StatTile({ label, value, sub, delta, spark }: StatTileProps) {
  const isUp = delta && delta.value > 0
  const isDown = delta && delta.value < 0
  const deltaGood = delta ? (delta.upIsGood !== false ? isUp : isDown) : false

  return (
    <div className="stat-tile">
      <div className="stat-tile__label">{label}</div>
      <div className="stat-tile__value">{value}</div>
      {delta && delta.value !== 0 && (
        <div className={`stat-tile__delta ${deltaGood ? 'stat-tile__delta--up' : 'stat-tile__delta--down'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(delta.value).toFixed(1)}%
          {delta.label && <span style={{ fontWeight: 400, marginLeft: 4 }}>{delta.label}</span>}
        </div>
      )}
      {sub && <div className="stat-tile__sub">{sub}</div>}
      {spark && spark.length > 0 && (
        <Sparkline data={spark} />
      )}
    </div>
  )
}

// ── Sparkline ──

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(1, ...data)
  return (
    <div className="stat-tile__spark">
      {data.map((v, i) => (
        <div
          key={i}
          className="stat-tile__spark-bar"
          style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

// ── Column Chart (vertical bars with axes, gridlines, hover) ──

interface ColumnChartProps {
  data: { label: string; value: number; tooltip?: string }[]
  height?: number
  color?: string
  formatValue?: (v: number) => string
  emptyText?: string
}

export function ColumnChart({
  data,
  height = 200,
  color,
  formatValue = fmtCompact,
  emptyText = 'No data yet',
}: ColumnChartProps) {
  if (!data.length) {
    return <div className="col-chart__empty" style={{ height }}>{emptyText}</div>
  }

  const max = Math.max(1, ...data.map(d => d.value))
  // Nice round grid steps
  const gridSteps = computeGridSteps(max, 4)
  const gridMax = gridSteps[gridSteps.length - 1] || max

  // Show every Nth x-label to avoid crowding
  const labelInterval = data.length > 20 ? Math.ceil(data.length / 10) : data.length > 12 ? 2 : 1

  return (
    <div className="col-chart viz-root" style={{ height }}>
      {/* Y-axis labels */}
      <div className="col-chart__y-labels">
        {gridSteps.map((step) => (
          <span key={step} className="col-chart__y-label">{fmtCompact(step)}</span>
        ))}
      </div>

      {/* Gridlines */}
      <div className="col-chart__grid">
        {gridSteps.map((step) => (
          <div key={step} className="col-chart__grid-line" />
        ))}
      </div>

      {/* Bars */}
      <div className="col-chart__plot">
        {data.map((d, i) => (
          <div key={i} className="col-chart__bar-wrap">
            <div
              className="col-chart__bar"
              style={{
                height: `${Math.max(2, (d.value / gridMax) * 100)}%`,
                ...(color ? { background: color } : {}),
              }}
              title={d.tooltip || `${d.label}: ${formatValue(d.value)}`}
            >
              <span className="col-chart__bar-val">{formatValue(d.value)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Baseline */}
      <div className="col-chart__baseline" />

      {/* X-axis labels */}
      <div className="col-chart__x-labels">
        {data.map((d, i) => (
          <span
            key={i}
            className="col-chart__x-label"
            style={{ visibility: i % labelInterval === 0 ? 'visible' : 'hidden' }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function computeGridSteps(max: number, count: number): number[] {
  if (max <= 0) return [0]
  const raw = max / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)))
  const residual = raw / magnitude
  let nice: number
  if (residual <= 1.5) nice = 1
  else if (residual <= 3) nice = 2
  else if (residual <= 7) nice = 5
  else nice = 10
  const step = nice * magnitude
  const steps: number[] = []
  for (let v = 0; v <= max + step * 0.1; v += step) {
    steps.push(Math.round(v * 1000) / 1000)
    if (steps.length > count + 1) break
  }
  return steps
}

// ── Horizontal Bar Chart ──

interface HBarItem {
  label: string
  value: number
  sub?: string
  color?: string
}

interface HBarChartProps {
  data: HBarItem[]
  formatValue?: (v: number) => string
  emptyText?: string
  labelWidth?: number
}

export function HBarChart({
  data,
  formatValue = fmtCompact,
  emptyText = 'No data yet',
  labelWidth = 140,
}: HBarChartProps) {
  if (!data.length) {
    return <p className="col-chart__empty" style={{ padding: 24 }}>{emptyText}</p>
  }

  const max = Math.max(1, ...data.map(d => d.value))

  return (
    <div className="h-bar-chart viz-root">
      {data.map((d, i) => (
        <div key={i} className="h-bar-row" style={{ gridTemplateColumns: `${labelWidth}px 1fr auto` }}>
          <span className="h-bar-row__label" title={d.label}>{d.label}</span>
          <div className="h-bar-row__track">
            <div
              className="h-bar-row__fill"
              style={{
                width: `${Math.max(3, (d.value / max) * 100)}%`,
                ...(d.color ? { background: d.color } : {}),
              }}
            />
          </div>
          <span className="h-bar-row__value">
            {formatValue(d.value)}
            {d.sub && <span className="h-bar-row__sub">{d.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Chart Panel (container) ──

interface ChartPanelProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function ChartPanel({ title, subtitle, children, className = '', style }: ChartPanelProps) {
  return (
    <div className={`chart-panel ${className}`} style={style}>
      <h2 className="chart-panel__title">
        {title}
        {subtitle && <span className="chart-panel__subtitle">{subtitle}</span>}
      </h2>
      {children}
    </div>
  )
}

// ── Plan Distribution Tiles ──

interface PlanTileData {
  plan: string
  count: number
}

export function PlanTiles({ data }: { data: PlanTileData[] }) {
  if (!data.length) return <p className="col-chart__empty" style={{ padding: 24 }}>No data yet</p>
  return (
    <div className="plan-tiles viz-root">
      {data.map((p) => (
        <div key={p.plan} className="plan-tile">
          <div className="plan-tile__count">{p.count.toLocaleString()}</div>
          <div className="plan-tile__label">{p.plan}</div>
        </div>
      ))}
    </div>
  )
}

// ── Key Metrics (dl) ──

interface MetricRow {
  label: string
  value: string | number
}

export function KeyMetrics({ data }: { data: MetricRow[] }) {
  return (
    <dl className="viz-metrics viz-root">
      {data.map((m) => (
        <div key={m.label} style={{ display: 'contents' }}>
          <dt>{m.label}</dt>
          <dd>{m.value}</dd>
        </div>
      ))}
    </dl>
  )
}
