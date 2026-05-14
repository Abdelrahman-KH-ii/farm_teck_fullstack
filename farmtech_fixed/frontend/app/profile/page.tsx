'use client'

import { useState } from 'react'
import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from '@/lib/language-context'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user } = useAuth()

  const P = t.profilePage
  const Sp = t.settingsPage

  const [isEditing, setIsEditing] = useState(false)

  const safeUser = user as Record<string, any>
  const profile = {
    name: safeUser?.username || safeUser?.name || '',
    email: safeUser?.email || '',
    phone: safeUser?.phone_number || safeUser?.phone || '',
    farmName: safeUser?.farmName || '',
    location: safeUser?.location || '',
    farmSize: safeUser?.farmSize || '',
    crops: safeUser?.crops || [],
    experience: safeUser?.experience || '',
    joinDate: safeUser?.joinDate || '',
  }

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background">
      <SidebarNav isOpen={true} onToggle={() => {}} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{P.title}</h1>
              <p className="text-muted-foreground mt-2">{P.subtitle}</p>
            </div>

            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white">
                    {(profile.name || 'U').charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.farmName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {P.memberSince} {profile.joinDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  {isEditing ? P.cancel : P.editProfile}
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{P.personalInfo}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{Sp.fullName}</label>
                  <input type="text" value={profile.name} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{Sp.email}</label>
                    <input type="email" value={profile.email} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{Sp.phone}</label>
                    <input type="tel" value={profile.phone} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Information */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{P.farmInfo}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{P.farmName}</label>
                  <input type="text" value={profile.farmName} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{P.location}</label>
                    <input type="text" value={profile.location} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{P.farmSize}</label>
                    <input type="text" value={profile.farmSize} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{P.crops}</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.crops.map((crop: string) => (
                      <span key={crop} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{P.experience}</label>
                  <input type="text" value={profile.experience} disabled className="w-full px-4 py-2 border border-border rounded-lg bg-background" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">{P.dangerZone}</h3>

              <button
                type="button"
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition"
              >
                {P.deleteAccount}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}