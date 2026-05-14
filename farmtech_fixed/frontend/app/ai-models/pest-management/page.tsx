'use client'

import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from "@/lib/language-context"

export default function PestManagementPage() {
  const { t, dir } = useLanguage()
  const L = t.pestManagement
  const threats = [
    { name: L.pests.aphids, risk: L.risks.high, field: L.fields.f1, recommendation: L.recs.rec1, image: '🐛' },
    { name: L.pests.armyworms, risk: L.risks.medium, field: L.fields.f3, recommendation: L.recs.rec2, image: '🦗' },
    { name: L.pests.mites, risk: L.risks.low, field: L.fields.f2, recommendation: L.recs.rec3, image: '🕷️' },
  ]

  return (
    <div dir={dir} className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background text-foreground">
      <SidebarNav isOpen={true} onToggle={() => {}} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{L.title}</h1>
            <p className="text-muted-foreground mt-2">{L.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{L.threats}</h2>
                <div className="space-y-3">
                  {threats.map((threat, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{threat.image}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{threat.name}</h3>
                            <p className="text-sm text-muted-foreground">{threat.field}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          threat.risk === L.risks.high ? 'bg-red-100 text-red-800' :
                          threat.risk === L.risks.medium ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {threat.risk} {L.risk}
                        </span>
                      </div>
                      <p className="text-sm text-foreground bg-accent/50 p-3 rounded">
                        <strong>{L.action}</strong> {threat.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{L.schedule}</h2>
                <div className="space-y-3">
                  {[
                    { date: L.sched.d1, action: L.actions.a1, time: '6:00 AM' },
                    { date: L.sched.d2, action: L.actions.a2, time: '9:00 AM' },
                    { date: L.sched.d3, action: L.actions.a3, time: '6:00 AM' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-3 border-b border-border last:border-b-0">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                        <p className="font-semibold text-foreground">{item.time}</p>
                      </div>
                      <p className="text-foreground flex-1">{item.action}</p>
                      <input type="checkbox" className="w-5 h-5 rounded border-border" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{L.prevention}</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">{L.tip1}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">{L.tip2}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">{L.tip3}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-foreground">{L.tip4}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">{L.overallStatus}</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">87%</p>
                <p className="text-sm text-green-700">{L.pestFree}</p>
                <p className="text-xs text-green-600 mt-4 font-semibold">{L.trend}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
