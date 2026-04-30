'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function AddRepairPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', repair_date: '', cost: '', provider: '' })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('repairs').insert({
      object_id: params.id,
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      repair_date: form.repair_date || null,
      cost: form.cost ? parseFloat(form.cost) : null,
      provider: form.provider || null,
    })
    router.push(`/objects/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/objects/${params.id}`} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="font-semibold text-gray-900">Ajouter une réparation</h1>
      </header>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Titre *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Remplacement écran" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.repair_date} onChange={e => set('repair_date', e.target.value)} />
            </div>
            <div>
              <label className="label">Coût (€)</label>
              <input className="input" type="number" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="150" />
            </div>
          </div>
          <div>
            <label className="label">Prestataire</label>
            <input className="input" value={form.provider} onChange={e => set('provider', e.target.value)} placeholder="Apple Store, SAV..." />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Détails de l'intervention..." />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Enregistrement...' : 'Ajouter la réparation'}
        </button>
      </form>
    </div>
  )
}
