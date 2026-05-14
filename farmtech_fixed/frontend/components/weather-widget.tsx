'use client'

import { useLanguage } from '@/lib/language-context'

export default function WeatherWidget() {
  const { t } = useLanguage()
  const W = t.dashboard.weather

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 pb-4 border-b border-border">
        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.5 2.46 5.5 5.5v.5H19c2.21 0 4 1.79 4 4 0 2.05-1.53 3.76-3.56 3.97l1.07-1.07c.21-.2.33-.48.33-.79V10.04zM6.64 5.96C6.08 6.58 5.6 7.3 5.25 8.1L2.81 5.66c.93-1.31 2.38-2.28 4.02-2.6l1.81 1.81-1.99.09zM3 13.5v-.5H2v.5c0 1.1.9 2 2 2v-2h-1z" />
        </svg>
        {W.title}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{W.temperature}</p>
          <p className="text-3xl font-bold text-primary">--°C</p>
          <p className="text-xs text-muted-foreground mt-2">{W.tempHint}</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4 hover:border-accent/40 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1 uppercase tracking-wide">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
            </svg>
            {W.humidity}
          </p>
          <p className="text-3xl font-bold text-accent">--%</p>
          <p className="text-xs text-muted-foreground mt-2">{W.humidityHint}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-accent/10 dark:from-blue-950/20 dark:to-accent/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.5 2.46 5.5 5.5v.5H19c2.21 0 4 1.79 4 4 0 2.05-1.53 3.76-3.56 3.97l1.07-1.07c.21-.2.33-.48.33-.79V10.04zM6.64 5.96C6.08 6.58 5.6 7.3 5.25 8.1L2.81 5.66c.93-1.31 2.38-2.28 4.02-2.6l1.81 1.81-1.99.09zM3 13.5v-.5H2v.5c0 1.1.9 2 2 2v-2h-1z" />
          </svg>
          <h3 className="font-semibold text-sm text-foreground">{W.rainForecast}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{W.tomorrow}</span>
            <span className="font-semibold text-blue-600">15% {W.chance}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '15%' }} />
          </div>
          <div className="flex justify-between items-center text-sm mt-4">
            <span className="text-muted-foreground">{W.next3Days}</span>
            <span className="font-semibold text-blue-600">40% {W.chance}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '40%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
