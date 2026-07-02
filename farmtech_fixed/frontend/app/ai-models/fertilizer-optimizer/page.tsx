'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from "@/lib/language-context"
import { fetchFertilizerOptimizer } from '@/lib/api'
import { BrainCircuit, Loader2, Sparkles, AlertCircle } from 'lucide-react'

interface OptimizerResult {
  crop: string
  soil_nutrient_levels_kg_ha: {
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  target_levels_kg_ha: {
    N: number
    P: number
    K: number
  }
  deficits_kg_ha: {
    nitrogen: number
    phosphorus: number
    potassium: number
  }
  fertilizer_recommendations: {
    urea_kg_ha: number
    dap_kg_ha: number
    mop_kg_ha: number
  }
  amendments: {
    lime_needed: boolean
    gypsum_needed: boolean
  }
  priority_nutrient: string
  recommendation: string
  soil_ph: number
  nearest_field: {
    crop: string
    year: number
    lat: number
    lon: number
  }
}

export default function FertilizerOptimizerPage() {
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [lat, setLat] = useState(30.0)
  const [lon, setLon] = useState(31.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiResult, setApiResult] = useState<OptimizerResult | null>(null)

  const { t, dir } = useLanguage()
  const L = t.fertilizerOptimizer

  const runOptimization = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFertilizerOptimizer({
        lat,
        lon,
        crop: selectedCrop
      })
      if (data.status === "success" || data.fertilizer_recommendations) {
        setApiResult(data)
      } else {
        throw new Error(data.error || "Failed to fetch optimizer recommendations")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to fetch optimizer recommendations")
    } finally {
      setLoading(false)
    }
  }, [lat, lon, selectedCrop])

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
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Settings</h3>
                <div className="space-y-4">
                  {/* Crop Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Crop Type</label>
                    <select
                      value={selectedCrop}
                      onChange={(e) => { setSelectedCrop(e.target.value); setApiResult(null); }}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                    >
                      <option value="wheat">Wheat</option>
                      <option value="corn">Corn/Maize</option>
                      <option value="rice">Rice</option>
                      <option value="cotton">Cotton</option>
                      <option value="tomato">Tomato</option>
                      <option value="potato">Potato</option>
                    </select>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
                      <input
                        type="number" step="0.1"
                        value={lat}
                        onChange={(e) => { setLat(parseFloat(e.target.value) || 0); setApiResult(null); }}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
                      <input
                        type="number" step="0.1"
                        value={lon}
                        onChange={(e) => { setLon(parseFloat(e.target.value) || 0); setApiResult(null); }}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <button
                    onClick={runOptimization}
                    disabled={loading}
                    className="w-full mt-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold
                               hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Optimizing...</>
                    ) : (
                      <><BrainCircuit className="w-5 h-5" /> Run AI Optimizer</>
                    )}
                  </button>

                  {error && (
                    <p className="text-sm text-destructive mt-1">{error}</p>
                  )}
                </div>
              </div>

              {/* Static Soil Info Card prior to run, or dynamic info card after */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Soil Chemistry</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Soil pH</p>
                      <span className="text-sm font-semibold text-primary">
                        {apiResult ? apiResult.soil_ph.toFixed(2) : "--"}
                      </span>
                    </div>
                  </div>
                  {apiResult?.nearest_field && (
                    <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                      <p>Nearest Database Record:</p>
                      <p className="font-semibold text-foreground capitalize mt-1">
                        {apiResult.nearest_field.crop} ({apiResult.nearest_field.year})
                      </p>
                      <p>Coordinates: {apiResult.nearest_field.lat.toFixed(4)}, {apiResult.nearest_field.lon.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations Output */}
            <div className="lg:col-span-2 space-y-6">
              {apiResult ? (
                <>
                  {/* Optimizer recommendation text */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                      🧠 AI Recommendations
                    </h2>
                    <p className="text-foreground leading-relaxed">
                      {apiResult.recommendation}
                    </p>
                    {apiResult.amendments.lime_needed && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Soil is acidic. Adding lime is recommended to raise pH.</span>
                      </div>
                    )}
                    {apiResult.amendments.gypsum_needed && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Soil is alkaline. Adding gypsum is recommended to reduce pH.</span>
                      </div>
                    )}
                  </div>

                  {/* NPK levels comparison cards */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Nutrient Breakdown (kg/ha)
                    </h3>
                    <div className="space-y-6">
                      {[
                        {
                          name: "Nitrogen (N)",
                          current: apiResult.soil_nutrient_levels_kg_ha.nitrogen,
                          target: apiResult.target_levels_kg_ha.N,
                          deficit: apiResult.deficits_kg_ha.nitrogen,
                          fertilizer: "Urea",
                          rate: apiResult.fertilizer_recommendations.urea_kg_ha,
                          color: "bg-green-600"
                        },
                        {
                          name: "Phosphorus (P)",
                          current: apiResult.soil_nutrient_levels_kg_ha.phosphorus,
                          target: apiResult.target_levels_kg_ha.P,
                          deficit: apiResult.deficits_kg_ha.phosphorus,
                          fertilizer: "DAP",
                          rate: apiResult.fertilizer_recommendations.dap_kg_ha,
                          color: "bg-orange-600"
                        },
                        {
                          name: "Potassium (K)",
                          current: apiResult.soil_nutrient_levels_kg_ha.potassium,
                          target: apiResult.target_levels_kg_ha.K,
                          deficit: apiResult.deficits_kg_ha.potassium,
                          fertilizer: "MOP",
                          rate: apiResult.fertilizer_recommendations.mop_kg_ha,
                          color: "bg-blue-600"
                        }
                      ].map((n, idx) => (
                        <div key={idx} className="bg-accent/40 rounded-lg p-4 border border-border/50">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-foreground">{n.name}</p>
                            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-semibold border border-primary/20">
                              {n.fertilizer}: {n.rate} kg/ha
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Current Level</p>
                              <p className="text-base font-bold text-foreground">{n.current.toFixed(1)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Target Level</p>
                              <p className="text-base font-bold text-foreground">{n.target}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Deficit</p>
                              <p className={`text-base font-bold ${n.deficit > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {n.deficit.toFixed(1)}
                              </p>
                            </div>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`${n.color} h-2 rounded-full transition-all`} 
                              style={{ width: `${Math.min(100, (n.current / n.target) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
                  <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground opacity-30 mb-4 animate-pulse" />
                  <p className="text-lg font-semibold text-foreground mb-1">No optimization data loaded</p>
                  <p className="text-sm">Set your crop type and coordinates, and click <strong>Run AI Optimizer</strong> to see fertilizer recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

