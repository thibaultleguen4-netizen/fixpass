'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ObjectItem, Repair } from '@/lib/types'
import { formatPrice, formatDate, getCategoryEmoji, daysUntilExpiry } from '@/lib/utils'
import { WARRANTY_LABELS, WARRANTY_COLORS } from '@/lib/types'
import { ArrowLeft, Trash2, Edit, Plus, FileText, Wrench } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function ObjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [obj, setObj] = useState<ObjectItem | null>(null)
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [annonce, setAnnonce] = useState('')
  const [generatingAnnonce, setGeneratingAnnonce] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: objData } = await supabase.from('objects').select('*').eq('id', params.id).single()
      if (!objData) { router.push('/dashboard'); return }
      setObj(objData)
      const { data: repairData } = await supabase.from('repairs').select('*').eq('object_id', params.id).order('repair_date', { ascending: false })
      setRepairs(repairData || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Supprimer cet objet définitivement ?')) return
    await supabase.from('objects').delete().eq('id', params.id)
    router.push('/dashboard')
  }

  const generateAnnonce = async () => {
    if (!obj) return
    setGeneratingAnnonce(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-annonce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ object: obj }),
      })
      const data = await res.json()
      setAnnonce(data.annonce)
    } catch {
      setAnnonce('Erreur lors de la génération. Réessayez.')
    }
    setGeneratingAnnonce(false)
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
          <Link href={`/objects/${obj.id}/edit`} className="text-gray-400 hover:text-gray-600"><Edit size={18} /></Link>
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
              <p className="text-gray-500 text-sm mt-0.5">
                {[obj.brand, obj.model].filter(Boolean).join(' · ')}
              </p>
              <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${WARRANTY_COLORS[obj.warranty_status || 'unknown']}`}>
                {WARRANTY_LABELS[obj.warranty_status || 'unknown']}
                {daysLeft !== null && daysLeft > 0 && ` · ${daysLeft} jours restants`}
              </span>
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

        {obj.resale_recommended && (
          <div className="card space-y-2">
            <h3 className="font-semibold text-gray-900 text-sm">Estimation de revente</h3>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                ['Vente rapide', obj.resale_min, false],
                ['Recommandé', obj.resale_recommended, true],
                ['Ambitieux', obj.resale_max, false],
              ].map(([label, val, highlight]) => (
                <div key={label as string} className={`rounded-xl p-3 text-center ${highlight ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'}`}>
                  <div className={`text-lg font-bold ${highlight ? 'text-teal-700' : 'text-gray-900'}`}>
                    {formatPrice(val as number)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{label as string}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <FileText size={16} /> Annonce de revente
          </h3>
          {annonce ? (
            <div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-3 font-sans">{annonce}</pre>
              <button onClick={() => { navigator.clipboard.writeText(annonce) }}
                className="btn-secondary w-full mt-2 text-sm">
                Copier l'annonce
              </button>
            </div>
          ) : (
            <button onClick={generateAnnonce} disabled={generatingAnnonce} className="btn-primary w-full">
              {generatingAnnonce ? 'Génération en cours...' : '✨ Générer une annonce IA'}
            </button>
          )}
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Wrench size={16} /> Historique réparations
            </h3>
            <Link href={`/objects/${obj.id}/repair`} className="text-teal-600 text-xs font-medium flex items-center gap-1 hover:underline">
              <Plus size={12} /> Ajouter
            </Link>
          </div>
          {repairs.length === 0 ? (
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
