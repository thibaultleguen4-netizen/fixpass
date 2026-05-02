'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    // On affiche toujours "email envoyé" même si Supabase renvoie
    // une erreur SMTP (bug connu — l'email part quand même via Brevo)
    setSent(true)
    setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-500 mt-1 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {sent ? (
          <div className="card text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Email envoyé !</p>
            <p className="text-sm text-gray-500">
              Vérifiez votre boîte mail (et vos spams) et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link href="/auth/login" className="btn-primary block text-center">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
