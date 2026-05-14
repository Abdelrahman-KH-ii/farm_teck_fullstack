'use client'

import { useState } from 'react'
import Header from '@/components/header'
import SidebarNav from '@/components/sidebar-nav'
import { useLanguage } from '@/lib/language-context'

export default function NotificationsPage() {
  const { t } = useLanguage()
  const L = t.notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: L.items[0].title,
      message: L.items[0].message,
      time: L.items[0].time,
      read: false,
    },
    {
      id: 2,
      type: 'task',
      title: L.items[1].title,
      message: L.items[1].message,
      time: L.items[1].time,
      read: false,
    },
    {
      id: 3,
      type: 'disease',
      title: L.items[2].title,
      message: L.items[2].message,
      time: L.items[2].time,
      read: true,
    },
    {
      id: 4,
      type: 'weather',
      title: L.items[3].title,
      message: L.items[3].message,
      time: L.items[3].time,
      read: true,
    },
    {
      id: 5,
      type: 'market',
      title: L.items[4].title,
      message: L.items[4].message,
      time: L.items[4].time,
      read: true,
    },
  ])

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '⚠️'
      case 'task':
        return '✓'
      case 'disease':
        return '🔍'
      case 'weather':
        return '🌧️'
      case 'market':
        return '📈'
      default:
        return '🔔'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-100 border-red-300'
      case 'task':
        return 'bg-green-100 border-green-300'
      case 'disease':
        return 'bg-orange-100 border-orange-300'
      case 'weather':
        return 'bg-blue-100 border-blue-300'
      case 'market':
        return 'bg-purple-100 border-purple-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{L.title}</h1>
              <p className="text-muted-foreground mt-2">{L.subtitle}</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                {unreadCount} {L.unread}
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', 'Alerts', 'Tasks', 'Disease', 'Weather', 'Market'].map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 rounded-lg font-medium transition bg-card border border-border hover:bg-accent text-foreground"
              >
                {L.filters[filter as keyof typeof L.filters]}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border rounded-lg p-4 transition cursor-pointer ${
                  notif.read
                    ? 'bg-card border-border'
                    : `${getColor(notif.type)} border-2`
                }`}
                onClick={() => handleMarkAsRead(notif.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-2xl">{getIcon(notif.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {notif.title}
                        {!notif.read && <span className="ms-2 w-2 h-2 bg-red-600 rounded-full inline-block"></span>}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notif.id)
                    }}
                    className="text-muted-foreground hover:text-foreground ms-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl text-muted-foreground mb-2">{L.noNotifications}</p>
              <p className="text-sm text-muted-foreground">{L.caughtUp}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
