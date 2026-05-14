"use client"
import { useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/header"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import dynamic from "next/dynamic"

const CropMap = dynamic(() => import("@/components/map/CropMap"), { 
  ssr: false, 
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-muted/20 animate-pulse rounded-lg border-2 border-dashed border-border text-muted-foreground">Loading Map Area...</div> 
})

interface Plot {
  id: string
  name: string
  crop: string
  area: number
  sowingDate: string
  stage: string
  moisture: number
  harvestDate: string
  status: "healthy" | "attention"
}

const mockPlots: Plot[] = [
  {
    id: "plot-1",
    name: "Plot A",
    crop: "Wheat",
    area: 2.5,
    sowingDate: "Nov 15, 2024",
    stage: "Flowering",
    moisture: 65,
    harvestDate: "Mar 20, 2025",
    status: "healthy",
  },
  {
    id: "plot-2",
    name: "Plot B",
    crop: "Corn",
    area: 1.8,
    sowingDate: "Oct 20, 2024",
    stage: "Vegetative Growth",
    moisture: 45,
    harvestDate: "Feb 10, 2025",
    status: "attention",
  },
  {
    id: "plot-3",
    name: "Plot C",
    crop: "Cotton",
    area: 3.2,
    sowingDate: "Dec 1, 2024",
    stage: "Early Growth",
    moisture: 72,
    harvestDate: "May 30, 2025",
    status: "healthy",
  },
]

export default function MyFarmPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [selectedPlot, setSelectedPlot] = useState<string>(mockPlots[0].id)
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>("all")
  const { t } = useLanguage()
  const L = t.myFarm

  const activePlot = mockPlots.find((p) => p.id === selectedPlot)

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background text-foreground">
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{L.title}</h1>
                <p className="text-muted-foreground">{L.subtitle}</p>
              </div>
              <a href="/add-farm">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-11">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-12C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  {L.addFieldBtn}
                </Button>
              </a>
            </div>

            {/* Main Layout: Map and Plot List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Map Area */}
              <div className="lg:col-span-2">
                <Card className="h-full bg-card border-border">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 flex flex-row items-center justify-between pb-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
                        </svg>
                        {L.mapTitle}
                      </CardTitle>
                      <CardDescription>{L.mapDesc}</CardDescription>
                    </div>
                    <div>
                      <select 
                        className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedCropFilter}
                        onChange={(e) => setSelectedCropFilter(e.target.value)}
                      >
                        <option value="all">All Crops</option>
                        <option value="wheat">Wheat</option>
                        <option value="corn">Corn</option>
                        <option value="cotton">Cotton</option>
                        <option value="rice">Rice</option>
                        <option value="tomato">Tomato</option>
                        <option value="potato">Potato</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="w-full">
                      <CropMap selectedCrop={selectedCropFilter} year={2024} />
                    </div>

                    {/* Selected Plot Details */}
                    {activePlot && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                        <h3 className="font-semibold mb-2">
                          {activePlot.name} - {activePlot.crop}
                        </h3>
                        <p className="text-sm text-muted-foreground">{L.area} {activePlot.area} {L.feddan}</p>
                        <p className="text-sm text-muted-foreground">{L.stageLabel} {activePlot.stage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Plot List Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-card border-border h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                      </svg>
                      {L.yourPlots}
                    </CardTitle>
                    <CardDescription>{mockPlots.length} {L.activePlots}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-3">
                    {mockPlots.map((plot) => (
                      <button
                        key={plot.id}
                        onClick={() => setSelectedPlot(plot.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedPlot === plot.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{plot.name}</h4>
                            <p className="text-sm text-muted-foreground">{plot.crop}</p>
                          </div>
                          <Badge
                            variant={plot.status === "healthy" ? "default" : "destructive"}
                            className={plot.status === "healthy" ? "bg-accent text-white" : "bg-orange-600 text-white"}
                          >
                            {plot.status === "healthy" ? L.healthy : L.alert}
                          </Badge>
                        </div>

                        <div className="space-y-2 mt-3 pt-3 border-t border-border">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">{L.area}</span>
                            <span className="font-medium">{plot.area} {L.feddan}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <svg className="w-3.5 h-3.5 text-accent fill-current" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                            </svg>
                            <span className="text-muted-foreground">{L.moisture}</span>
                            <span className="font-medium">{plot.moisture}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <svg className="w-3.5 h-3.5 text-accent fill-current" viewBox="0 0 24 24">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.08-2.61c-.28-.35-.76-.35-1.04 0-.28.35-.28.92 0 1.27l2.6 3.25c.26.35.75.35 1.04 0L19 8.63c.28-.35.28-.92 0-1.27-.28-.34-.76-.34-1.04 0z" />
                            </svg>
                            <span className="text-muted-foreground">{L.harvest}</span>
                            <span className="font-medium">{plot.harvestDate}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Plot Details Card */}
            {activePlot && (
              <Card className="mt-6 bg-card border-border">
                <CardHeader className={`bg-gradient-to-r ${activePlot.status === "healthy" ? "from-accent/10 to-primary/10" : "from-orange-500/10 to-red-500/10"}`}>
                  <CardTitle className="flex items-center gap-2">
                    {activePlot.status === "attention" && <svg className="w-5 h-5 text-orange-600 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>}
                    {activePlot.status === "healthy" && <svg className="w-5 h-5 text-accent fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>}
                    {activePlot.name} - {L.detailedInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                        <p className="text-xs font-semibold text-muted-foreground">{L.cropTypeCard}</p>
                      </div>
                      <p className="font-bold text-lg text-foreground">{activePlot.crop}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 rounded-lg hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2c-6.62 0-12 5.38-12 12s5.38 12 12 12 12-5.38 12-12-5.38-12-12-12zm0 2c5.54 0 10 4.46 10 10s-4.46 10-10 10-10-4.46-10-10 4.46-10 10-10zm-1 5h2v6h-2z" />
                        </svg>
                        <p className="text-xs font-semibold text-muted-foreground">{L.stageCard}</p>
                      </div>
                      <p className="font-bold text-lg text-foreground">{activePlot.stage}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 rounded-lg hover:border-blue-500/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
                        </svg>
                        <p className="text-xs font-semibold text-muted-foreground">{L.moistureCard}</p>
                      </div>
                      <p className="font-bold text-lg text-foreground">{activePlot.moisture}%</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 rounded-lg hover:border-secondary/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.08-2.61c-.28-.35-.76-.35-1.04 0-.28.35-.28.92 0 1.27l2.6 3.25c.26.35.75.35 1.04 0L19 8.63c.28-.35.28-.92 0-1.27-.28-.34-.76-.34-1.04 0z" />
                        </svg>
                        <p className="text-xs font-semibold text-muted-foreground">{L.harvestCard}</p>
                      </div>
                      <p className="font-bold text-foreground">{activePlot.harvestDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>


    </div>
  )
}
