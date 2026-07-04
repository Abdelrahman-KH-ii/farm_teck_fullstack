'use client'

import { useLanguage } from '@/lib/language-context'

interface LifecycleData {
  crop_type: string
  plot_name: string
  status: string
  stage: string
  days_growing: number
  total_days: number
  days_until_harvest: number
  progress_pct: number
  harvest_date: string
  health_score: number
}

interface Props {
  data: LifecycleData | null
  loading: boolean
}

const CROP_ICONS: Record<string, string> = {
  wheat: '🌾',
  corn: '🌽',
  rice: '🌿',
  cotton: '🌸',
  barley: '🌾',
  soybeans: '🫘',
  sugarcane: '🎍',
  other: '🌱',
}

const STAGES = ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Grain Filling', 'Ripening']

export default function CropLifecycle({ data, loading }: Props) {
  const { t, language } = useLanguage()
  const isAr = language === 'ar'

  const stageIndex = data ? STAGES.indexOf(data.stage) : -1
  const cropIcon = data ? (CROP_ICONS[data.crop_type.toLowerCase()] ?? '🌱') : '🌱'

  const healthColor =
    !data ? 'text-muted-foreground' :
    data.health_score >= 80 ? 'text-emerald-500' :
    data.health_score >= 60 ? 'text-amber-500' : 'text-red-500'

  const barColor =
    !data ? 'bg-muted' :
    data.progress_pct < 30 ? 'bg-gradient-to-r from-blue-400 to-sky-500' :
    data.progress_pct < 70 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
    'bg-gradient-to-r from-amber-400 to-orange-500'

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
          <span className="text-xl">🌱</span>
          {isAr ? 'دورة حياة المحصول' : 'Crop Lifecycle'}
        </h2>
        {data && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            data.status === 'healthy'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            {data.status === 'healthy'
              ? (isAr ? '✓ سليم' : '✓ Healthy')
              : (isAr ? '⚠ تنبيه' : '⚠ Alert')}
          </span>
        )}
      </div>

      {/* Crop identity */}
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
          </div>
        </div>
      ) : data ? (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-sm">
            {cropIcon}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground capitalize">{data.crop_type}</p>
            <p className="text-xs text-muted-foreground">{data.plot_name}</p>
          </div>
          <div className="ms-auto text-end">
            <p className={`text-2xl font-black ${healthColor}`}>{data.health_score}%</p>
            <p className="text-xs text-muted-foreground">{isAr ? 'صحة المحصول' : 'Health'}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {isAr ? 'لا توجد قطع زراعية حتى الآن' : 'No active plots yet'}
        </p>
      )}

      {/* Growth Progress Bar */}
      {data && (
        <>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{isAr ? `يوم ${data.days_growing}` : `Day ${data.days_growing}`}</span>
              <span className="font-semibold text-foreground">{data.stage}</span>
              <span>{isAr ? `${data.total_days} يوم` : `${data.total_days}d total`}</span>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${data.progress_pct}%` }}
              />
            </div>
          </div>

          {/* Stage Timeline Dots */}
          <div className="flex items-center justify-between gap-1">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                  i < stageIndex
                    ? 'bg-emerald-500 border-emerald-500'
                    : i === stageIndex
                      ? 'bg-primary border-primary ring-2 ring-primary/30'
                      : 'bg-muted border-muted-foreground/30'
                }`} />
                {i < STAGES.length - 1 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>

          {/* Harvest Countdown */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{isAr ? 'الحصاد المتوقع' : 'Est. Harvest'}</p>
              <p className="text-sm font-bold text-foreground">{data.harvest_date}</p>
            </div>
            <div className="text-end">
              <p className="text-2xl font-black text-primary">{data.days_until_harvest}</p>
              <p className="text-xs text-muted-foreground">{isAr ? 'يوم متبقي' : 'days left'}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
