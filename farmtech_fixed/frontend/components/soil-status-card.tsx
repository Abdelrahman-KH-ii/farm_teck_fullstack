import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/lib/language-context'
import { apiFetch, API } from '@/lib/api'

export default function SoilStatusCard() {
  const { t } = useLanguage()
  const s = t.dashboard.soil
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiFetch(API.dashboard)
        if (res.ok) {
          const json = await res.json()
          setData(json.latest_soil_record)
        }
      } catch (err) {
        console.error("Failed to fetch soil data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const soilMetrics = useMemo(
    () => [
      { label: s.nitrogen, value: data?.nitrogen || 0, unit: 'ppm', status: (data?.nitrogen > 60 ? 'optimal' : 'good') as any },
      { label: s.phosphorus, value: data?.phosphorus || 0, unit: 'ppm', status: (data?.phosphorus > 40 ? 'optimal' : 'good') as any },
      { label: s.potassium, value: data?.potassium || 0, unit: 'ppm', status: (data?.potassium > 80 ? 'optimal' : 'good') as any },
      { label: s.ph, value: data?.ph || 0, unit: '', status: (data?.ph > 6 ? 'optimal' : 'good') as any },
      { label: s.moisture, value: data?.moisture || 0, unit: '%', status: (data?.moisture > 50 ? 'optimal' : 'good') as any },
    ],
    [s, data]
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'text-primary bg-primary/10'
      case 'good':
        return 'text-secondary bg-secondary/10'
      default:
        return 'text-muted-foreground bg-muted/10'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 pb-4 border-b border-border">
        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.92 7.02C17.45 4.18 14.97 2 12 2c-2.97 0-5.45 2.18-5.92 5.02C5.97 7.42 4.25 9.35 4.25 11.75c0 3.29 2.67 5.95 5.96 5.95h11.04c2.08 0 3.71-1.97 3.71-4.25 0-2.16-1.67-3.98-3.79-4.15z" />
        </svg>
        {s.title}
      </h2>

      <div className="space-y-4">
        {soilMetrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50 hover:border-border rounded-lg p-4 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{metric.label}</p>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStatusColor(metric.status)}`}>
                {metric.value}
                {metric.unit ? <span className="text-xs ms-0.5">{metric.unit}</span> : null}
              </span>
            </div>
            <div className="w-full bg-border/50 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  metric.status === 'optimal' ? 'bg-gradient-to-r from-primary to-accent' : 'bg-gradient-to-r from-secondary to-primary/60'
                }`}
                style={{ width: `${Math.min(100, (metric.value / 100) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-r from-accent/10 to-primary/5 border border-accent/40 rounded-lg p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <p className="text-sm text-muted-foreground">{s.summary}</p>
      </div>
    </div>
  )
}
