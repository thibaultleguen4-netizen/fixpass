'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, getCategoryEmoji, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS, CATEGORIES } from '@/lib/types'
import { Plus, Search, SlidersHorizontal, LogOut, Trash2, CheckSquare, Square, X } from 'lucide-react'

interface ObjectWithDocs extends ObjectItem {
  docCount?: number
  repairCount?: number
}

export default function ObjectsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectWithDocs[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'warranty'>('date')
  const [showSort, setShowSort] = useState(false)

  // Mode sélection
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: objs } = await supabase.from('objects').select('*').order('created_at', { ascending: false })
    if (!objs) { setLoading(false); return }

    const { data: docs } = await supabase.from('documents').select('object_id')
    const { data: repairs } = await supabase.from('repairs').select('object_id')

    const docCounts: Record<string, number> = {}
    const repairCounts: Record<string, number> = {}
    docs?.forEach(d => { docCounts[d.object_id] = (docCounts[d.object_id] || 0) + 1 })
    repairs?.forEach(r => { repairCounts[r.object_id] = (repairCounts[r.object_id] || 0) + 1 })

    setObjects(objs.map(o => ({
      ...o,
      docCount: docCounts[o.id] || 0,
      repairCount: repairCounts[o.id] || 0,
    })))
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(o => o.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Supprimer ${selectedIds.size} objet${selectedIds.size > 1 ? 's' : ''} définitivement ?`)) return

    setDeleting(true)
    const ids = Array.from(selectedIds)

    // Supprimer documents et réparations associés
    await supabase.from('documents').delete().in('object_id', ids)
    await supabase.from('repairs').delete().in('object_id', ids)
    await supabase.from('objects').delete().in('id', ids)

    setObjects(prev => prev.filter(o => !selectedIds.has(o.id)))
    setSelectedIds(new Set())
    setSelectMode(false)
    setDeleting(false)
  }

  const cancelSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  // Filtrage
  const filtered = objects
    .filter(o => {
      const q = search.toLowerCase()
      return !q || o.name?.toLowerCase().includes(q) || o.brand?.toLowerCase().includes(q) || o.seller?.toLowerCase().includes(q)
    })
    .filter(o => activeCategory === 'Tous' || o.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price') return (b.purchase_price || 0) - (a.purchase_price || 0)
      if (sortBy === 'warranty') {
        const da = daysUntilExpiry(a.warranty_end_date) ?? 9999
        const db = daysUntilExpiry(b.warranty_end_date) ?? 9999
        return da - db
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const expiringSoon = filtered.filter(o => 
  (o.warranty_status === 'expiring_soon' || (daysUntilExpiry(o.warranty_end_date) ?? 999) <= 30) 
  && o.warranty_status !== 'expired'
  && (daysUntilExpiry(o.warranty_end_date) ?? -1) > 0
)
  const rest = filtered.filter(o => !expiringSoon.includes(o))

  const usedCategories = ['Tous', ...CATEGORIES.filter(c => objects.some(o => o.category === c))]
  const categoryCounts: Record<string, number> = { Tous: objects.length }
  CATEGORIES.forEach(c => { categoryCounts[c] = objects.filter(o => o.category === c).length })

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

      {/* Header normal */}
      {!selectMode ? (
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1D9E75"/>
              <path d="M16 5 L24 8.5 L24 17 C24 22 20.5 25.5 16 27 C11.5 25.5 8 22 8 17 L8 8.5 Z" fill="white" opacity="0.95"/>
              <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
            </svg>
            <span className="font-semibold text-gray-900">Mes objets</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectMode(true)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Sélection multiple">
              <Trash2 size={17} />
            </button>
            <Link href="/objects/new" className="text-teal-600 text-sm font-medium flex items-center gap-1 hover:underline">
              <Plus size={15} /> Ajouter
            </Link>
          </div>
        </header>
      ) : (
        /* Header mode sélection */
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={cancelSelectMode} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <span className="font-semibold text-gray-900">
              {selectedIds.size > 0 ? `${selectedIds.size} sélectionné${selectedIds.size > 1 ? 's' : ''}` : 'Sélectionner'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleSelectAll}
              className="text-sm text-teal-600 font-medium hover:underline">
              {selectedIds.size === filtered.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} disabled={deleting}
                className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-red-600 transition-colors">
                <Trash2 size={14} />
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            )}
          </div>
        </header>
      )}

      <div className="max-w-lg mx-auto px-4 py-4 pb-24 space-y-3">

        {/* Recherche + tri */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              placeholder="Rechercher un objet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 flex items-center gap-1.5 hover:border-gray-300">
              <SlidersHorizontal size={14} />
              Trier
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-sm z-20 overflow-hidden min-w-[140px]">
                {[
                  { key: 'date', label: 'Plus récents' },
                  { key: 'price', label: 'Prix décroissant' },
                  { key: 'warranty', label: 'Garantie urgente' },
                ].map(s => (
                  <button key={s.key} onClick={() => { setSortBy(s.key as any); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${sortBy === s.key ? 'text-teal-600 font-medium' : 'text-gray-700'}`}>
                    {s.key === sortBy ? '✓ ' : ''}{s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filtres catégorie */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {usedCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-400 border-teal-400 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {cat === 'Tous' ? `Tous (${categoryCounts['Tous']})` : `${getCategoryEmoji(cat)} ${cat.split(' ')[0]} (${categoryCounts[cat]})`}
            </button>
          ))}
        </div>

        {/* Résultats */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl text-center py-14">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 text-sm">Aucun objet trouvé.</p>
            {search && <p className="text-gray-400 text-xs mt-1">Essayez un autre terme de recherche.</p>}
          </div>
        ) : (
          <>
            {expiringSoon.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">⚠️ Garantie expire bientôt</p>
                <div className="space-y-2">
                  {expiringSoon.map(o => (
                    <ObjectCard key={o.id} o={o}
                      selectMode={selectMode}
                      selected={selectedIds.has(o.id)}
                      onToggle={() => toggleSelect(o.id)} />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {expiringSoon.length > 0 && (
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 mt-2">Tous les objets</p>
                )}
                <div className="space-y-2">
                  {rest.map(o => (
                    <ObjectCard key={o.id} o={o}
                      selectMode={selectMode}
                      selected={selectedIds.has(o.id)}
                      onToggle={() => toggleSelect(o.id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around z-10">
        {[
          { icon: '🏠', label: 'Accueil', href: '/dashboard', active: false },
          { icon: '📦', label: 'Objets', href: '/objects', active: true },
          { icon: '📄', label: 'Scanner', href: '/scan', active: false },
          { icon: '👤', label: 'Profil', href: '/profile', active: false },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span className={`text-xs ${item.active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ObjectCard({ o, selectMode, selected, onToggle }: {
  o: ObjectWithDocs
  selectMode: boolean
  selected: boolean
  onToggle: () => void
}) {
  const days = daysUntilExpiry(o.warranty_end_date)

  if (selectMode) {
    return (
      <button onClick={onToggle}
        className={`w-full bg-white border rounded-2xl flex items-center gap-3 px-4 py-3.5 transition-colors ${
          selected ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-200'
        }`}>
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-red-500 bg-red-500' : 'border-gray-300'
        }`}>
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          {getCategoryEmoji(o.category)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {[o.brand, o.purchase_price ? formatPrice(o.purchase_price) : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      </button>
    )
  }

  return (
    <Link href={`/objects/${o.id}`}
      className="bg-white border border-gray-100 rounded-2xl flex items-center gap-3 px-4 py-3.5 hover:border-gray-200 transition-colors block">
      <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        {getCategoryEmoji(o.category)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {[o.brand, o.purchase_price ? formatPrice(o.purchase_price) : null, o.seller].filter(Boolean).join(' · ')}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {(o.docCount || 0) > 0 && (
            <span className="text-xs text-teal-600 font-medium">
              🧾 {o.docCount} doc{(o.docCount || 0) > 1 ? 's' : ''}
            </span>
          )}
          {(o.repairCount || 0) > 0 && (
            <span className="text-xs text-orange-500 font-medium">
              🔧 {o.repairCount} réparation{(o.repairCount || 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${WARRANTY_COLORS[o.warranty_status || 'unknown']}`}>
          {days !== null && days <= 90 && days > 0 ? `${days} j` : WARRANTY_LABELS[o.warranty_status || 'unknown']}
        </span>
      </div>
    </Link>
  )
}
