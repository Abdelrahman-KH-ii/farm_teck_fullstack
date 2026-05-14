"use client"
import { useState, useEffect, useCallback } from "react"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { TrendingUp, TrendingDown, CheckCircle2, BrainCircuit, Loader2, Sparkles, RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { fetchForecast, fetchCommodities } from "@/lib/api"

interface CropPrice {
  id: string
  name: string
  unit: string
  currentPrice: number
  dailyChange: number
  trend: "up" | "down" | "stable"
  marketRegion: string
}

interface ForecastPoint {
  commodity: string
  year: number
  quarter: number
  price: number
  label: string
}

const mockPrices: CropPrice[] = [
  { id: "1", name: "Wheat",  unit: "EGP/Ton", currentPrice: 8500,  dailyChange:  2.5,  trend: "up",     marketRegion: "Cairo" },
  { id: "2", name: "Corn",   unit: "EGP/Ton", currentPrice: 7200,  dailyChange: -1.2,  trend: "down",   marketRegion: "Cairo" },
  { id: "3", name: "Cotton", unit: "EGP/Ton", currentPrice: 15800, dailyChange:  1.8,  trend: "up",     marketRegion: "Cairo" },
  { id: "4", name: "Rice",   unit: "EGP/Ton", currentPrice: 9500,  dailyChange:  0.0,  trend: "stable", marketRegion: "Cairo" },
  { id: "5", name: "Tomato", unit: "EGP/Kg",  currentPrice: 2.5,   dailyChange: -3.2,  trend: "down",   marketRegion: "Cairo" },
  { id: "6", name: "Potato", unit: "EGP/Kg",  currentPrice: 1.8,   dailyChange:  1.5,  trend: "up",     marketRegion: "Cairo" },
]

const priceTrendData = [
  { day: "Dec 1",  wheat: 8200, corn: 7400, cotton: 15200, rice: 9500 },
  { day: "Dec 3",  wheat: 8350, corn: 7250, cotton: 15400, rice: 9500 },
  { day: "Dec 5",  wheat: 8400, corn: 7300, cotton: 15600, rice: 9500 },
  { day: "Dec 7",  wheat: 8450, corn: 7200, cotton: 15700, rice: 9500 },
  { day: "Dec 9",  wheat: 8480, corn: 7150, cotton: 15750, rice: 9500 },
  { day: "Dec 11", wheat: 8500, corn: 7180, cotton: 15800, rice: 9500 },
  { day: "Dec 13", wheat: 8520, corn: 7200, cotton: 15850, rice: 9500 },
  { day: "Dec 15", wheat: 8500, corn: 7180, cotton: 15800, rice: 9500 },
]

// Quarter label helper
const quarterLabel = (year: number, quarter: number) => `Q${quarter} ${year}`

export default function MarketPricesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("cairo")
  const { t } = useLanguage()
  const L = t.marketPrices

  // ── AI Forecast State ────────────────────────────────────────────────────────
  const [commodities, setCommodities] = useState<string[]>([])
  const [selectedCommodity, setSelectedCommodity] = useState("Wheat")
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)
  const [forecastFetched, setForecastFetched] = useState(false)

  // Load commodity list once
  useEffect(() => {
    fetchCommodities().then((list) => {
      if (list.length > 0) setCommodities(list)
    })
  }, [])

  const runForecast = useCallback(async () => {
    setForecastLoading(true)
    setForecastError(null)
    try {
      const raw = await fetchForecast(selectedCommodity)
      const formatted: ForecastPoint[] = raw.map((p) => ({
        ...p,
        label: quarterLabel(p.year, p.quarter),
      }))
      setForecastData(formatted)
      setForecastFetched(true)
    } catch (e: any) {
      setForecastError(e.message ?? "Failed to load forecast")
    } finally {
      setForecastLoading(false)
    }
  }, [selectedCommodity])

  const categories = [
    { id: "all",        label: L.categories.all },
    { id: "grains",     label: L.categories.grains },
    { id: "fruits",     label: L.categories.fruits },
    { id: "vegetables", label: L.categories.vegetables },
  ]

  const regions = [
    { id: "cairo",   label: L.regions.cairo },
    { id: "giza",    label: L.regions.giza },
    { id: "assiut",  label: L.regions.assiut },
    { id: "sharqia", label: L.regions.sharqia },
  ]

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background text-foreground">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">{L.title}</h1>
              <p className="text-muted-foreground">{L.subtitle}</p>
            </div>

            {/* ── AI FORECAST CARD ──────────────────────────────────────────── */}
            <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BrainCircuit className="w-5 h-5" />
                  AI Price Forecast
                  <Badge className="ms-2 bg-primary/20 text-primary border-primary/30 text-xs font-semibold">
                    Powered by LightGBM · HF Space
                  </Badge>
                </CardTitle>
                <CardDescription>
                  4-quarter ahead price predictions for Egyptian agricultural commodities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Controls */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-medium">Commodity</label>
                    <select
                      value={selectedCommodity}
                      onChange={(e) => { setSelectedCommodity(e.target.value); setForecastFetched(false) }}
                      className="bg-muted border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                    >
                      {(commodities.length > 0 ? commodities : ["Wheat","Rice","Tomato","Potato","Maize","Mango"]).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={runForecast}
                    disabled={forecastLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {forecastLoading
                      ? <><Loader2 className="w-4 h-4 me-2 animate-spin" /> Forecasting…</>
                      : forecastFetched
                        ? <><RefreshCw className="w-4 h-4 me-2" /> Refresh</>
                        : <><Sparkles className="w-4 h-4 me-2" /> Get AI Forecast</>
                    }
                  </Button>
                </div>

                {forecastError && (
                  <p className="text-sm text-destructive">{forecastError}</p>
                )}

                {forecastFetched && forecastData.length > 0 && (
                  <div className="space-y-4">
                    {/* Forecast Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {forecastData.map((p) => (
                        <div
                          key={p.label}
                          className="bg-background/60 border border-border rounded-xl p-3 text-center"
                        >
                          <p className="text-xs text-muted-foreground mb-1">{p.label}</p>
                          <p className="text-xl font-bold text-primary">
                            {p.price.toLocaleString("en-EG", { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-muted-foreground">EGP/Ton</p>
                        </div>
                      ))}
                    </div>

                    {/* Forecast Bar Chart */}
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={forecastData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="label" stroke="var(--color-muted-foreground)" tick={{ fontSize: 12 }} />
                        <YAxis
                          stroke="var(--color-muted-foreground)"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "0.5rem",
                          }}
                          formatter={(v: number) => [`${v.toLocaleString()} EGP/Ton`, "Forecast Price"]}
                        />
                        <Bar dataKey="price" fill="var(--color-primary)" radius={[6, 6, 0, 0]} name="Forecast Price" />
                      </BarChart>
                    </ResponsiveContainer>

                    <p className="text-xs text-muted-foreground text-center">
                      📊 Source: FarmTech Commodity Forecast API · LightGBM model trained on Egyptian market data
                    </p>
                  </div>
                )}

                {!forecastFetched && !forecastLoading && (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Select a commodity and click <strong>Get AI Forecast</strong> to view 4-quarter price predictions.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{L.cropCategory}</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">{L.marketRegion}</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>{reg.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Best Time to Sell */}
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                      {L.bestTimeTitle}
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-400"
                       dangerouslySetInnerHTML={{ __html: L.bestTimeDesc }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Table */}
            <Card className="mb-8 bg-card border-border">
              <CardHeader>
                <CardTitle>{L.priceTableTitle}</CardTitle>
                <CardDescription>
                  {L.priceTableDesc} {regions.find((r) => r.id === selectedRegion)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-start py-3 px-4 font-semibold text-foreground">{L.thCrop}</th>
                        <th className="text-start py-3 px-4 font-semibold text-foreground">{L.thUnitPrice}</th>
                        <th className="text-start py-3 px-4 font-semibold text-foreground">{L.thDailyChange}</th>
                        <th className="text-end py-3 px-4 font-semibold text-foreground">{L.thTrend}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPrices.map((crop) => (
                        <tr key={crop.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 font-medium text-foreground">
                            {L.crops[crop.name.toLowerCase() as keyof typeof L.crops]}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-lg font-bold text-foreground">
                              {crop.currentPrice} {crop.unit}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                              crop.dailyChange > 0
                                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                : crop.dailyChange < 0
                                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300"
                            }`}>
                              {crop.dailyChange > 0 && <TrendingUp className="w-4 h-4" />}
                              {crop.dailyChange < 0 && <TrendingDown className="w-4 h-4" />}
                              {Math.abs(crop.dailyChange)}%
                            </div>
                          </td>
                          <td className="py-4 px-4 text-end">
                            {crop.trend === "up"     && <Badge className="bg-green-600 text-white">{L.trendRising}</Badge>}
                            {crop.trend === "down"   && <Badge className="bg-red-600 text-white">{L.trendFalling}</Badge>}
                            {crop.trend === "stable" && <Badge className="bg-blue-600 text-white">{L.trendStable}</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Historical Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{L.chartTitle}</CardTitle>
                <CardDescription>{L.chartDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={priceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.5rem" }} />
                    <Legend />
                    <Line type="monotone" dataKey="wheat"  stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={L.crops.wheat}  />
                    <Line type="monotone" dataKey="corn"   stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={L.crops.corn}   />
                    <Line type="monotone" dataKey="cotton" stroke="var(--color-chart-3)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={L.crops.cotton} />
                    <Line type="monotone" dataKey="rice"   stroke="var(--color-chart-4)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={L.crops.rice}   />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
