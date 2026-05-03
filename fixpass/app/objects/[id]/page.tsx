'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem, Repair, Document } from '@/lib/types'
import { formatPrice, formatDate, getCategoryEmoji, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS } from '@/lib/types'
import { ArrowLeft, Trash2, Edit, Plus, FileText, Wrench, RefreshCw, Download, Eye, Paperclip, X, Upload, Hammer } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface RepairabilityData {
  score: number
  level: string
  summary: string
  software_label?: string
  criteria: {
    documentation: number
    spare_parts: number
    disassembly: number
    software: number
    parts_price: number
  }
  tips: string[]
  common_repairs: string[]
}

export default function ObjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const objectId = params.id as string
  const supabase = createClient()
  const [obj, setObj] = useState<ObjectItem | null>(null)
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [annonce, setAnnonce] = useState('')
  const [generatingAnnonce, setGeneratingAnnonce] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [marketContext, setMarketContext] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [repairability, setRepairability] = useState<RepairabilityData | null>(null)
  const [loadingRepairability, setLoadingRepairability] = useState(false)

  const [showRepairForm, setShowRepairForm] = useState(false)
  const [repairForm, setRepairForm] = useState({ title: '', description: '', repair_date: '', cost: '', provider: '' })
  const [repairFile, setRepairFile] = useState<File | null>(null)
  const [savingRepair, setSavingRepair] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: objData } = await supabase.from('objects').select('*').eq('id', objectId).single()
      if (!objData) { router.push('/dashboard'); return }
      setObj(objData)
      const { data: repairData } = await supabase.from('repairs').select('*').eq('object_id', objectId).order('repair_date', { ascending: false })
      setRepairs(repairData || [])
      const { data: docData } = await supabase.from('documents').select('*').eq('object_id', objectId).order('created_at', { ascending: false })
      setDocuments(docData || [])
      setLoading(false)
    }
    load()
  }, [objectId])

  const handleDelete = async () => {
    if (!confirm('Supprimer cet objet définitivement ?')) return
    await supabase.from('objects').delete().eq('id', objectId)
    router.push('/dashboard')
  }

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingRepair(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSavingRepair(false); return }

      const { data, error } = await supabase.from('repairs').insert({
        object_id: objectId,
        user_id: user.id,
        title: repairForm.title,
        description: repairForm.description || null,
        repair_date: repairForm.repair_date || null,
        cost: repairForm.cost ? parseFloat(repairForm.cost) : null,
        provider: repairForm.provider || null,
      }).select().single()

      if (error) { alert('Erreur : ' + error.message); setSavingRepair(false); return }

      if (data && repairFile) {
        const ext = repairFile.name.split('.').pop()
        const timestamp = Date.now()
        const path = `${user.id}/${objectId}/repair_${timestamp}.${ext}`
        const { error: uploadError } = await supabase.storage.from('fixpass-documents').upload(path, repairFile, { upsert: true })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('fixpass-documents').getPublicUrl(path)
          const { data: docData } = await supabase.from('documents').insert({
            object_id: objectId, user_id: user.id, type: 'other',
            file_url: publicUrl, file_name: repairFile.name, mime_type: repairFile.type, extraction_status: 'done',
          }).select().single()
          if (docData) setDocuments(prev => [docData, ...prev])
        }
      }

      if (data) setRepairs(prev => [data, ...prev])
      setRepairForm({ title: '', description: '', repair_date: '', cost: '', provider: '' })
      setRepairFile(null)
      setShowRepairForm(false)
    } catch { alert('Erreur inattendue.') }
    setSavingRepair(false)
  }

  const loadRepairability = async () => {
    if (!obj) return
    setLoadingRepairability(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/repairability-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          name: obj.name, brand: obj.brand, model: obj.model,
          category: obj.category, purchase_date: obj.purchase_date,
        }),
      })
      const data = await res.json()
      setRepairability(data)
    } catch { alert('Erreur lors du calcul.') }
    setLoadingRepairability(false)
  }

  const generateAnnonce = async () => {
    if (!obj) return
    setGeneratingAnnonce(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-annonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ object: obj }),
      })
      const data = await res.json()
      setAnnonce(data.annonce)
    } catch { setAnnonce('Erreur lors de la génération. Réessayez.') }
    setGeneratingAnnonce(false)
  }

  const updateResaleEstimate = async () => {
    if (!obj) return
    setEstimating(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/estimate-resale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          name: obj.name, brand: obj.brand, model: obj.model, category: obj.category,
          purchase_date: obj.purchase_date, purchase_price: obj.purchase_price, condition: obj.condition,
          is_second_hand: (obj as any).is_second_hand || false,
          repairs: repairs.map(r => ({ title: r.title, date: r.repair_date, cost: r.cost, description: r.description })),
        }),
      })
      const data = await res.json()
      if (data.resale_recommended) {
        await supabase.from('objects').update({
          resale_min: data.resale_min, resale_max: data.resale_max, resale_recommended: data.resale_recommended,
        }).eq('id', objectId)
        setObj(prev => prev ? { ...prev, resale_min: data.resale_min, resale_max: data.resale_max, resale_recommended: data.resale_recommended } : null)
        setMarketContext(data.market_context || '')
        setPlatforms(data.platforms || [])
      }
    } catch { alert('Erreur lors de l\'estimation.') }
    setEstimating(false)
  }

  const getSignedUrl = async (fileUrl: string) => {
    const urlParts = fileUrl.split('/fixpass-documents/')
    if (urlParts.length < 2) return null
    const path = decodeURIComponent(urlParts[1].split('?')[0])
    const { data, error } = await supabase.storage.from('fixpass-documents').createSignedUrl(path, 3600)
    if (error || !data) return null
    return data.signedUrl
  }

  const openDocument = async (doc: Document) => {
    if (!doc.file_url) return
    const signedUrl = await getSignedUrl(doc.file_url)
    if (!signedUrl) { alert('Impossible d\'ouvrir ce fichier.'); return }
    window.open(signedUrl, '_blank')
  }

  const downloadDocument = async (doc: Document) => {
    if (!doc.file_url) return
    const signedUrl = await getSignedUrl(doc.file_url)
    if (!signedUrl) { alert('Impossible de télécharger ce fichier.'); return }
    const response = await fetch(signedUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = doc.file_name || 'document'
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>, type: string = 'receipt') => {
    const file = e.target.files?.[0]
    if (!file || !obj) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const timestamp = Date.now()
    const path = `${user.id}/${objectId}/${type}_${timestamp}.${ext}`
    const { error } = await supabase.storage.from('fixpass-documents').upload(path, file)
    if (error) { alert('Erreur upload : ' + error.message); return }
    const { data: { publicUrl } } = supabase.storage.from('fixpass-documents').getPublicUrl(path)
    const { data: docData } = await supabase.from('documents').insert({
      object_id: objectId, user_id: user.id, type,
      file_url: publicUrl, file_name: file.name, mime_type: file.type, extraction_status: 'done',
    }).select().single()
    if (docData) setDocuments(prev => [docData, ...prev])
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Supprimer ce document ?')) return
    await supabase.from('documents').delete().eq('id', docId)
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  const getDocumentIcon = (type: string) => ({ receipt: '🧾', photo: '📷', manual: '📖', warranty: '🛡️' }[type] || '📄')
  const getDocumentLabel = (type: string) => ({ receipt: 'Facture', photo: 'Photo', manual: 'Manuel', warranty: 'Garantie' }[type] || 'Document')

  const getRepairabilityColor = (score: number) => {
    if (score >= 7) return { bar: 'bg-green-400', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    if (score >= 5) return { bar: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    return { bar: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const criteriaLabels: Record<string, string> = {
    documentation: 'Documentation',
    spare_parts: 'Pièces détachées',
    disassembly: 'Démontage',
    software: repairability?.software_label || 'Logiciel',
    parts_price: 'Prix des pièces',
  }

  if (loading || !obj) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Chargement...</div></div>
  }

  const daysLeft = daysUntilExpiry(obj.warranty_end_date)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <h1 className="font-semibold text-gray-900 truncate max-w-[200px]">{obj.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/objects/${objectId}/edit`} className="text-gray-400 hover:text-gray-600"><Edit size={18} /></Link>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {getCategoryEmoji(obj.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{obj.name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{[obj.brand, obj.model].filter(Boolean).join(' · ')}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${WARRANTY_COLORS[obj.warranty_status || 'unknown']}`}>
                  {WARRANTY_LABELS[obj.warranty_status || 'unknown']}
                  {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft} jours restants`}
                </span>
                {(obj as any).is_second_hand && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-100 text-orange-700">
                    🔄 Occasion
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-2">
          <h3 className="font-semibold text-gray-900 text-sm">Achat</h3>
          {[
            ['Date', formatDate(obj.purchase_date)],
            ['Prix', formatPrice(obj.purchase_price, obj.currency)],
            ['Vendeur', obj.seller],
            ['N° commande', obj.order_number],
            ['N° de série', obj.serial_number],
            ['Catégorie', obj.category],
          ].map(([k, v]) => v && (
            <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-900 font-medium text-right max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>

        <div className={`card space-y-2 border-l-4 ${
          obj.warranty_status === 'active' ? 'border-l-green-400' :
          obj.warranty_status === 'expiring_soon' ? 'border-l-yellow-400' : 'border-l-red-300'
        }`}>
          <h3 className="font-semibold text-gray-900 text-sm">Garantie</h3>
          {[
            ['Durée standard', `${obj.warranty_months} mois`],
            ['Extension', obj.extended_warranty_months > 0 ? `${obj.extended_warranty_months} mois` : null],
            ['Fin de garantie', formatDate(obj.warranty_end_date)],
            ['Statut', WARRANTY_LABELS[obj.warranty_status || 'unknown']],
          ].map(([k, v]) => v && (
            <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-900 font-medium">{v}</span>
            </div>
          ))}
        </div>

        {/* Indice de réparabilité */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Hammer size={16} /> Indice de réparabilité
            </h3>
            {repairability && (
              <button onClick={loadRepairability} disabled={loadingRepairability}
                className="flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:underline">
                <RefreshCw size={12} className={loadingRepairability ? 'animate-spin' : ''} />
                Actualiser
              </button>
            )}
          </div>

          {repairability ? (
            <div className="space-y-3">
              <div className={`rounded-xl p-4 ${getRepairabilityColor(repairability.score).bg} border ${getRepairabilityColor(repairability.score).border}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-3xl font-bold ${getRepairabilityColor(repairability.score).text}`}>
                    {repairability.score}/10
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRepairabilityColor(repairability.score).bg} ${getRepairabilityColor(repairability.score).text} border ${getRepairabilityColor(repairability.score).border}`}>
                    {repairability.score >= 7 ? '🟢 Facile à réparer' : repairability.score >= 5 ? '🟡 Réparable' : '🔴 Difficile à réparer'}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full ${getRepairabilityColor(repairability.score).bar}`}
                    style={{ width: `${repairability.score * 10}%` }} />
                </div>
                <p className="text-xs text-gray-600">{repairability.summary}</p>
              </div>

              <div className="space-y-2">
                {Object.entries(repairability.criteria).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-36 flex-shrink-0">{criteriaLabels[key]}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${getRepairabilityColor(val).bar}`}
                        style={{ width: `${val * 10}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>

              {repairability.common_repairs.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">Réparations courantes :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {repairability.common_repairs.map(r => (
                      <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {repairability.tips.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-blue-800 mb-1">💡 Conseils</p>
                  {repairability.tips.map(tip => (
                    <p key={tip} className="text-xs text-blue-700 mt-0.5">• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button onClick={loadRepairability} disabled={loadingRepairability} className="btn-primary w-full">
              {loadingRepairability ? 'Calcul en cours...' : '🔧 Calculer l\'indice de réparabilité'}
            </button>
          )}
        </div>

        {/* Documents */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Paperclip size={16} /> Documents
            </h3>
            <label className="text-teal-600 text-xs font-medium flex items-center gap-1 hover:underline cursor-pointer">
              <Plus size={12} /> Ajouter
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleUploadDocument(e, 'receipt')} />
            </label>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">Aucun document enregistré.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-xl flex-shrink-0">{getDocumentIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name || getDocumentLabel(doc.type)}</p>
                    <p className="text-xs text-gray-400">{getDocumentLabel(doc.type)} · {formatDate(doc.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openDocument(doc)} className="text-teal-600 hover:text-teal-700" title="Voir"><Eye size={16} /></button>
                    <button onClick={() => downloadDocument(doc)} className="text-teal-600 hover:text-teal-700" title="Télécharger"><Download size={16} /></button>
                    <button onClick={() => handleDeleteDocument(doc.id)} className="text-red-400 hover:text-red-600" title="Supprimer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revente */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Estimation de revente</h3>
            <button onClick={updateResaleEstimate} disabled={estimating}
              className="flex items-center gap-1.5 text-xs text-teal-600 font-medium hover:underline">
              <RefreshCw size={12} className={estimating ? 'animate-spin' : ''} />
              {estimating ? 'Analyse...' : 'Actualiser via IA'}
            </button>
          </div>
          {obj.resale_recommended ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[['Vente rapide', obj.resale_min, false], ['Recommandé', obj.resale_recommended, true], ['Ambitieux', obj.resale_max, false]].map(([label, val, highlight]) => (
                  <div key={label as string} className={`rounded-xl p-3 text-center ${highlight ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'}`}>
                    <div className={`text-lg font-bold ${highlight ? 'text-teal-700' : 'text-gray-900'}`}>{formatPrice(val as number)}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label as string}</div>
                  </div>
                ))}
              </div>
              {marketContext && <p className="text-xs text-gray-500 italic">{marketContext}</p>}
              {platforms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-400">Vendre sur :</span>
                  {platforms.map(p => <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p}</span>)}
                </div>
              )}
            </>
          ) : (
            <button onClick={updateResaleEstimate} disabled={estimating} className="btn-primary w-full">
              {estimating ? 'Analyse du marché...' : '💶 Estimer la valeur de revente'}
            </button>
          )}
        </div>

        {/* Annonce */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <FileText size={16} /> Annonce de revente
          </h3>
          {annonce ? (
            <div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3 font-sans">{annonce}</pre>
              <button onClick={() => navigator.clipboard.writeText(annonce)} className="btn-secondary w-full mt-2 text-sm">Copier l'annonce</button>
            </div>
          ) : (
            <button onClick={generateAnnonce} disabled={generatingAnnonce} className="btn-primary w-full">
              {generatingAnnonce ? 'Génération en cours...' : '✨ Générer une annonce IA'}
            </button>
          )}
        </div>

        {/* Réparations */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Wrench size={16} /> Historique réparations
            </h3>
            <button onClick={() => { setShowRepairForm(!showRepairForm); setRepairFile(null) }}
              className="text-teal-600 text-xs font-medium flex items-center gap-1 hover:underline">
              {showRepairForm ? <><X size={12} /> Annuler</> : <><Plus size={12} /> Ajouter</>}
            </button>
          </div>

          {showRepairForm && (
            <form onSubmit={handleAddRepair} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div>
                <label className="label">Titre *</label>
                <input className="input" value={repairForm.title} onChange={e => setRepairForm(f => ({...f, title: e.target.value}))} placeholder="Remplacement écran" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={repairForm.repair_date} onChange={e => setRepairForm(f => ({...f, repair_date: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Coût (€)</label>
                  <input className="input" type="number" value={repairForm.cost} onChange={e => setRepairForm(f => ({...f, cost: e.target.value}))} placeholder="150" />
                </div>
              </div>
              <div>
                <label className="label">Prestataire</label>
                <input className="input" value={repairForm.provider} onChange={e => setRepairForm(f => ({...f, provider: e.target.value}))} placeholder="Apple Store, SAV..." />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20 resize-none" value={repairForm.description} onChange={e => setRepairForm(f => ({...f, description: e.target.value}))} placeholder="Détails..." />
              </div>
              <div>
                <label className="label">Facture de réparation (optionnel)</label>
                {repairFile ? (
                  <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
                    <span className="text-lg">🧾</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-teal-800 truncate">{repairFile.name}</p>
                      <p className="text-xs text-teal-600">{(repairFile.size / 1024).toFixed(0)} Ko</p>
                    </div>
                    <button type="button" onClick={() => setRepairFile(null)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors">
                      <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Cliquez pour joindre la facture</p>
                    </div>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setRepairFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
              <button type="submit" disabled={savingRepair} className="btn-primary w-full py-2 text-sm">
                {savingRepair ? 'Enregistrement...' : 'Ajouter la réparation'}
              </button>
            </form>
          )}

          {repairs.length === 0 && !showRepairForm ? (
            <p className="text-sm text-gray-400">Aucune réparation enregistrée.</p>
          ) : (
            <div className="space-y-2">
              {repairs.map(r => (
                <div key={r.id} className="bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{r.title}</span>
                    {r.cost && <span className="text-gray-500">{formatPrice(r.cost)}</span>}
                  </div>
                  {r.repair_date && <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.repair_date)}</p>}
                  {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {obj.notes && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{obj.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
