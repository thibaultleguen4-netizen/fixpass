'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/types'
import { computeWarrantyEndDate, computeWarrantyStatus, computeResaleEstimate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default function NewObjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', model: '', category: '', serial_number: '',
    purchase_date: '', purchase_price: '', currency: 'EUR',
    seller: '', order_number: '', warranty_months: '24',
    extended_warranty_months: '0', condition: 'good', notes: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const warrantyEnd = form.purchase_date
      ? computeWarrantyEndDate(form.purchase_date, parseInt(form.warranty_months), parseInt(form.extended_warranty_months))
      : null

    const warrantyStatus = warrantyEnd ? computeWarrantyStatus(warrantyEnd) : 'unknown'

    const price = form.purchase_price ? parseFloat(form.purchase_price) : null
    let resale = null
    if (price && form.purchase_date && form.category) {
      resale = computeResaleEstimate(price, form.purchase_date, form.category, form.condition)
    }

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
      warranty_status: warrantyStatus,
      condition: form.condition,
      resale_min: resale?.min || null,
      resale_max: resale?.max || null,
      resale_recommended: resale?.recommended || null,
      notes: form.notes || null,
    }).select().single()

    if (error) { alert('Erreur : ' + error.message); setLoading(false); return }
    router.push(`/objects/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="font-semibold text-gray-900">Ajouter un objet</h1>
      </header>

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
            <input className="input" value={form.seller} onChange={e => set('seller', e.target.value)} placeholder="Fnac, Amazon..." />
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
    </div>
  )
}
