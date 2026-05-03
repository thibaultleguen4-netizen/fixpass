'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/types'
import { computeWarrantyEndDate, computeWarrantyStatus } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function NewObjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', model: '', category: '', serial_number: '',
    purchase_date: '', purchase_price: '', currency: 'EUR',
    seller: '', order_number: '', warranty_months: '24',
    extended_warranty_months: '0', condition: 'good', notes: '',
    is_second_hand: false,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const warrantyEnd = form.purchase_date
      ? computeWarrantyEndDate(form.purchase_date, parseInt(form.warranty_months), parseInt(form.extended_warranty_months))
      : null

    const price = form.purchase_price ? parseFloat(form.purchase_price) : null

    const { data, error } = await supabase.from('objects').insert({
      user_id: user.id,
      name: form.name,
      brand: form.brand || null,
      model: form.model || null,
      category: form.category || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      purchase_price: price,
      currency: form.currency,
      seller: form.seller || null,
      order_number: form.order_number || null,
      warranty_months: parseInt(form.warranty_months),
      extended_warranty_months: parseInt(form.extended_warranty_months),
      warranty_end_date: warrantyEnd,
      warranty_status: warrantyEnd ? computeWarrantyStatus(warrantyEnd) : 'unknown',
      condition: form.condition,
      is_second_hand: form.is_second_hand,
      resale_min: null,
      resale_max: null,
      resale_recommended: null,
      notes: form.notes || null,
    }).select().single()

    if (error) { alert('Erreur : ' + error.message); setLoading(false); return }

    setLoading(false)
    setEstimating(true)
    try {
      const estimateRes = await fetch(`${SUPABASE_URL}/functions/v1/estimate-resale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          name: data.name, brand: data.brand, model: data.model,
          category: data.category, purchase_date: data.purchase_date,
          condition: data.condition, repairs: [],
          is_second_hand: form.is_second_hand,
          purchase_price: price,
        }),
      })
      const estimate = await estimateRes.json()
      if (estimate.resale_recommended) {
        await supabase.from('objects').update({
          resale_min: estimate.resale_min,
          resale_max: estimate.resale_max,
          resale_recommended: estimate.resale_recommended,
        }).eq('id', data.id)
      }
    } catch {}

    router.push(`/objects/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="font-semibold text-gray-900">Ajouter un objet</h1>
      </header>

      {estimating ? (
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="card text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">💶</div>
            <p className="font-semibold text-gray-900">Estimation de la valeur de revente...</p>
            <p className="text-sm text-gray-500 mt-2">L'IA analyse le marché français, patientez...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-5">

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Informations générales</h2>
            <div>
              <label className="label">Nom de l'objet *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: iPhone 14" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Marque</label>
                <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Apple" />
              </div>
              <div>
                <label className="label">Modèle</label>
                <input className="input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="A2882" />
              </div>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Choisir...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Numéro de série</label>
              <input className="input" value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="SN123456" />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Achat</h2>

            {/* Toggle Neuf / Occasion */}
            <div>
              <label className="label">Type d'achat</label>
              <div className="flex gap-2 mt-1">
                <button type="button"
                  onClick={() => set('is_second_hand', false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    !form.is_second_hand
                      ? 'bg-teal-400 border-teal-400 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  ✨ Neuf
                </button>
                <button type="button"
                  onClick={() => set('is_second_hand', true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    form.is_second_hand
                      ? 'bg-orange-400 border-orange-400 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  🔄 Occasion
                </button>
              </div>
              {form.is_second_hand && (
                <p className="text-xs text-orange-600 mt-1.5">
                  L'estimation de revente tiendra compte du fait que l'objet était déjà d'occasion à l'achat.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date d'achat</label>
                <input className="input" type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
              </div>
              <div>
                <label className="label">Prix d'achat (€)</label>
                <input className="input" type="number" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} placeholder="899" />
              </div>
            </div>
            <div>
              <label className="label">Vendeur</label>
              <input className="input" value={form.seller} onChange={e => set('seller', e.target.value)} placeholder="Fnac, Amazon, Leboncoin..." />
            </div>
            <div>
              <label className="label">N° de commande</label>
              <input className="input" value={form.order_number} onChange={e => set('order_number', e.target.value)} placeholder="FNAC-928381" />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Garantie</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Garantie standard (mois)</label>
                <input className="input" type="number" value={form.warranty_months} onChange={e => set('warranty_months', e.target.value)} />
              </div>
              <div>
                <label className="label">Extension (mois)</label>
                <input className="input" type="number" value={form.extended_warranty_months} onChange={e => set('extended_warranty_months', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">État</h2>
            <div>
              <label className="label">État actuel</label>
              <select className="input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                <option value="new">Neuf</option>
                <option value="like_new">Comme neuf</option>
                <option value="good">Bon état</option>
                <option value="fair">État correct</option>
                <option value="poor">Mauvais état</option>
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input h-20 resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Observations, accessoires inclus..." />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Enregistrement...' : 'Créer la fiche objet'}
          </button>
        </form>
      )}
    </div>
  )
}
