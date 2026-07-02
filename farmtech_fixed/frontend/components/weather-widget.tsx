'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'

interface WeatherData {
  temperature: number
  humidity: number
  rain_probability_tomorrow: number
  rain_probability_3days: number
  condition: string
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  // Open-Meteo free API – no key required
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code')
  url.searchParams.set('daily', 'precipitation_probability_max')
  url.searchParams.set('forecast_days', '4')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  const temp = data.current?.temperature_2m ?? null
  const humidity = data.current?.relative_humidity_2m ?? null
  const dailyProb: number[] = data.daily?.precipitation_probability_max ?? []
  const tomorrow = dailyProb[1] ?? 0
  const next3 = dailyProb.slice(1, 4).reduce((a: number, b: number) => Math.max(a, b), 0)

  const code = data.current?.weather_code ?? 0
  let condition = 'Clear'
  if (code >= 80) condition = 'Rain'
  else if (code >= 50) condition = 'Drizzle'
  else if (code >= 40) condition = 'Fog'
  else if (code >= 30) condition = 'Overcast'
  else if (code >= 10) condition = 'Partly Cloudy'

  return {
    temperature: Math.round(temp ?? 0),
    humidity: Math.round(humidity ?? 0),
    rain_probability_tomorrow: Math.round(tomorrow),
    rain_probability_3days: Math.round(next3),
    condition,
  }
}

export default function WeatherWidget() {
  const { t } = useLanguage()
  const W = t.dashboard.weather

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Default to Cairo, Egypt coords if geolocation not available
    const defaultLat = 30.0444
    const defaultLon = 31.2357

    const load = (lat: number, lon: number) => {
      fetchWeather(lat, lon)
        .then(setWeather)
        .catch(() => setError(true))
        .finally(() => setLoading(false))
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        ()    => load(defaultLat, defaultLon),
        { timeout: 5000 }
      )
    } else {
      load(defaultLat, defaultLon)
    }
  }, [])

  const tempDisplay   = loading ? '…' : error ? '--' : `${weather?.temperature}°C`
  const humidDisplay  = loading ? '…' : error ? '--' : `${weather?.humidity}%`
  const rain1Display  = loading ? '…' : error ? '--' : `${weather?.rain_probability_tomorrow}%`
  const rain3Display  = loading ? '…' : error ? '--' : `${weather?.rain_probability_3days}%`
  const rain1Width    = weather?.rain_probability_tomorrow ?? 0
  const rain3Width    = weather?.rain_probability_3days ?? 0

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 pb-4 border-b border-border">
        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
        </svg>
        {W.title}
        {weather?.condition && (
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {weather.condition}
          </span>
        )}
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{W.temperature}</p>
          {loading ? (
            <div className="h-8 w-16 bg-primary/10 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-primary">{tempDisplay}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">{W.tempHint}</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4 hover:border-accent/40 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1 uppercase tracking-wide">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
            </svg>
            {W.humidity}
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-accent/10 animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-bold text-accent">{humidDisplay}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">{W.humidityHint}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-accent/10 dark:from-blue-950/20 dark:to-accent/10 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 5.23 11.08 5 12 5c3.04 0 5.5 2.46 5.5 5.5v.5H19c2.21 0 4 1.79 4 4 0 2.05-1.53 3.76-3.56 3.97l1.07-1.07c.21-.2.33-.48.33-.79V10.04z" />
          </svg>
          <h3 className="font-semibold text-sm text-foreground">{W.rainForecast}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{W.tomorrow}</span>
            {loading
              ? <div className="h-4 w-12 bg-blue-200 animate-pulse rounded" />
              : <span className="font-semibold text-blue-600">{rain1Display} {W.chance}</span>
            }
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-700"
              style={{ width: loading ? '0%' : `${rain1Width}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm mt-4">
            <span className="text-muted-foreground">{W.next3Days}</span>
            {loading
              ? <div className="h-4 w-12 bg-blue-200 animate-pulse rounded" />
              : <span className="font-semibold text-blue-600">{rain3Display} {W.chance}</span>
            }
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-700"
              style={{ width: loading ? '0%' : `${rain3Width}%` }}
            />
          </div>
          {!loading && !error && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              🌍 Source: Open-Meteo · Updated live
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive mt-2 text-center">Weather data unavailable</p>
          )}
        </div>
      </div>
    </div>
  )
}
