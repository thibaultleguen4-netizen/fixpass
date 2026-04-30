'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, formatDate, getCategoryEmoji, computeWarrantyStatus, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS } from '@/lib/types'
import { ScanLine, Plus, LogOut, Package, ShieldCheck, FileText, TrendingDown } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'vous')

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-semibold text-gray-900">FixPass</span>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors">
          <LogOut size={18} />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <p className="text-gray-500 text-sm">Bonjour, {userName} 👋</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Votre coffre FixPass</h1>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Package size={16} />, label: 'Objets enregistrés', value: objects.length.toString(), sub: '' },
            { icon: <TrendingDown size={16} />, label: 'Valeur d\'achat', value: formatPrice(totalValue), sub: '' },
            { icon: <ShieldCheck size={16} />, label: 'Garanties actives', value: activeWarranties.toString(), sub: `${expiringWarranties.length} expirent bientôt` },
            { icon: <FileText size={16} />, label: 'Revente estimée', value: totalResale > 0 ? formatPrice(totalResale) : '—', sub: '' },
          ].map((m) => (
            <div key={m.label} className="bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">{m.icon}{m.label}</div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
              {m.sub && <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>}
            </div>
          ))}
        </div>

        {/* Scan CTA */}
        <Link href="/scan" className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
          <ScanLine size={20} />
          Scanner une facture
        </Link>

        {/* Expiring warnings */}
        {expiringWarranties.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">⚠️ Garanties bientôt expirées</h2>
            {expiringWarranties.map(o => (
              <Link href={`/objects/${o.id}`} key={o.id}
                className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <span className="text-xl">{getCategoryEmoji(o.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{o.name}</p>
                  <p className="text-xs text-yellow-700">
                    Expire dans {daysUntilExpiry(o.warranty_end_date)} jours
                    {o.warranty_end_date ? ` · ${formatDate(o.warranty_end_date)}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Objects list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {objects.length === 0 ? 'Vos objets' : `Vos objets (${objects.length})`}
            </h2>
            <Link href="/objects/new" className="text-teal-600 text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus size={14} /> Ajouter
            </Link>
          </div>

          {objects.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-500 text-sm">Aucun objet encore.</p>
              <p className="text-gray-400 text-sm mt-1">Scannez votre première facture pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {objects.slice(0, 10).map(o => (
                <Link href={`/objects/${o.id}`} key={o.id}
                  className="card flex items-center gap-3 hover:border-teal-200 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryEmoji(o.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
                    <p className="text-xs text-gray-500">
                      {o.brand && `${o.brand} · `}
                      {o.purchase_price ? formatPrice(o.purchase_price) : ''}
                      {o.seller ? ` · ${o.seller}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${WARRANTY_COLORS[o.warranty_status || 'unknown']}`}>
                    {WARRANTY_LABELS[o.warranty_status || 'unknown']}
                  </span>
                </Link>
              ))}
              {objects.length > 10 && (
                <Link href="/objects" className="block text-center text-sm text-teal-600 hover:underline py-2">
                  Voir tous les objets ({objects.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
