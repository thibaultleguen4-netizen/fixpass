'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Upload } from 'lucide-react'

export default function AddRepairPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', repair_date: '', cost: '', provider: '' })
  const [repairFile, setRepairFile] = useState<File | null>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // 1. Créer la réparation d'abord
      const { data: repairData, error: repairError } = await supabase.from('repairs').insert({
        object_id: params.id,
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        repair_date: form.repair_date || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        provider: form.provider || null,
      }).select().single()

      if (repairError) {
        alert('Erreur lors de la sauvegarde : ' + repairError.message)
        setLoading(false)
        return
      }

      // 2. Upload la facture séparément si présente
      if (repairFile && repairData) {
        try {
          const ext = repairFile.name.split('.').pop()
          const timestamp = Date.now()
          const path = `${user.id}/${params.id}/repair_${timestamp}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from('fixpass-documents')
            .upload(path, repairFile, { upsert: true })

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('fixpass-documents')
              .getPublicUrl(path)

            await supabase.from('documents').insert({
              object_id: params.id,
              user_id: user.id,
              type: 'other',
              file_url: publicUrl,
              file_name: repairFile.name,
              mime_type: repairFile.type,
              extraction_status: 'done',
            })
          } else {
            console.error('Upload error:', uploadError)
            // On continue quand même — la réparation est sauvegardée
          }
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr)
          // On continue — la réparation est sauvegardée sans le fichier
        }
      }

      router.push(`/objects/${params.id}`)

    } catch (err) {
      console.error('Error:', err)
      alert('Une erreur est survenue. Réessayez.')
      setLoading(false)
    }
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

        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Facture de réparation</h3>
          <p className="text-xs text-gray-500">Joignez la facture ou le bon d'intervention (optionnel)</p>

          {repairFile ? (
            <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5">
              <span className="text-xl">🧾</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-teal-800 truncate">{repairFile.name}</p>
                <p className="text-xs text-teal-600">{(repairFile.size / 1024).toFixed(0)} Ko</p>
              </div>
              <button type="button" onClick={() => setRepairFile(null)}
                className="text-xs text-red-500 hover:text-red-700 font-medium">
                Supprimer
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Importer la facture</p>
                <p className="text-xs text-gray-400 mt-1">Photo JPG, PNG ou PDF</p>
              </div>
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => setRepairFile(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Enregistrement...
            </span>
          ) : 'Ajouter la réparation'}
        </button>
      </form>
    </div>
  )
}
