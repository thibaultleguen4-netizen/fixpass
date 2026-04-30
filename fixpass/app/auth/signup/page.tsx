'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center card">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h2>
          <p className="text-gray-500 text-sm">Un lien de confirmation vous a été envoyé à <strong>{email}</strong>. Cliquez dessus pour activer votre compte.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">F</div>
          <h1 className="text-2xl font-bold text-gray-900">Créer votre coffre</h1>
          <p className="text-gray-500 mt-1">Gratuit, sans carte bancaire</p>
        </div>

        <form onSubmit={handleSignup} className="card space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="label">Prénom</label>
            <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Thomas" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.fr" required />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" minLength={8} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
