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
  const [lat, setLat] = useState(30.08)
  const [lon, setLon] = useState(31.25)
  const [year, setYear] = useState(2024)
  const [cropType, setCropType] = useState("wheat")
  const [debug, setDebug] = useState(false)
  
  const [aiResult, setAiResult] = useState<{
    irrigation_need_mm_season: number
    irrigation_class: string
    confidence: string
    uncertainty_score: number
    reliability_flag: string
    season: string
    active_months: number[]
    diagnostics?: any
    debug?: any
  } | null>(null)
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
          lat: lat,
          lon: lon,
          crop: cropType,
          year: year,
          debug: debug
        }
      }
      const result = await analyzeIrrigation(payload)
      if (result && 'error' in result) {
        throw new Error((result as any).error)
      }
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'خط العرض (Latitude)' : 'Latitude'}</label>
                        <input type="number" step="0.0001" value={lat} onChange={e => setLat(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'خط الطول (Longitude)' : 'Longitude'}</label>
                        <input type="number" step="0.0001" value={lon} onChange={e => setLon(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'سنة الحصاد' : 'Harvest Year'}</label>
                        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-xs text-muted-foreground">{isRtl ? 'نوع المحصول' : 'Crop Type'}</label>
                        <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full bg-muted border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary">
                          <option value="wheat">{isRtl ? 'قمح' : 'Wheat'}</option>
                          <option value="rice">{isRtl ? 'أرز' : 'Rice'}</option>
                          <option value="maize">{isRtl ? 'ذرة' : 'Maize'}</option>
                          <option value="tomato">{isRtl ? 'طماطم' : 'Tomato'}</option>
                          <option value="potato">{isRtl ? 'بطاطس' : 'Potato'}</option>
                          <option value="mango">{isRtl ? 'مانجو' : 'Mango'}</option>
                          <option value="sorghum">{isRtl ? 'سورغوم' : 'Sorghum'}</option>
                          <option value="vegfor">{isRtl ? 'خضروات/علف (VegFor)' : 'Vegetables/Forage (VegFor)'}</option>
                        </select>
                      </div>
                      <div className="space-y-1 flex items-center gap-2 pt-5">
                        <input type="checkbox" id="debugMode" checked={debug} onChange={e => setDebug(e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
                        <label htmlFor="debugMode" className="text-xs text-muted-foreground cursor-pointer select-none">{isRtl ? 'عرض معلومات التصحيح' : 'Enable Debug Mode'}</label>
                      </div>
                    </div>

                    <Button onClick={handleAnalyze} disabled={aiLoading || !autoAdjust} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold mt-2">
                      {aiLoading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 me-2" />}
                      {isRtl ? 'تحليل احتياجات الري بالذكاء الاصطناعي' : 'Analyze Irrigation Needs (AI)'}
                    </Button>

                    {aiError && <div className="text-sm text-destructive mt-2">{aiError}</div>}
                    
                    {aiResult && (
                      <div className="mt-4 p-5 bg-primary/10 border border-primary/25 rounded-2xl space-y-4 transition-all">
                        <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                          <h4 className="text-sm font-bold flex items-center gap-1.5 text-primary">
                            <Sparkles className="w-4 h-4 animate-pulse" /> 
                            {isRtl ? 'توصية الذكاء الاصطناعي الجيومكانية' : 'Geospatial AI Recommendation'}
                          </h4>
                          <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/25 capitalize text-xs px-2 py-0.5">
                            {aiResult.confidence} {isRtl ? 'ثقة' : 'confidence'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'الاحتياج الموسمي الإجمالي' : 'Total Seasonal Need'}</p>
                            <p className="text-2xl font-bold text-foreground">
                              {aiResult.irrigation_need_mm_season} 
                              <span className="text-sm font-semibold text-muted-foreground ms-1">mm</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'مستوى الاحتياج' : 'Need Level'}</p>
                            <Badge variant="outline" className="text-sm bg-background/50 py-0.5 px-2">
                              {aiResult.irrigation_class}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'موثوقية التنبؤ' : 'Prediction Reliability'}</p>
                            <span className={`text-sm font-semibold capitalize ${
                              aiResult.reliability_flag === 'stable' ? 'text-green-600 dark:text-green-400' :
                              aiResult.reliability_flag === 'moderate' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {aiResult.reliability_flag}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'معدل عدم اليقين' : 'Uncertainty StdDev'}</p>
                            <p className="text-sm font-medium text-foreground">
                              ± {aiResult.uncertainty_score} <span className="text-xs text-muted-foreground">mm</span>
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'الموسم الزراعي' : 'Growth Season'}</p>
                            <p className="text-sm font-medium text-foreground capitalize">
                              {aiResult.season}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{isRtl ? 'أشهر النمو النشطة' : 'Active Growth Months'}</p>
                            <p className="text-sm font-medium text-foreground">
                              {aiResult.active_months ? aiResult.active_months.join(', ') : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Diagnostics & Debug Info */}
                        {debug && (aiResult.diagnostics || aiResult.debug) && (
                          <div className="mt-4 pt-4 border-t border-primary/20">
                            <details className="cursor-pointer group">
                              <summary className="text-xs font-semibold text-primary/80 group-hover:text-primary flex items-center justify-between outline-none">
                                <span>{isRtl ? 'بيانات التحليل التفصيلية (GEE)' : 'Detailed Analysis Diagnostics (GEE)'}</span>
                                <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded">
                                  {isRtl ? 'انقر للتوسيع' : 'Click to expand'}
                                </span>
                              </summary>
                              <div className="mt-3 p-3 bg-card/65 rounded-lg border border-border overflow-x-auto text-[11px] font-mono text-muted-foreground leading-relaxed cursor-default">
                                {aiResult.diagnostics && (
                                  <div className="mb-2">
                                    <p className="font-bold text-foreground mb-1">Diagnostics:</p>
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(aiResult.diagnostics, null, 2)}</pre>
                                  </div>
                                )}
                                {aiResult.debug && (
                                  <div>
                                    <p className="font-bold text-foreground mb-1">Model Debug Info:</p>
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(aiResult.debug, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </details>
                          </div>
                        )}
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
