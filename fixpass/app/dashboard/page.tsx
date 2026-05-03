'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, getCategoryEmoji, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS } from '@/lib/types'
import { ScanLine, Plus, LogOut, TrendingUp, X, User, AlertTriangle, RefreshCw } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function PatrimoineChart({ objects }: { objects: ObjectItem[] }) {
  const sorted = [...objects]
    .filter(o => o.purchase_date && o.purchase_price)
    .sort((a, b) => new Date(a.purchase_date!).getTime() - new Date(b.purchase_date!).getTime())

  if (sorted.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Pas assez de données pour afficher le graphique
      </div>
    )
  }

  let cumAchat = 0
  let cumRevente = 0
  const points = sorted.map(o => {
    cumAchat += o.purchase_price || 0
    cumRevente += o.resale_recommended || (o.purchase_price! * 0.6)
    return { date: new Date(o.purchase_date!), achat: cumAchat, revente: cumRevente }
  })

  const maxVal = Math.max(...points.map(p => p.achat))
  const W = 340, H = 140
  const PAD = { top: 10, right: 10, bottom: 30, left: 50 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom
  const xPos = (i: number) => PAD.left + (i / (points.length - 1)) * chartW
  const yPos = (val: number) => PAD.top + chartH - (val / (maxVal || 1)) * chartH
  const achatPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(p.achat)}`).join(' ')
  const reventePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(p.revente)}`).join(' ')
  const achatArea = `${achatPath} L ${xPos(points.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`
  const reventeArea = `${reventePath} L ${xPos(points.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`
  const yLabels = [0, 0.5, 1].map(t => ({ val: t * maxVal, y: PAD.top + chartH - t * chartH }))

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: '#1D9E75' }}></div>
          <span className="text-xs text-gray-500">Prix d'achat cumulé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded" style={{ background: '#F97316' }}></div>
          <span className="text-xs text-gray-500">Valeur de revente</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D9E75" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1D9E75" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F97316" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yLabels.map((l, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={l.y} x2={W - PAD.right} y2={l.y} stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />
            <text x={PAD.left - 6} y={l.y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">
              {l.val >= 1000 ? `${Math.round(l.val / 1000)}k` : Math.round(l.val)}
            </text>
          </g>
        ))}
        <path d={achatArea} fill="url(#ag)" />
        <path d={reventeArea} fill="url(#rg)" />
        <path d={achatPath} fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={reventePath} fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="5,3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(p.achat)} r="3" fill="#1D9E75" />
            <circle cx={xPos(i)} cy={yPos(p.revente)} r="2.5" fill="#F97316" />
          </g>
        ))}
        {[0, points.length - 1].map(i => (
          <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="8" fill="#9CA3AF">
            {points[i].date.getFullYear()}
          </text>
        ))}
      </svg>
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Investi au total</p>
          <p className="text-sm font-semibold" style={{ color: '#1D9E75' }}>{formatPrice(points[points.length - 1]?.achat)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Valeur de revente</p>
          <p className="text-sm font-semibold" style={{ color: '#F97316' }}>{formatPrice(points[points.length - 1]?.revente)}</p>
        </div>
      </div>
    </div>
  )
}

function WarrantyCard({ objects }: { objects: ObjectItem[] }) {
  const withWarranty = objects
    .filter(o => o.warranty_end_date && o.warranty_status !== 'expired')
    .map(o => ({ ...o, days: daysUntilExpiry(o.warranty_end_date) }))
    .filter(o => o.days !== null && o.days > 0)
    .sort((a, b) => (a.days ?? 999) - (b.days ?? 999))
    .slice(0, 6)

  const active = objects.filter(o => o.warranty_status === 'active').length
  const expiring = objects.filter(o => o.warranty_status === 'expiring_soon').length
  const maxDays = 365

  const getColor = (days: number) => {
    if (days <= 30) return { bar: '#E24B4A', text: '#E24B4A' }
    if (days <= 90) return { bar: '#EF9F27', text: '#BA7517' }
    return { bar: '#1D9E75', text: '#1D9E75' }
  }

  if (withWarranty.length === 0) return null

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Garanties</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-2xl font-semibold" style={{ color: '#1D9E75' }}>{active}</p>
          <p className="text-xs text-gray-400 mt-0.5">Actives</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-2xl font-semibold" style={{ color: expiring > 0 ? '#BA7517' : '#9CA3AF' }}>{expiring}</p>
          <p className="text-xs text-gray-400 mt-0.5">Expirent bientôt</p>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Prochaines expirations</p>
      <div className="space-y-2.5">
        {withWarranty.map(o => {
          const days = o.days ?? 0
          const colors = getColor(days)
          const pct = Math.min(100, (days / maxDays) * 100)
          return (
            <Link href={`/objects/${o.id}`} key={o.id} className="block">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-gray-500 truncate" style={{ width: 110, flexShrink: 0 }}>{o.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: colors.bar }} />
                </div>
                <span className="text-xs font-medium w-10 text-right flex-shrink-0" style={{ color: colors.text }}>
                  {days} j
                </span>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
        {[
          { color: '#E24B4A', label: 'Urgent (<30j)' },
          { color: '#EF9F27', label: 'Bientôt (<90j)' },
          { color: '#1D9E75', label: 'Active' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }}></div>
            <span className="text-xs text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userInitials, setUserInitials] = useState('')
  const [userId, setUserId] = useState('')
  const [showChart, setShowChart] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [memberNames, setMemberNames] = useState<Record<string, string>>({})
  const [recalculating, setRecalculating] = useState(false)
  const [recalcProgress, setRecalcProgress] = useState({ done: 0, total: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'vous'
      setUserName(name)
      setUserInitials(name.slice(0, 2).toUpperCase())
      setUserId(user.id)

      const { data } = await supabase.from('objects').select('*').order('created_at', { ascending: false })
      setObjects(data || [])

      const { data: householdData } = await supabase.from('households').select('id').eq('owner_id', user.id).single()
      if (householdData) {
        const { data: members } = await supabase.from('household_members').select('user_id').eq('household_id', householdData.id).neq('user_id', user.id)
        if (members && members.length > 0) {
          const names: Record<string, string> = {}
          for (const m of members) {
            const { data: profileData } = await supabase.from('profiles').select('full_name, email').eq('id', m.user_id).single()
            if (profileData) names[m.user_id] = profileData.full_name || profileData.email || 'Membre'
            else names[m.user_id] = 'Membre du foyer'
          }
          setMemberNames(names)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const recalculateAllEstimates = async () => {
    if (!confirm(`Recalculer les estimations de revente pour ${objects.length} objets via l'IA ? Cela peut prendre quelques minutes.`)) return
    setRecalculating(true)
    setRecalcProgress({ done: 0, total: objects.length })

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i]
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/estimate-resale`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
          body: JSON.stringify({
            name: o.name, brand: o.brand, model: o.model,
            category: o.category, purchase_date: o.purchase_date,
            condition: o.condition, repairs: [],
          }),
        })
        const data = await res.json()
        if (data.resale_recommended) {
          await supabase.from('objects').update({
            resale_min: data.resale_min,
            resale_max: data.resale_max,
            resale_recommended: data.resale_recommended,
          }).eq('id', o.id)
        }
      } catch {}
      setRecalcProgress({ done: i + 1, total: objects.length })
    }

    // Recharger les objets avec les nouvelles estimations
    const { data } = await supabase.from('objects').select('*').order('created_at', { ascending: false })
    setObjects(data || [])
    setRecalculating(false)
    setRecalcProgress({ done: 0, total: 0 })
  }

  const totalValue = objects.reduce((sum, o) => sum + (o.purchase_price || 0), 0)
  const totalResale = objects.reduce((sum, o) => sum + (o.resale_recommended || 0), 0)
  const activeWarranties = objects.filter(o => o.warranty_status === 'active').length
  const expiringWarranties = objects.filter(o => o.warranty_status === 'expiring_soon')

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

      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#1D9E75"/>
            <path d="M16 5 L24 8.5 L24 17 C24 22 20.5 25.5 16 27 C11.5 25.5 8 22 8 17 L8 8.5 Z" fill="white" opacity="0.95"/>
            <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
          </svg>
          <span className="font-semibold text-gray-900">FixPass</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors">
            {userInitials}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden w-52">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Mon compte</p>
              </div>
              <Link href="/profile" onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <User size={15} className="text-gray-400" />
                Mon profil
              </Link>
              <Link href="/sinistre" onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                <AlertTriangle size={15} className="text-red-400" />
                Mode sinistre
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={15} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">

        <div>
          <p className="text-gray-500 text-sm">Bonjour, {userName} 👋</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-0.5">
            {Object.keys(memberNames).length > 0 ? 'Coffre du foyer' : 'Votre coffre'}
          </h1>
        </div>

        <div className="bg-teal-400 rounded-2xl p-5 cursor-pointer select-none" onClick={() => setShowChart(!showChart)}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-teal-100 text-xs">Patrimoine estimé</p>
            <div className="flex items-center gap-1 text-teal-100 text-xs">
              <TrendingUp size={12} />
              <span>{showChart ? 'Fermer' : 'Voir l\'évolution'}</span>
            </div>
          </div>
          <p className="text-white text-4xl font-semibold">{formatPrice(totalValue)}</p>
          <p className="text-teal-100 text-xs mt-1.5">{objects.length} objet{objects.length > 1 ? 's' : ''} enregistré{objects.length > 1 ? 's' : ''}</p>
          {showChart && (
            <div className="mt-4 bg-white rounded-xl p-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">Évolution du patrimoine</p>
                <button onClick={() => setShowChart(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <PatrimoineChart objects={objects} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Garanties</p>
            <p className="text-2xl font-semibold text-gray-900">{activeWarranties}</p>
            {expiringWarranties.length > 0 && (
              <p className="text-xs mt-1" style={{ color: '#BA7517' }}>{expiringWarranties.length} expirent bientôt</p>
            )}
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Factures</p>
            <p className="text-2xl font-semibold text-gray-900">{objects.length}</p>
            <p className="text-xs text-gray-400 mt-1">sauvegardées</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5">
            <p className="text-xs text-gray-400 mb-1.5">Revente</p>
            <p className="text-2xl font-semibold text-gray-900">{totalResale > 0 ? formatPrice(totalResale) : '—'}</p>
            {totalResale > 0 && <p className="text-xs mt-1" style={{ color: '#1D9E75' }}>estimée</p>}
          </div>
        </div>

        <Link href="/scan" className="w-full bg-teal-400 hover:bg-teal-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium transition-colors">
          <ScanLine size={20} />
          Scanner une facture
        </Link>

        <Link href="/sinistre" className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
          <span style={{ fontSize: 16 }}>🚨</span>
          Mode sinistre — Dossier assurance
        </Link>

        {/* Bouton recalculer toutes les estimations */}
        {recalculating ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">Recalcul en cours...</p>
              <p className="text-xs text-teal-600 font-medium">{recalcProgress.done}/{recalcProgress.total}</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-teal-400 transition-all"
                style={{ width: `${(recalcProgress.done / recalcProgress.total) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">L'IA analyse le marché pour chaque objet...</p>
          </div>
        ) : (
          <button onClick={recalculateAllEstimates}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-medium border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={15} />
            Recalculer toutes les estimations via IA
          </button>
        )}

        <WarrantyCard objects={objects} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {Object.keys(memberNames).length > 0 ? 'Objets du foyer' : 'Mes objets'} {objects.length > 0 && `(${objects.length})`}
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
              {objects.slice(0, 10).map(o => {
                const isOther = o.user_id !== userId
                const memberName = memberNames[o.user_id]
                return (
                  <Link href={`/objects/${o.id}`} key={o.id}
                    className={`bg-white border rounded-2xl flex items-center gap-3 px-4 py-3.5 hover:border-gray-200 transition-colors ${isOther ? 'border-teal-100' : 'border-gray-100'}`}>
                    <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {getCategoryEmoji(o.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[o.brand, o.purchase_price ? formatPrice(o.purchase_price) : null, o.seller].filter(Boolean).join(' · ')}
                      </p>
                      {isOther && memberName && (
                        <p className="text-xs text-teal-600 font-medium mt-0.5">👤 {memberName}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${WARRANTY_COLORS[o.warranty_status || 'unknown']}`}>
                      {WARRANTY_LABELS[o.warranty_status || 'unknown']}
                    </span>
                  </Link>
                )
              })}
              {objects.length > 10 && (
                <Link href="/objects" className="block text-center text-sm text-teal-600 py-2 hover:underline">
                  Voir tous les objets ({objects.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around z-10">
        {[
          { icon: '🏠', label: 'Accueil', href: '/dashboard', active: true },
          { icon: '📦', label: 'Objets', href: '/objects', active: false },
          { icon: '📄', label: 'Scanner', href: '/scan', active: false },
          { icon: '👤', label: 'Profil', href: '/profile', active: false },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
            <span className="text-xl">{item.icon}</span>
            <span className={`text-xs ${item.active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  )
}
