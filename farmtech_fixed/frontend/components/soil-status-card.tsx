'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { apiFetch, API } from '@/lib/api'

interface SoilData {
  nitrogen: number
  phosphorus: number
  potassium: number
  ph: number
  moisture: number
}

interface Props {
  externalData?: SoilData | null
  externalLoading?: boolean
}

/** Circular SVG gauge for soil moisture */
function MoistureGauge({ value, loading }: { value: number; loading: boolean }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, value))
  const offset = circumference - (pct / 100) * circumference

  const color =
    pct >= 60 ? '#22c55e' :
    pct >= 35 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted/40"
          />
          {/* Progress */}
          {!loading && (
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-10 h-5 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <span className="text-xl font-black" style={{ color }}>{pct}%</span>
              <span className="text-[10px] text-muted-foreground leading-none">💧</span>
            </>
          )}
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground text-center">Soil Moisture</p>
    </div>
  )
}

/** Single NPK progress bar */
function NutrientBar({
  label,
  value,
  max,
  unit,
  color,
  loading,
}: {
  label: string
  value: number
  max: number
  unit: string
  color: string
  loading: boolean
}) {
  const pct = Math.min(100, (value / max) * 100)
  const status = pct >= 70 ? 'Optimal' : pct >= 40 ? 'Good' : 'Low'
  const statusColor =
    pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
          {loading
            ? <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
            : <span className="text-sm font-bold text-foreground tabular-nums">
                {value}<span className="text-xs ms-0.5 text-muted-foreground">{unit}</span>
              </span>
          }
        </div>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
        {loading
          ? <div className="h-2 w-1/2 bg-muted animate-pulse rounded-full" />
          : <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: color }}
            />
        }
      </div>
    </div>
  )
}

export default function SoilStatusCard({ externalData, externalLoading }: Props = {}) {
  const { t } = useLanguage()
  const s = t.dashboard.soil

  const [data, setData] = useState<SoilData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If parent passes external data, skip internal fetch
    if (externalData !== undefined || externalLoading !== undefined) {
      setLoading(false)
      return
    }
    async function fetchData() {
      try {
        const res = await apiFetch(API.dashboard)
        if (res.ok) {
          const json = await res.json()
          if (json.latest_soil_record) setData(json.latest_soil_record)
        }
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayData = externalData ?? data
  const isLoading   = externalLoading ?? loading

  const n = displayData?.nitrogen   ?? 0
  const p = displayData?.phosphorus ?? 0
  const k = displayData?.potassium  ?? 0
  const ph        = displayData?.ph       ?? 0
  const moisture  = displayData?.moisture ?? 0

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Title */}
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2 pb-3 border-b border-border">
        <svg className="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.92 7.02C17.45 4.18 14.97 2 12 2c-2.97 0-5.45 2.18-5.92 5.02C5.97 7.42 4.25 9.35 4.25 11.75c0 3.29 2.67 5.95 5.96 5.95h11.04c2.08 0 3.71-1.97 3.71-4.25 0-2.16-1.67-3.98-3.79-4.15z" />
        </svg>
        {s.title}
      </h2>

      <div className="flex gap-4 items-start">
        {/* Left: NPK Bars + pH */}
        <div className="flex-1 space-y-3.5">
          <NutrientBar
            label={s.nitrogen}
            value={n}
            max={150}
            unit="ppm"
            color="linear-gradient(90deg,#4ade80,#22c55e)"
            loading={isLoading}
          />
          <NutrientBar
            label={s.phosphorus}
            value={p}
            max={100}
            unit="ppm"
            color="linear-gradient(90deg,#fb923c,#f97316)"
            loading={isLoading}
          />
          <NutrientBar
            label={s.potassium}
            value={k}
            max={200}
            unit="ppm"
            color="linear-gradient(90deg,#818cf8,#6366f1)"
            loading={isLoading}
          />

          {/* pH row */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
            <span className="text-sm font-medium text-muted-foreground">{s.ph}</span>
            {isLoading
              ? <div className="h-5 w-10 bg-muted animate-pulse rounded" />
              : <span className="text-sm font-bold text-foreground">
                  {ph > 0 ? ph.toFixed(1) : '--'}
                  <span className={`ms-2 text-xs font-semibold ${
                    ph >= 6 && ph <= 7.5 ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {ph >= 6 && ph <= 7.5 ? s.optimal : s.good}
                  </span>
                </span>
            }
          </div>
        </div>

        {/* Right: Moisture Gauge */}
        <div className="shrink-0">
          <MoistureGauge value={moisture} loading={isLoading} />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/30 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <p className="text-xs text-muted-foreground">{s.summary}</p>
      </div>
    </div>
  )
}
