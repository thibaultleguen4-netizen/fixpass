'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Check, X } from 'lucide-react'

export default function JoinHouseholdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading' | 'confirm' | 'joining' | 'success' | 'error'>('loading')
  const [household, setHousehold] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const code = searchParams.get('code')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/auth/login?redirect=/auth/join?code=${code}`)
        return
      }

      if (!code) { setStatus('error'); setErrorMsg('Code d\'invitation manquant.'); return }

      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', code.toLowerCase())
        .single()

      if (error || !data) {
        setStatus('error')
        setErrorMsg('Ce lien d\'invitation est invalide ou a expiré.')
        return
      }

      setHousehold(data)
      setStatus('confirm')
    }
    load()
  }, [])

  const handleJoin = async () => {
    setStatus('joining')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('household_members').insert({
      household_id: household.id,
      user_id: user.id,
      role: 'member',
    })

    if (error) {
      if (error.code === '23505') {
        setStatus('success') // Déjà membre
      } else {
        setStatus('error')
        setErrorMsg('Erreur : ' + error.message)
      }
      return
    }

    setStatus('success')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">

        <div className="text-center mb-6">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
            <rect width="48" height="48" rx="14" fill="#1D9E75"/>
            <path d="M24 8 L36 13 L36 26 C36 33 30.5 38 24 40 C17.5 38 12 33 12 26 L12 13 Z" fill="white" opacity="0.95"/>
            <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">FixPass</h1>
        </div>

        {status === 'loading' && (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3 animate-pulse">🏠</div>
            <p className="text-gray-500">Vérification du lien...</p>
          </div>
        )}

        {status === 'confirm' && household && (
          <div className="card space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-semibold text-gray-900 text-lg">Invitation au foyer</p>
              <p className="text-gray-500 text-sm mt-1">Vous avez été invité à rejoindre :</p>
              <p className="text-teal-600 font-bold text-xl mt-2">"{household.name}"</p>
            </div>
            <p className="text-xs text-gray-400 text-center">
              En rejoignant ce foyer, le chef de foyer pourra voir vos objets enregistrés dans FixPass.
            </p>
            <button onClick={handleJoin} className="btn-primary w-full">
              ✅ Rejoindre le foyer
            </button>
            <Link href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-gray-600">
              Refuser l'invitation
            </Link>
          </div>
        )}

        {status === 'joining' && (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3 animate-pulse">🔗</div>
            <p className="text-gray-500">Vous rejoignez le foyer...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="card text-center py-10 space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Vous avez rejoint le foyer !</p>
            <p className="text-sm text-gray-400">Redirection vers le dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="card text-center py-10 space-y-3">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X size={32} className="text-red-600" />
            </div>
            <p className="font-semibold text-gray-900">Lien invalide</p>
            <p className="text-sm text-gray-400">{errorMsg}</p>
            <Link href="/dashboard" className="btn-primary block">
              Retour au dashboard
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
