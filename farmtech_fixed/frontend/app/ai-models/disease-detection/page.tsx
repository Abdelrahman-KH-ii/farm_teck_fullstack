'use client'

import { useState } from 'react'
import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from "@/lib/language-context"

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [detectionResults, setDetectionResults] = useState<{
    detected: boolean
    disease: string
    confidence: number
    severity: string
  } | null>(null)

  const { t, dir } = useLanguage()
  const L = t.diseaseDetection

  const recentScans = [
    { id: 1, date: L.time.today, time: '2:30 PM', disease: L.mockDiseases.rust, confidence: 92, severity: L.severity.high },
    { id: 2, date: L.time.yesterday, time: '10:15 AM', disease: L.mockDiseases.mildew, confidence: 78, severity: L.severity.medium },
    { id: 3, date: L.time.daysAgo, time: '3:45 PM', disease: L.mockDiseases.healthy, confidence: 99, severity: L.severity.none },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string)
        // Simulate AI detection
        setTimeout(() => {
          setDetectionResults({
            detected: Math.random() > 0.5,
            disease: [L.mockDiseases.rust, L.mockDiseases.mildew, L.mockDiseases.blight][Math.floor(Math.random() * 3)],
            confidence: 85 + Math.random() * 15,
            severity: [L.severity.low, L.severity.medium, L.severity.high][Math.floor(Math.random() * 3)],
          })
        }, 1500)
      }
      reader.readAsDataURL(file)
    }
  }

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
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-card border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{L.uploadText}</p>
                  <p className="text-sm text-muted-foreground mt-1">{L.uploadHint}</p>
                </label>
              </div>

              {selectedImage && (
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">{L.uploadedImage}</h3>
                  <img src={selectedImage} alt="Uploaded plant" className="w-full h-96 object-cover rounded-lg mb-4" />
                  
                  {detectionResults && (
                    <div className={`p-4 rounded-lg ${detectionResults.detected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${detectionResults.detected ? 'text-red-900' : 'text-green-900'}`}>
                            {detectionResults.detected ? L.diseaseDetected : L.plantHealthy}
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${detectionResults.detected ? 'text-red-600' : 'text-green-600'}`}>
                            {detectionResults.disease}
                          </p>
                        </div>
                        <div className={dir === 'rtl' ? 'text-left' : 'text-right'}>
                          <p className="text-sm text-muted-foreground">{L.confidence}</p>
                          <p className="text-3xl font-bold text-foreground">{detectionResults.confidence.toFixed(1)}%</p>
                        </div>
                      </div>

                      {detectionResults.detected && (
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">{L.treatmentRecs}</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• {L.tip1}</li>
                            <li>• {L.tip2}</li>
                            <li>• {L.tip3}</li>
                            <li>• {L.tip4}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Scans */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">{L.recentScans}</h3>
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="pb-3 border-b border-border last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">{scan.disease}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          scan.severity === L.severity.high ? 'bg-red-100 text-red-800' :
                          scan.severity === L.severity.medium ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {scan.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{scan.date} {scan.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">{scan.confidence}% {L.confidence.toLowerCase()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
