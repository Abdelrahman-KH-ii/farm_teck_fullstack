"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import Header from "@/components/header"
import FeaturedSection from "@/components/featured-section"
import WeatherWidget from "@/components/weather-widget"
import SoilStatusCard from "@/components/soil-status-card"
import ActiveTasksList from "@/components/active-tasks-list"
import QuickActionsPanel from "@/components/quick-actions-panel"

import PriceChart from "@/components/price-chart"
import YieldPredictionChart from "@/components/yield-prediction-chart"

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { t } = useLanguage()
  const D = t.dashboard
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{D.loading}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <SidebarNav isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Dashboard Content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Featured Banner */}
            <FeaturedSection />

            {/* Dashboard Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{D.farmOverview}</h2>
                <p className="text-muted-foreground">{D.farmOverviewSub}</p>
              </div>
              <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <svg className="w-5 h-5 text-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{D.systemsActive}</p>
                  <p className="text-muted-foreground text-xs">{D.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Top Row: Weather & Soil Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <WeatherWidget />
              <SoilStatusCard />
            </div>

            {/* Middle Row: Active Tasks & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <ActiveTasksList />
              </div>
              <div className="lg:col-span-2">
                <QuickActionsPanel />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceChart />
              <YieldPredictionChart />
            </div>
          </div>
        </main>
      </div>


    </div>
  )
}
