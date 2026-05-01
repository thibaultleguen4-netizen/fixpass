'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, formatDate, getCategoryEmoji } from '@/lib/utils'
import { ArrowLeft, FileText, Download, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const SINISTRE_TYPES = [
  { key: 'fire', label: 'Incendie', emoji: '🔥' },
  { key: 'water', label: 'Dégât des eaux', emoji: '🌊' },
  { key: 'theft', label: 'Vol / Cambriolage', emoji: '🔓' },
  { key: 'other', label: 'Autre sinistre', emoji: '⚡' },
]

export default function SinisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sinistreType, setSinistreType] = useState('theft')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')
      const { data } = await supabase.from('objects').select('*').order('purchase_price', { ascending: false })
      if (data) {
        setObjects(data)
        setSelectedIds(new Set(data.map(o => o.id)))
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleObject = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === objects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(objects.map(o => o.id)))
    }
  }

  const selectedObjects = objects.filter(o => selectedIds.has(o.id))
  const totalAchat = selectedObjects.reduce((s, o) => s + (o.purchase_price || 0), 0)
  const totalRevente = selectedObjects.reduce((s, o) => s + (o.resale_recommended || (o.purchase_price || 0) * 0.6), 0)
  const withFacture = selectedObjects.filter(o => o.id).length
  const withSerial = selectedObjects.filter(o => o.serial_number).length

  const generatePDF = async () => {
    if (selectedObjects.length === 0) { alert('Sélectionnez au moins un objet.'); return }
    setGenerating(true)

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-sinistre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          objects: selectedObjects,
          sinistreType,
          userName,
          generatedAt: new Date().toISOString(),
        }),
      })

      const data = await res.json()
      if (!data.html) { alert('Erreur lors de la génération.'); setGenerating(false); return }

      // Ouvrir dans nouvelle fenêtre pour impression/sauvegarde PDF
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(data.html)
        win.document.close()
        setTimeout(() => win.print(), 500)
      }
    } catch (err) {
      alert('Erreur lors de la génération.')
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header rouge */}
      <header style={{ background: '#A32D2D' }} className="px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-red-200 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-300" />
            Mode sinistre
          </h1>
          <p className="text-red-300 text-xs mt-0.5">Génération du dossier d'indemnisation</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 pb-24 space-y-5">

        {/* Alerte */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-red-800 mb-1">Dossier d'urgence assurance</p>
          <p className="text-xs text-red-600 leading-relaxed">
            Ce dossier sera accepté par votre assureur comme preuve de propriété et d'estimation de valeur. Sélectionnez les objets concernés et générez le PDF en un clic.
          </p>
        </div>

        {/* Étape 1 — Type */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">1 — Type de sinistre</p>
          <div className="grid grid-cols-2 gap-2">
            {SINISTRE_TYPES.map(t => (
              <button key={t.key} onClick={() => setSinistreType(t.key)}
                className={`rounded-2xl p-4 text-center border transition-colors ${
                  sinistreType === t.key
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className={`text-sm font-medium ${sinistreType === t.key ? 'text-red-700' : 'text-gray-700'}`}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Étape 2 — Sélection objets */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">2 — Objets concernés</p>

          <button onClick={toggleAll}
            className="w-full flex items-center justify-between py-2 px-1 mb-2">
            <span className="text-sm font-medium text-red-600">
              {selectedIds.size === objects.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </span>
            <span className="text-xs text-gray-400">
              {selectedIds.size} objet{selectedIds.size > 1 ? 's' : ''} · {formatPrice(totalAchat)}
            </span>
          </button>

          <div className="space-y-2">
            {objects.map(o => {
              const selected = selectedIds.has(o.id)
              return (
                <button key={o.id} onClick={() => toggleObject(o.id)}
                  className={`w-full bg-white border rounded-2xl flex items-center gap-3 px-4 py-3.5 transition-colors ${
                    selected ? 'border-red-300' : 'border-gray-100 opacity-60'
                  }`}>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {getCategoryEmoji(o.category)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-gray-900 text-sm truncate">{o.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[o.brand, o.purchase_price ? formatPrice(o.purchase_price) : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}>
                    {selected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Étape 3 — Récapitulatif */}
        {selectedObjects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">3 — Récapitulatif du dossier</p>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
              {[
                { label: 'Objets sélectionnés', value: `${selectedObjects.length} objet${selectedObjects.length > 1 ? 's' : ''}` },
                { label: 'Valeur d\'achat totale', value: formatPrice(totalAchat), color: 'text-red-600' },
                { label: 'Valeur de remplacement', value: formatPrice(totalRevente), color: 'text-teal-600' },
                { label: 'Préjudice déclaré', value: formatPrice(totalAchat), color: 'text-red-700 font-semibold' },
                { label: 'N° de série disponibles', value: `${withSerial} / ${selectedObjects.length}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-medium ${row.color || 'text-gray-900'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="space-y-3">
          <button onClick={generatePDF} disabled={generating || selectedObjects.length === 0}
            style={{ background: selectedObjects.length === 0 ? '#ccc' : '#E24B4A' }}
            className="w-full text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium transition-colors">
            <FileText size={20} />
            {generating ? 'Génération en cours...' : '🛡️ Générer le dossier PDF'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Le PDF s'ouvrira dans un nouvel onglet. Utilisez "Enregistrer en PDF" dans votre navigateur.
          </p>
        </div>

      </div>
    </div>
  )
}
