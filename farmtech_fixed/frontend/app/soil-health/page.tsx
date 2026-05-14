"use client"
import { useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

// Mock data for nutrient trends
const nutrientTrendData = [
  { month: "Jun", nitrogen: 45, phosphorous: 35, potassium: 42 },
  { month: "Jul", nitrogen: 48, phosphorous: 38, potassium: 45 },
  { month: "Aug", nitrogen: 52, phosphorous: 42, potassium: 48 },
  { month: "Sep", nitrogen: 58, phosphorous: 48, potassium: 52 },
  { month: "Oct", nitrogen: 65, phosphorous: 55, potassium: 60 },
  { month: "Nov", nitrogen: 72, phosphorous: 62, potassium: 68 },
  { month: "Dec", nitrogen: 75, phosphorous: 68, potassium: 72 },
]

interface Nutrient {
  name: string
  value: number
  status: "low" | "optimal" | "high"
  trend: "up" | "down" | "stable"
  recommendation?: string
}

export default function SoilHealthPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { t } = useLanguage()
  const L = t.soilHealth

  const nutrients: Nutrient[] = [
    {
      name: L.nutrients.n,
      value: 75,
      status: "optimal",
      trend: "up",
    },
    {
      name: L.nutrients.p,
      value: 68,
      status: "optimal",
      trend: "up",
    },
    {
      name: L.nutrients.k,
      value: 72,
      status: "optimal",
      trend: "stable",
    },
  ]

  const phLevel = 7.2 // Neutral
  const moistureLevel = 65

  const aiRecommendations = L.recs

  const getGaugeColor = (value: number): string => {
    if (value < 40) return "text-red-600"
    if (value < 60) return "text-yellow-600"
    if (value < 80) return "text-blue-600"
    return "text-green-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      case "low":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
      case "high":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
      default:
        return ""
    }
  }

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

            {/* Nutrient Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {nutrients.map((nutrient) => (
                <Card key={nutrient.name} className="bg-card border-border">
                  <CardContent className="pt-6">
                    {/* Nutrient Name & Status */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-foreground mb-1">{nutrient.name}</h3>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(nutrient.status)}`}
                      >
                        {L.statusLabels[nutrient.status]}
                      </span>
                    </div>

                    {/* Speedometer Gauge */}
                    <div className="flex flex-col items-center mb-4">
                      <div className="relative w-32 h-32 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 200 120">
                          {/* Gauge background arc */}
                          <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          {/* Gauge colored zones */}
                          <path
                            d="M 30 100 A 70 70 0 0 1 80 35"
                            fill="none"
                            stroke="rgb(220, 38, 38)"
                            strokeWidth="8"
                          />
                          <path
                            d="M 80 35 A 70 70 0 0 1 120 35"
                            fill="none"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="8"
                          />
                          <path
                            d="M 120 35 A 70 70 0 0 1 170 100"
                            fill="none"
                            stroke="rgb(234, 179, 8)"
                            strokeWidth="8"
                          />

                          {/* Needle */}
                          <line
                            x1="100"
                            y1="100"
                            x2={100 + 60 * Math.cos(Math.PI - (nutrient.value / 100) * Math.PI)}
                            y2={100 - 60 * Math.sin(Math.PI - (nutrient.value / 100) * Math.PI)}
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-foreground"
                          />
                          <circle cx="100" cy="100" r="5" fill="currentColor" className="text-foreground" />
                        </svg>
                      </div>

                      {/* Value Display */}
                      <p className={`text-3xl font-bold ${getGaugeColor(nutrient.value)}`}>{nutrient.value}</p>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{L.trendLabel}</span>
                      <div className="flex items-center gap-1">
                        {nutrient.trend === "up" && (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-semibold">{L.trends.up}</span>
                          </>
                        )}
                        {nutrient.trend === "down" && (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-semibold">{L.trends.down}</span>
                          </>
                        )}
                        {nutrient.trend === "stable" && <span className="text-blue-600 font-semibold">{L.trends.stable}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* pH Level & Moisture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* pH Level */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{L.phTitle}</CardTitle>
                  <CardDescription>{L.phDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Linear pH Gradient Bar */}
                    <div className="relative h-8 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-0.5">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
                        style={{ width: "8%", position: "relative" }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-foreground rounded-full"
                        style={{ left: `calc(${(phLevel / 14) * 100}% - 2px)` }}
                      />
                    </div>

                    {/* pH Scale Labels */}
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>{L.acidic}</span>
                      <span>{L.neutral}</span>
                      <span>{L.alkaline}</span>
                    </div>

                    <div className="text-center">
                      <p className="text-4xl font-bold text-primary">{phLevel}</p>
                      <p className="text-sm text-muted-foreground mt-1">{L.currentPh}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Soil Moisture */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>{L.moistureTitle}</CardTitle>
                  <CardDescription>{L.moistureDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Moisture Bar */}
                    <div className="relative w-full h-12 bg-muted rounded-lg overflow-hidden border-2 border-border">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all"
                        style={{ width: `${moistureLevel}%` }}
                      />
                      <p className="absolute inset-0 flex items-center justify-center font-bold text-foreground">
                        {moistureLevel}%
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {moistureLevel > 60 ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-600 font-semibold">{L.optimalMoisture}</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm text-yellow-600 font-semibold">{L.monitorClosely}</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Trends Chart */}
            <Card className="mb-6 bg-card border-border">
              <CardHeader>
                <CardTitle>{L.chartTitle}</CardTitle>
                <CardDescription>{L.chartDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={nutrientTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nitrogen"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="phosphorous"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="potassium"
                      stroke="var(--color-chart-3)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{L.aiRecsTitle}</CardTitle>
                <CardDescription>{L.aiRecsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
