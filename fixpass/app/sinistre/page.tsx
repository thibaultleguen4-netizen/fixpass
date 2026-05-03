'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem } from '@/lib/types'
import { formatPrice, getCategoryEmoji } from '@/lib/utils'
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const SINISTRE_TYPES = [
  { key: 'fire', label: 'Incendie', emoji: '🔥' },
  { key: 'water', label: 'Dégât des eaux', emoji: '🌊' },
  { key: 'theft', label: 'Vol / Cambriolage', emoji: '🔓' },
  { key: 'other', label: 'Autre sinistre', emoji: '⚡' },
]

interface ObjectWithDoc extends ObjectItem {
  document_url?: string
  ownerName?: string
}

export default function SinisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [objects, setObjects] = useState<ObjectWithDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [sinistreType, setSinistreType] = useState('theft')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur')
      setUserId(user.id)

      // Vérifier si chef de foyer
      const { data: householdData } = await supabase
        .from('households')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      setIsOwner(!!householdData)

      // Récupérer les noms des membres si chef
      const memberNames: Record<string, string> = {}
      if (householdData) {
        const { data: members } = await supabase
          .from('household_members')
          .select('user_id')
          .eq('household_id', householdData.id)
          .neq('user_id', user.id)

        for (const m of members || []) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', m.user_id)
            .single()
          memberNames[m.user_id] = profile?.full_name || profile?.email?.split('@')[0] || 'Membre'
        }
      }

      // Charger tous les objets (RLS retourne automatiquement ceux des membres si chef)
      const { data: objs } = await supabase
        .from('objects')
        .select('*')
        .order('purchase_price', { ascending: false })
      if (!objs) { setLoading(false); return }

      // Récupérer les documents
      const { data: docs } = await supabase
        .from('documents')
        .select('object_id, file_url')
        .eq('type', 'receipt')

      const docMap: Record<string, string> = {}
      docs?.forEach(d => { if (!docMap[d.object_id]) docMap[d.object_id] = d.file_url })

      // Générer URLs signées
      const objectsWithDocs = await Promise.all(objs.map(async (o) => {
        const fileUrl = docMap[o.id]
        const ownerName = o.user_id !== user.id ? memberNames[o.user_id] : undefined

        if (!fileUrl) return { ...o, document_url: undefined, ownerName }

        try {
          const urlParts = fileUrl.split('/fixpass-documents/')
          if (urlParts.length < 2) return { ...o, document_url: fileUrl, ownerName }
          const path = decodeURIComponent(urlParts[1].split('?')[0])
          const { data } = await supabase.storage
            .from('fixpass-documents')
            .createSignedUrl(path, 3600)
          return { ...o, document_url: data?.signedUrl || fileUrl, ownerName }
        } catch {
          return { ...o, document_url: fileUrl, ownerName }
        }
      }))

      setObjects(objectsWithDocs)
      setSelectedIds(new Set(objectsWithDocs.map(o => o.id)))
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
  const withSerial = selectedObjects.filter(o => o.serial_number).length
  const withDoc = selectedObjects.filter(o => (o as ObjectWithDoc).document_url).length

  // Grouper par propriétaire pour l'affichage
  const myObjects = objects.filter(o => o.user_id === userId)
  const memberObjects = objects.filter(o => o.user_id !== userId)

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

      const win = window.open('', '_blank')
      if (win) {
        win.document.write(data.html)
        win.document.close()
        setTimeout(() => win.print(), 800)
      }
    } catch {
      alert('Erreur lors de la génération.')
    }
    setGenerating(false)
  }

  const ObjectCard = ({ o }: { o: ObjectWithDoc }) => {
    const selected = selectedIds.has(o.id)
    const hasDoc = !!o.document_url
    return (
      <button onClick={() => toggleObject(o.id)}
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
          {o.ownerName && (
            <p className="text-xs text-teal-600 font-medium mt-0.5">👤 {o.ownerName}</p>
          )}
          <p className={`text-xs mt-0.5 font-medium ${hasDoc ? 'text-teal-600' : 'text-gray-300'}`}>
            {hasDoc ? '🧾 Facture + QR code' : '— Pas de facture'}
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

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-red-800 mb-1">🛡️ Dossier d'urgence assurance</p>
          <p className="text-xs text-red-600 leading-relaxed">
            Le PDF généré contient un <strong>QR code par objet</strong> qui renvoie directement vers la facture originale.
            {isOwner && <span> Les objets de tous les membres du foyer sont inclus.</span>}
          </p>
        </div>

        {/* Étape 1 */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">1 — Type de sinistre</p>
          <div className="grid grid-cols-2 gap-2">
            {SINISTRE_TYPES.map(t => (
              <button key={t.key} onClick={() => setSinistreType(t.key)}
                className={`rounded-2xl p-4 text-center border transition-colors ${
                  sinistreType === t.key ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className={`text-sm font-medium ${sinistreType === t.key ? 'text-red-700' : 'text-gray-700'}`}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Étape 2 */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">2 — Objets concernés</p>
          <button onClick={toggleAll} className="w-full flex items-center justify-between py-2 px-1 mb-2">
            <span className="text-sm font-medium text-red-600">
              {selectedIds.size === objects.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </span>
            <span className="text-xs text-gray-400">
              {selectedIds.size} objet{selectedIds.size > 1 ? 's' : ''} · {formatPrice(totalAchat)}
            </span>
          </button>

          {/* Mes objets */}
          {myObjects.length > 0 && (
            <div className="space-y-2 mb-3">
              {isOwner && memberObjects.length > 0 && (
                <p className="text-xs font-medium text-gray-400 mb-2">Mes objets ({myObjects.length})</p>
              )}
              {myObjects.map(o => <ObjectCard key={o.id} o={o} />)}
            </div>
          )}

          {/* Objets des membres */}
          {isOwner && memberObjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-teal-600 mb-2">🏠 Objets des membres du foyer ({memberObjects.length})</p>
              {memberObjects.map(o => <ObjectCard key={o.id} o={o} />)}
            </div>
          )}
        </div>

        {/* Étape 3 */}
        {selectedObjects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">3 — Récapitulatif</p>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
              {[
                { label: 'Objets sélectionnés', value: `${selectedObjects.length} objet${selectedObjects.length > 1 ? 's' : ''}` },
                { label: 'Valeur d\'achat totale', value: formatPrice(totalAchat), color: 'text-red-600' },
                { label: 'Valeur de remplacement', value: formatPrice(totalRevente), color: 'text-teal-600' },
                { label: 'Préjudice déclaré', value: formatPrice(totalAchat), color: 'text-red-700 font-semibold' },
                { label: 'QR codes factures', value: `${withDoc} / ${selectedObjects.length}`, color: withDoc === selectedObjects.length ? 'text-teal-600' : 'text-yellow-600' },
                { label: 'N° de série', value: `${withSerial} / ${selectedObjects.length}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-medium ${row.color || 'text-gray-900'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={generatePDF} disabled={generating || selectedObjects.length === 0}
            style={{ background: selectedObjects.length === 0 ? '#ccc' : '#E24B4A' }}
            className="w-full text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium transition-colors">
            <FileText size={20} />
            {generating ? 'Génération en cours...' : '🛡️ Générer le dossier PDF'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Le PDF s'ouvre dans un nouvel onglet. Utilisez <strong>Fichier → Enregistrer en PDF</strong> pour le sauvegarder.
          </p>
        </div>

      </div>
    </div>
  )
}
