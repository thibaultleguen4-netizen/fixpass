'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/types'
import { computeWarrantyEndDate, computeWarrantyStatus, computeResaleEstimate } from '@/lib/utils'
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface ExtractedData {
  product_name: string
  brand: string
  model: string
  category: string
  purchase_date: string
  purchase_price: number
  currency: string
  seller: string
  order_number: string
  serial_number: string
  standard_warranty_months: number
  extended_warranty_detected: boolean
  extended_warranty_months: number
  fields_to_confirm: string[]
  confidence_score: number
}

export default function ScanPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'upload' | 'analyzing' | 'confirm' | 'saving'>('upload')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [form, setForm] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [extWarningDismissed, setExtWarningDismissed] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setStep('analyzing')

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      try {
        const res = await fetch('/api/extract-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, mimeType: f.type }),
        })
        const data = await res.json()
        setExtracted(data)
        setForm({
          name: data.product_name || '',
          brand: data.brand || '',
          model: data.model || '',
          category: data.category || '',
          purchase_date: data.purchase_date || '',
          purchase_price: data.purchase_price?.toString() || '',
          seller: data.seller || '',
          order_number: data.order_number || '',
          serial_number: data.serial_number || '',
          warranty_months: data.standard_warranty_months?.toString() || '24',
          extended_warranty_months: data.extended_warranty_months?.toString() || '0',
        })
        setStep('confirm')
      } catch {
        alert('Erreur lors de l\'analyse. Réessayez ou ajoutez l\'objet manuellement.')
        setStep('upload')
      }
    }
    reader.readAsDataURL(f)
  }

  const handleSave = async () => {
    setStep('saving')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const warrantyEnd = form.purchase_date
      ? computeWarrantyEndDate(form.purchase_date, parseInt(form.warranty_months || '24'), parseInt(form.extended_warranty_months || '0'))
      : null

    const price = form.purchase_price ? parseFloat(form.purchase_price) : null
    let resale = null
    if (price && form.purchase_date && form.category) {
      resale = computeResaleEstimate(price, form.purchase_date, form.category, 'good')
    }

    const { data: objData, error } = await supabase.from('objects').insert({
      user_id: user.id,
      name: form.name,
      brand: form.brand || null,
      model: form.model || null,
      category: form.category || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      purchase_price: price,
      currency: extracted?.currency || 'EUR',
      seller: form.seller || null,
      order_number: form.order_number || null,
      warranty_months: parseInt(form.warranty_months || '24'),
      extended_warranty_months: parseInt(form.extended_warranty_months || '0'),
      warranty_end_date: warrantyEnd,
      warranty_status: warrantyEnd ? computeWarrantyStatus(warrantyEnd) : 'unknown',
      condition: 'good',
      resale_min: resale?.min || null,
      resale_max: resale?.max || null,
      resale_recommended: resale?.recommended || null,
    }).select().single()

    if (error || !objData) { alert('Erreur lors de la sauvegarde.'); setStep('confirm'); return }

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${objData.id}/facture.${ext}`
      const { data: uploadData } = await supabase.storage.from('fixpass-documents').upload(path, file)
      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('fixpass-documents').getPublicUrl(path)
        await supabase.from('documents').insert({
          object_id: objData.id,
          user_id: user.id,
          type: 'receipt',
          file_url: publicUrl,
          file_name: file.name,
          mime_type: file.type,
          extraction_status: 'done',
        })
      }
    }

    router.push(`/objects/${objData.id}`)
  }

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))
  const needsConfirm = (field: string) => extracted?.fields_to_confirm?.includes(field)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="font-semibold text-gray-900">Scanner une facture</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">

        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">Importez une photo ou un PDF de votre facture. L'IA extrait automatiquement les informations.</p>
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors">
                <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="font-medium text-gray-700">Cliquez pour importer</p>
                <p className="text-sm text-gray-400 mt-1">Photo JPG, PNG ou PDF</p>
              </div>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
            </label>
            <div className="text-center text-gray-400 text-sm">— ou —</div>
            <Link href="/objects/new" className="btn-secondary w-full text-center block">
              Ajouter manuellement
            </Link>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🔍</div>
            <p className="font-semibold text-gray-900">Analyse en cours...</p>
            <p className="text-sm text-gray-500 mt-2">L'IA lit votre facture et extrait les informations</p>
          </div>
        )}

        {step === 'confirm' && extracted && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">Analyse terminée — vérifiez les données extraites</span>
            </div>

            {extracted.extended_warranty_detected && !extWarningDismissed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Extension de garantie détectée</p>
                    <p className="text-sm text-yellow-700 mt-0.5">
                      Nous avons détecté une possible extension de {extracted.extended_warranty_months} mois. Confirmez-vous ?
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { set('extended_warranty_months', extracted.extended_warranty_months.toString()); setExtWarningDismissed(true) }}
                        className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-medium">
                        Confirmer
                      </button>
                      <button onClick={() => { set('extended_warranty_months', '0'); setExtWarningDismissed(true) }}
                        className="text-xs bg-white text-yellow-700 border border-yellow-300 px-3 py-1 rounded-full">
                        Ignorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card space-y-4">
              {[
                { key: 'name', label: 'Produit' },
                { key: 'brand', label: 'Marque' },
                { key: 'model', label: 'Modèle' },
                { key: 'seller', label: 'Vendeur' },
                { key: 'order_number', label: 'N° commande' },
                { key: 'serial_number', label: 'N° de série' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label flex items-center gap-2">
                    {label}
                    {needsConfirm(key) && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">À vérifier</span>}
                  </label>
                  <input
                    className={`input ${needsConfirm(key) ? 'border-yellow-300 focus:ring-yellow-400' : ''}`}
                    value={form[key] || ''}
                    onChange={e => set(key, e.target.value)}
                  />
                </div>
              ))}

              <div>
                <label className="label">Catégorie</label>
                <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date d'achat</label>
                  <input className="input" type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
                </div>
                <div>
                  <label className="label">Prix (€)</label>
                  <input className="input" type="number" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Garantie (mois)</label>
                  <input className="input" type="number" value={form.warranty_months} onChange={e => set('warranty_months', e.target.value)} />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    Extension
                    {needsConfirm('extended_warranty_months') && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded-full">⚠</span>}
                  </label>
                  <input className="input" type="number" value={form.extended_warranty_months} onChange={e => set('extended_warranty_months', e.target.value)} />
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="btn-primary w-full py-3">
              Créer la fiche objet →
            </button>
          </div>
        )}

        {step === 'saving' && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">💾</div>
            <p className="font-semibold text-gray-900">Sauvegarde en cours...</p>
          </div>
        )}
      </div>
    </div>
  )
}
