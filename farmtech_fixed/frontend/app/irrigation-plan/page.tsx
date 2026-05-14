"use client"
import { useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplet, Calendar, Clock, Volume2, CheckCircle2, AlertCircle, Zap, Leaf, BrainCircuit, Loader2, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { analyzeIrrigation } from "@/lib/api"

interface IrrigationSession {
  id: string
  date: string
  day: number
  time: string
  duration: string
  volume: number
  status: "done" | "pending" | "scheduled"
  weather?: string
}

const mockSessions: IrrigationSession[] = [
  {
    id: "1",
    date: "Dec 18",
    day: 18,
    time: "06:00 AM",
    duration: "45 mins",
    volume: 500,
    status: "done",
    weather: "Clear",
  },
  {
    id: "2",
    date: "Dec 19",
    day: 19,
    time: "04:00 PM",
    duration: "45 mins",
    volume: 500,
    status: "pending",
    weather: "Sunny",
  },
  {
    id: "3",
    date: "Dec 20",
    day: 20,
    time: "06:00 AM",
    duration: "45 mins",
    volume: 500,
    status: "scheduled",
    weather: "Cloudy",
  },
  {
    id: "4",
    date: "Dec 21",
    day: 21,
    time: "04:00 PM",
    duration: "45 mins",
    volume: 500,
    status: "scheduled",
    weather: "Rainy",
  },
  {
    id: "5",
    date: "Dec 22",
    day: 22,
    time: "06:00 AM",
    duration: "40 mins",
    volume: 450,
    status: "scheduled",
    weather: "Sunny",
  },
]

export default function IrrigationPlanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [autoAdjust, setAutoAdjust] = useState(true)
  const [selectedSession, setSelectedSession] = useState<string>(mockSessions[1].id)
  const { t, language } = useLanguage()
  const isRtl = language === 'ar'
  const L = t.irrigationPlan

  const selectedData = mockSessions.find((s) => s.id === selectedSession)
  const waterSavedThisMonth = 120

  // AI Irrigation State
  const [temp, setTemp] = useState(30)
  const [humidity, setHumidity] = useState(45)
  const [moisture, setMoisture] = useState(30)
  const [soilType, setSoilType] = useState("loamy")
  const [cropType, setCropType] = useState("wheat")
  
  const [aiResult, setAiResult] = useState<{ irrigation_need_mm: number; irrigation_class: string } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      // Typically you would fetch farm_id, using 1 for mock
      const payload = {
        farm_id: 1, 
        data: {
          temperature: temp,
          humidity: humidity,
          moisture: moisture,
          soil_type: soilType,
          crop_type: cropType
        }
      }
      const result = await analyzeIrrigation(payload)
      setAiResult(result)
    } catch (err: any) {
      setAiError(err.message || "Failed to analyze")
    } finally {
      setAiLoading(false)
    }
  }

  const statusConfig = {
    done: { color: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300", label: L.status.done },
    pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300", label: L.status.pending },
    scheduled: { color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300", label: L.status.scheduled },
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

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Task - Primary Card */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-accent" />
                      {L.nextIrrigation}
                    </CardTitle>
                    <CardDescription>{L.todaysTask}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedData && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{L.timeLabel}</p>
                            <p className="text-3xl font-bold text-accent">{selectedData.time}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">{L.durationLabel}</p>
                              <p className="font-semibold text-foreground">{selectedData.duration}</p>
                            </div>
                            <div className="bg-card/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">{L.volumeLabel}</p>
                              <p className="font-semibold text-foreground">{selectedData.volume}L</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-accent/20">
                          <Badge className={statusConfig[selectedData.status].color}>
                            {statusConfig[selectedData.status].label}
                          </Badge>
                        </div>

                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-11">
                          <Zap className="w-4 h-4 me-2" />
                          {L.startIrrigation}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Multiple Cards */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Auto-Adjustment Toggle */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-primary" />
                        {L.smartFeatures}
                      </span>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoAdjust}
                          onChange={(e) => setAutoAdjust(e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer"
                        />
                        <span className="ms-2 text-sm font-semibold">{L.autoAdjust}</span>
                      </label>
                    </CardTitle>
                    <CardDescription>
                      {autoAdjust
                        ? L.autoAdjustDesc
                        : L.manualDesc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Input Form for AI */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'الحرارة (°C)' : 'Temp (°C)'}</label>
                        <input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'الرطوبة (%)' : 'Humidity (%)'}</label>
                        <input type="number" value={humidity} onChange={e => setHumidity(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'رطوبة التربة' : 'Moisture'}</label>
                        <input type="number" value={moisture} onChange={e => setMoisture(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'نوع التربة' : 'Soil Type'}</label>
                        <select value={soilType} onChange={e => setSoilType(e.target.value)} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-sm outline-none">
                          <option value="loamy">Loamy</option>
                          <option value="sandy">Sandy</option>
                          <option value="clay">Clay</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'المحصول' : 'Crop Type'}</label>
                        <input type="text" value={cropType} onChange={e => setCropType(e.target.value)} className="w-full bg-muted border border-border rounded-md px-2 py-1 text-sm outline-none" />
                      </div>
                    </div>

                    <Button onClick={handleAnalyze} disabled={aiLoading || !autoAdjust} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
                      {aiLoading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 me-2" />}
                      {isRtl ? 'تحليل احتياجات الري بالذكاء الاصطناعي' : 'Analyze Irrigation Needs (AI)'}
                    </Button>

                    {aiError && <div className="text-sm text-destructive mt-2">{aiError}</div>}
                    
                    {aiResult && (
                      <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-primary">
                          <Sparkles className="w-4 h-4" /> 
                          {isRtl ? 'توصية الذكاء الاصطناعي' : 'AI Recommendation'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'الكمية المطلوبة' : 'Required Amount'}</p>
                            <p className="text-xl font-bold text-foreground">{aiResult.irrigation_need_mm} <span className="text-sm font-normal text-muted-foreground">mm/day</span></p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'مستوى الاحتياج' : 'Need Level'}</p>
                            <Badge variant="outline" className="text-sm bg-background/50">{aiResult.irrigation_class}</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Water Savings Widget */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-primary" />
                      {L.waterSavingsTitle}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-4xl font-bold text-primary">{waterSavedThisMonth} L</div>
                      <p className="text-sm text-muted-foreground">{L.waterSavedMonth}</p>
                      <div className="text-xs text-muted-foreground pt-2">
                        {L.waterSavedHint} <strong>15%</strong> {L.ofWaterUsage}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Calendar/Timeline View */}
            <Card className="mt-6 bg-card border-border">
              <CardHeader>
                <CardTitle>{L.scheduleTitle}</CardTitle>
                <CardDescription>{L.scheduleDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="space-y-3">
                  {mockSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedSession === session.id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Droplet className="w-5 h-5 text-accent flex-shrink-0" />
                            <span className="font-semibold">{session.date}</span>
                            <Badge className={statusConfig[session.status].color} variant="outline">
                              {statusConfig[session.status].label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {session.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Volume2 className="w-4 h-4" />
                              {session.volume}L
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          {session.status === "done" && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                          {session.status === "pending" && <AlertCircle className="w-6 h-6 text-yellow-600" />}
                          {session.status === "scheduled" && <Calendar className="w-6 h-6 text-blue-600" />}
                        </div>
                      </div>
                      {session.weather && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {L.weatherLabel} <span className="font-medium">{L.weathers[session.weather as keyof typeof L.weathers]}</span>
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips Section */}
            <Card className="mt-6 bg-muted/50 border-border">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3">{L.tipsTitle}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {L.tips.map((tip: string, idx: number) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
