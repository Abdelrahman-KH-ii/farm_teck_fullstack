'use client'

import { useState } from 'react'
import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from "@/lib/language-context"

export default function FertilizerOptimizerPage() {
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [soilData, setSoilData] = useState({
    nitrogen: 45,
    phosphorus: 28,
    potassium: 160,
    organicMatter: 2.1,
  })

  const { t, dir } = useLanguage()
  const L = t.fertilizerOptimizer

  const recommendations = {
    wheat: [
      { nutrient: L.nitrogen, current: 45, needed: 120, unit: 'kg/ha', timeline: L.timeline.w34 },
      { nutrient: L.phosphorus, current: 28, needed: 80, unit: 'kg/ha', timeline: L.timeline.w12 },
      { nutrient: L.potassium, current: 160, needed: 120, unit: 'kg/ha', timeline: L.timeline.w23 },
    ],
    corn: [
      { nutrient: L.nitrogen, current: 45, needed: 180, unit: 'kg/ha', timeline: L.timeline.w46 },
      { nutrient: L.phosphorus, current: 28, needed: 100, unit: 'kg/ha', timeline: L.timeline.w23 },
      { nutrient: L.potassium, current: 160, needed: 150, unit: 'kg/ha', timeline: L.timeline.w34 },
    ],
  }

  const currentRec = recommendations[selectedCrop as keyof typeof recommendations]

  const cost = {
    wheat: { nitrogen: 18, phosphorus: 35, potassium: 22 },
    corn: { nitrogen: 18, phosphorus: 35, potassium: 22 },
  }

  const cropCost = cost[selectedCrop as keyof typeof cost]
  const totalCost = (120 - 45) * cropCost.nitrogen/100 + 
                    (80 - 28) * cropCost.phosphorus/100 + 
                    (120 - 160) * cropCost.potassium/100

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

          {/* Crop Selection */}
          <div className="mb-6 flex gap-3">
            {['wheat', 'corn'].map((crop) => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selectedCrop === crop
                    ? 'bg-green-600 text-white'
                    : 'bg-card border border-border text-foreground hover:bg-accent'
                }`}
              >
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Soil Analysis */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">{L.currentAnalysis}</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{L.nitrogen}</p>
                      <span className="text-sm font-semibold text-green-600">{soilData.nitrogen} mg/kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{L.phosphorus}</p>
                      <span className="text-sm font-semibold text-orange-600">{soilData.phosphorus} mg/kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{L.potassium}</p>
                      <span className="text-sm font-semibold text-blue-600">{soilData.potassium} mg/kg</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">{L.organicMatter}</p>
                    <p className="text-2xl font-bold text-foreground">{soilData.organicMatter}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{L.adequateLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">{L.fertRecsFor} {t.yieldPrediction.crops[selectedCrop as keyof typeof t.yieldPrediction.crops]}</h3>
                <div className="space-y-4">
                  {currentRec.map((rec, index) => (
                    <div key={index} className="bg-accent/50 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-foreground">{rec.nutrient}</p>
                        <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">{rec.timeline}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{L.currentLevel}</p>
                          <p className="text-lg font-bold text-foreground">{rec.current}</p>
                          <p className="text-xs text-muted-foreground">{rec.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{L.recLevel}</p>
                          <p className="text-lg font-bold text-green-600">{rec.needed}</p>
                          <p className="text-xs text-muted-foreground">{rec.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{L.toAdd}</p>
                          <p className="text-lg font-bold text-blue-600">{rec.needed - rec.current}</p>
                          <p className="text-xs text-muted-foreground">{rec.unit}</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all" 
                          style={{ width: `${(rec.current / rec.needed) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-900">{L.costAnalysis}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-muted-foreground mb-2">{L.estCost}</p>
                    <p className="text-2xl font-bold text-blue-600">EGP {Math.abs(totalCost).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{L.perHa}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-muted-foreground mb-2">{L.expYieldInc}</p>
                    <p className="text-2xl font-bold text-green-600">+12-15%</p>
                    <p className="text-xs text-muted-foreground mt-1">{L.roi}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-muted-foreground mb-2">{L.appPeriod}</p>
                    <p className="text-2xl font-bold text-foreground">6 {t.common.weeks}</p>
                    <p className="text-xs text-muted-foreground mt-1">{L.staggered}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
