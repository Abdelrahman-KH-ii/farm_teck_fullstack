'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/lib/language-context'

export default function PriceChart() {
  const { t } = useLanguage()
  const P = t.dashboard.priceChart

  const data: any[] = useMemo(
    () => [],
    []
  )

  const maxValue = 400

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
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm gap-2">
                <span className="font-medium">{item.month}</span>
                <div className="flex gap-4 text-xs flex-wrap justify-end">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-chart-1 rounded-full shrink-0" />
                    {P.wheat}: {item.wheat}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-chart-2 rounded-full shrink-0" />
                    {P.corn}: {item.corn}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-chart-3 rounded-full shrink-0" />
                    {P.rice}: {item.rice}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 h-6">
                <div
                  className="flex-1 bg-chart-1 rounded opacity-70"
                  style={{ width: `${(item.wheat / maxValue) * 100}%` }}
                />
                <div
                  className="flex-1 bg-chart-2 rounded opacity-70"
                  style={{ width: `${(item.corn / maxValue) * 100}%` }}
                />
                <div
                  className="flex-1 bg-chart-3 rounded opacity-70"
                  style={{ width: `${(item.rice / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{t.language === 'ar' ? 'لا توجد بيانات أسعار متاحة حالياً' : 'No market price data available'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
