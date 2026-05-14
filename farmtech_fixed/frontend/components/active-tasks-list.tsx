'use client'

import { useLanguage } from '@/lib/language-context'

export default function ActiveTasksList() {
  const { t } = useLanguage()
  const tasks = t.dashboard.tasks.items

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        )
      case 'in-progress':
        return (
          <svg className="w-5 h-5 text-accent animate-spin" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        )
    }
  }

  const statusByIndex = ['completed', 'in-progress', 'pending'] as const

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{t.dashboard.tasks.title}</h2>

      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task, idx) => (
            <div
              key={task.title}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {getIcon(statusByIndex[idx] ?? 'pending')}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{t.common.noTasks || (t.language === 'ar' ? 'لا توجد مهام نشطة حالياً' : 'No active tasks at the moment')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
