'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, formatDate, getCategoryEmoji, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS } from '@/lib/types'
import { ScanLine, Plus, LogOut, Package, ShieldCheck, FileText, TrendingDown, Bell } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'vous'
      setUserName(name)
      setUserInitials(name.slice(0, 2).toUpperCase())
      const { data } = await supabase
        .from('objects')
        .select('*')
        .order('created_at', { ascending: false })
      setObjects(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalValue = objects.reduce((sum, o) => sum + (o.purchase_price || 0), 0)
  const totalResale = objects.reduce((sum, o) => sum + (o.resale_recommended || 0), 0)
  const activeWarranties = objects.filter(o => o.warranty_status === 'active').length
  const expiringWarranties = objects.filter(o => o.warranty_status === 'expiring_soon')
  const savedDocs = objects.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center text-white font-bold">F</div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-semibold text-gray-900">FixPass</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 text-xs font-semibold">
            {userInitials}
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">

        {/* Greeting */}
        <div>
          <p className="text-gray-500 text-sm">Bonjour, {userName} 👋</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-0.5">Votre coffre</h1>
        </div>

        {/* Hero card — patrimoine */}
        <div className="bg-teal-400 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-xs mb-1">Patrimoine estimé</p>
            <p className="text-white text-4xl font-semibold">{formatPrice(totalValue)}</p>
            <p className="text-teal-100 text-xs mt-1.5">{objects.length} objet{objects.length > 1 ? 's' : ''} enregistré{objects.length > 1 ? 's' : ''}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
            🏦
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Garanties</p>
            <p className="text-2xl font-semibold text-gray-900">{activeWarranties}</p>
            {expiringWarranties.length > 0 && (
              <p className="text-xs text-yellow-600 mt-1">{expiringWarranties.length} expirent bientôt</p>
            )}
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Factures</p>
            <p className="text-2xl font-semibold text-gray-900">{savedDocs}</p>
            <p className="text-xs text-gray-400 mt-1">sauvegardées</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Revente</p>
            <p className="text-2xl font-semibold text-gray-900">{totalResale > 0 ? formatPrice(totalResale) : '—'}</p>
            {totalResale > 0 && <p className="text-xs text-green-600 mt-1">estimée</p>}
          </div>
        </div>

        {/* Scan CTA */}
        <Link href="/scan"
          className="w-full bg-teal-400 hover:bg-teal-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium transition-colors">
          <ScanLine size={20} />
          Scanner une facture
        </Link>

        {/* Alerts */}
        {expiringWarranties.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell size={14} className="text-yellow-600" />
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alertes garanties</h2>
            </div>
            <div className="space-y-2">
              {expiringWarranties.map(o => {
                const days = daysUntilExpiry(o.warranty_end_date)
                return (
                  <Link href={`/objects/${o.id}`} key={o.id}
                    className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 hover:bg-yellow-100 transition-colors">
                    <span className="text-xl">{getCategoryEmoji(o.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
                      <p className="text-xs text-yellow-700 mt-0.5">Expire le {formatDate(o.warranty_end_date)}</p>
                    </div>
                    {days !== null && (
                      <span className="text-xs font-semibold text-yellow-800 bg-yellow-200 px-2.5 py-1 rounded-full flex-shrink-0">
                        {days} j
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Objects list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mes objets {objects.length > 0 && `(${objects.length})`}
            </h2>
            <Link href="/objects/new" className="text-teal-600 text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Ajouter
            </Link>
          </div>

          {objects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl text-center py-14">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-500 text-sm">Aucun objet encore.</p>
              <p className="text-gray-400 text-sm mt-1">Scannez votre première facture !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {objects.slice(0, 10).map(o => (
                <Link href={`/objects/${o.id}`} key={o.id}
                  className="bg-white border border-gray-100 rounded-2xl flex items-center gap-3 px-4 py-3.5 hover:border-gray-200 transition-colors">
                  <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryEmoji(o.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[o.brand, o.purchase_price ? formatPrice(o.purchase_price) : null, o.seller].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${WARRANTY_COLORS[o.warranty_status || 'unknown']}`}>
                    {WARRANTY_LABELS[o.warranty_status || 'unknown']}
                  </span>
                </Link>
              ))}
              {objects.length > 10 && (
                <p className="text-center text-sm text-teal-600 hover:underline py-2 cursor-pointer">
                  Voir tous les objets ({objects.length})
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around z-10">
        {[
          { icon: '🏠', label: 'Accueil', href: '/dashboard', active: true },
          { icon: '📦', label: 'Objets', href: '/objects/new', active: false },
          { icon: '📄', label: 'Scanner', href: '/scan', active: false },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="flex flex-col items-center gap-1">
            <span className="text-xl">{item.icon}</span>
            <span className={`text-xs ${item.active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

    </div>
  )
}
