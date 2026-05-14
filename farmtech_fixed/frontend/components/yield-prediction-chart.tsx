'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/lib/language-context'

export default function YieldPredictionChart() {
  const { t } = useLanguage()
  const Y = t.dashboard.yieldChart

  const data: any[] = useMemo(
    () => [],
    []
  )

  const maxValue = 5500

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-accent shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18 10 11.41l4 4 6.3-6.29L22 12v-6z" />
          </svg>
          {Y.title}
        </h2>
        <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">{Y.badge}</span>
      </div>

      <div className="space-y-6 mb-6 min-h-[150px] flex flex-col justify-center">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                <span className="font-semibold text-sm">{item.crop}</span>
                <div className="text-xs flex flex-wrap gap-x-3 gap-y-1">
                  <span className="text-chart-1">
                    {Y.predicted}: {item.predicted}
                  </span>
                  <span className="text-chart-4">
                    {Y.baseline}: {item.baseline}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 h-8">
                <div
                  className="flex-1 bg-chart-1 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(item.predicted / maxValue) * 100}%` }}
                >
                  {item.predicted}
                </div>
                <div
                  className="flex-1 bg-chart-4 rounded flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(item.baseline / maxValue) * 100}%` }}
                >
                  {item.baseline}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{t.language === 'ar' ? 'لا توجد بيانات توقع إنتاجية متاحة حالياً' : 'No yield prediction data available'}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-primary/10 rounded-lg p-3">
          <p className="text-muted-foreground">{Y.avgImprovement}</p>
          <p className="text-xl font-bold text-primary">+412 kg/acre</p>
        </div>
        <div className="bg-accent/10 rounded-lg p-3">
          <p className="text-muted-foreground">{Y.confidenceLevel}</p>
          <p className="text-xl font-bold text-accent">92%</p>
        </div>
      </div>
    </div>
  )
}
