'use client'

import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from '@/lib/language-context'

export default function FarmHistoryPage() {
  const { t } = useLanguage()
  const L = t.farmHistory
  const history = [
    {
      id: 1,
      date: L.items[0].date,
      time: L.items[0].time,
      event: L.items[0].event,
      details: L.items[0].details,
      type: 'prediction',
    },
    {
      id: 2,
      date: L.items[1].date,
      time: L.items[1].time,
      event: L.items[1].event,
      details: L.items[1].details,
      type: 'irrigation',
    },
    {
      id: 3,
      date: L.items[2].date,
      time: L.items[2].time,
      event: L.items[2].event,
      details: L.items[2].details,
      type: 'disease',
    },
    {
      id: 4,
      date: L.items[3].date,
      time: L.items[3].time,
      event: L.items[3].event,
      details: L.items[3].details,
      type: 'fertilizer',
    },
    {
      id: 5,
      date: L.items[4].date,
      time: L.items[4].time,
      event: L.items[4].event,
      details: L.items[4].details,
      type: 'weather',
    },
    {
      id: 6,
      date: L.items[5].date,
      time: L.items[5].time,
      event: L.items[5].event,
      details: L.items[5].details,
      type: 'soil',
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return '📊'
      case 'irrigation':
        return '💧'
      case 'disease':
        return '🔍'
      case 'fertilizer':
        return '🌱'
      case 'weather':
        return '🌤️'
      case 'soil':
        return '🏞️'
      default:
        return '📝'
    }
  }

  const stats = [
    { label: L.stats[0], value: 156 },
    { label: L.stats[1], value: 32 },
    { label: L.stats[2], value: 8 },
    { label: L.stats[3], value: 2 },
  ]

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{L.title}</h1>
            <p className="text-muted-foreground mt-2">{L.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-6 text-foreground">{L.timelineTitle}</h2>
            
            <div className="space-y-0">
              {history.map((item, index) => (
                <div key={item.id} className="flex gap-6 pb-6 relative">
                  {/* Timeline Line */}
                  {index !== history.length - 1 && (
                    <div className="absolute start-6 top-16 w-0.5 h-12 bg-border"></div>
                  )}
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-accent border-2 border-border flex items-center justify-center text-lg">
                      {getIcon(item.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{item.event}</h3>
                      <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.details}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Load More */}
          <div className="text-center mt-6">
            <button className="px-6 py-2 border border-border rounded-lg font-semibold text-foreground hover:bg-accent transition">
              {L.loadMore}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
