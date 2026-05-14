'use client'

import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from "@/lib/language-context"

export default function IrrigationControlPage() {
  const { t, dir } = useLanguage()
  const L = t.irrigationControl
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
                <h2 className="text-xl font-semibold text-foreground mb-4">{L.sysStatus}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{L.activeZones}</p>
                    <p className="text-3xl font-bold text-green-600">4/8</p>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{L.waterUsed}</p>
                    <p className="text-3xl font-bold text-blue-600">450 {t.common.mm}</p>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{L.sysHealth}</p>
                    <p className="text-3xl font-bold text-green-600">98%</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{L.fieldZones}</h2>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((zone) => (
                    <div key={zone} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{L.field} {zone}</h3>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{L.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{L.waterFlow}: {100 + zone * 10} {L.lmin}</span>
                        <span className="text-muted-foreground">{L.duration}: {30 + zone * 5} {L.min}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${60 + zone * 10}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{L.aiRecs}</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-semibold">{L.rec1Title}</p>
                    <p className="text-xs text-blue-700 mt-1">{L.rec1Desc}</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900 font-semibold">{L.rec2Title}</p>
                    <p className="text-xs text-green-700 mt-1">{L.rec2Desc}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">{L.waterSavings}</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">28%</p>
                <p className="text-sm text-blue-700">{L.vsManual}</p>
                <p className="text-xs text-blue-600 mt-3 font-semibold">1,250 {L.savedThisMonth}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
