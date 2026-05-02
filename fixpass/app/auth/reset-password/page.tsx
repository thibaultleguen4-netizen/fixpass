'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase envoie le token dans le hash de l'URL
    // On écoute l'événement PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Vérifier si on a déjà une session active via le hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-4">
            <rect width="48" height="48" rx="14" fill="#1D9E75"/>
            <path d="M24 8 L36 13 L36 26 C36 33 30.5 38 24 40 C17.5 38 12 33 12 26 L12 13 Z" fill="white" opacity="0.95"/>
            <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-500 mt-1 text-sm">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        {done ? (
          <div className="card text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Mot de passe mis à jour !</p>
            <p className="text-sm text-gray-500">Redirection vers le dashboard...</p>
          </div>
        ) : !ready ? (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3 animate-pulse">🔒</div>
            <p className="text-gray-500 text-sm">Vérification du lien en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input className="input" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
