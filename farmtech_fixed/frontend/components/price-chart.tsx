'use client'

import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/lib/language-context'
import { fetchForecast, fetchFarms } from '@/lib/api'

export default function PriceChart() {
  const { t, language } = useLanguage()
  const P = t.dashboard.priceChart

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCrops, setActiveCrops] = useState<string[]>(['Wheat', 'Corn', 'Rice'])

  useEffect(() => {
    fetchFarms().then(farms => {
      let crops = ['Wheat', 'Corn', 'Rice']
      if (farms && farms.length > 0) {
        const plotsWithCrops = farms.flatMap(f => 
          (f.plots || []).filter((p: any) => p.crop_type)
            .map((p: any) => p.crop_type.charAt(0).toUpperCase() + p.crop_type.slice(1).toLowerCase())
        )
        if (plotsWithCrops.length > 0) {
          crops = Array.from(new Set(plotsWithCrops)).slice(0, 3) // Max 3 crops for the chart
        }
      }
      setActiveCrops(crops)
      
      const promises = crops.map(c => fetchForecast(c).catch(() => []))
      
      Promise.all(promises).then((results) => {
        const quarters = new Set<string>()
        const map: Record<string, any> = {}

        const process = (commodityData: any[], key: string) => {
          commodityData.forEach((item) => {
            const qStr = `Q${item.quarter} ${item.year}`
            quarters.add(qStr)
            if (!map[qStr]) {
              map[qStr] = { month: qStr }
              crops.forEach(c => map[qStr][c.toLowerCase()] = 0)
            }
            map[qStr][key.toLowerCase()] = Math.round(item.price)
          })
        }

        crops.forEach((c, i) => process(results[i], c))

        // Sort quarters chronologically
        const sorted = Array.from(quarters).sort((a, b) => {
          const [qa, ya] = a.split(' ')
          const [qb, yb] = b.split(' ')
          if (ya !== yb) return ya.localeCompare(yb)
          return qa.localeCompare(qb)
        })

        const finalRows = sorted.map(q => map[q])
        setData(finalRows)
      }).finally(() => setLoading(false))
    }).catch(err => {
      setLoading(false)
    })
  }, [])

  const maxValue = useMemo(() => {
    let max = 100
    data.forEach((item) => {
      activeCrops.forEach(c => {
        max = Math.max(max, item[c.toLowerCase()] || 0)
      })
    })
    return max * 1.15 // Add margin for bars
  }, [data, activeCrops])

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-secondary shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 10 11.41l4 4 6.3-6.29L22 12v-6z" />
          </svg>
          {P.title}
        </h2>
        <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full">{P.badge}</span>
      </div>

      <div className="space-y-4 min-h-[150px] flex flex-col justify-center">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                <div className="h-6 w-full bg-muted/40 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm gap-2">
                <span className="font-semibold text-muted-foreground">{item.month}</span>
                <div className="flex gap-4 text-xs flex-wrap justify-end">
                  {activeCrops.map((c, i) => (
                    <span key={c} className="flex items-center gap-1 font-semibold">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-chart-1' : i === 1 ? 'bg-chart-2' : 'bg-chart-3'}`} />
                      {P[c.toLowerCase()] || c}: {item[c.toLowerCase()] ? `${item[c.toLowerCase()].toLocaleString()} EGP` : '--'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 h-6">
                {activeCrops.map((c, i) => (
                  <div
                    key={c}
                    className={`rounded opacity-85 transition-all duration-500 ${i === 0 ? 'bg-chart-1' : i === 1 ? 'bg-chart-2' : 'bg-chart-3'}`}
                    style={{ width: `${((item[c.toLowerCase()] || 0) / maxValue) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{language === 'ar' ? 'لا توجد بيانات أسعار متاحة حالياً' : 'No market price data available'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
