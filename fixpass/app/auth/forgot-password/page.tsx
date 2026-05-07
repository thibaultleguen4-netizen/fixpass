'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'done'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setError('Email introuvable. Vérifiez votre adresse.')
      setLoading(false)
      return
    }
    setStep('code')
    setLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'recovery',
    })
    if (error) {
      setError('Code incorrect ou expiré. Vérifiez et réessayez.')
      setLoading(false)
      return
    }
    setStep('password')
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
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
    setStep('done')
    setLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 'email' && 'Entrez votre email pour recevoir un code'}
            {step === 'code' && 'Entrez le code reçu par email'}
            {step === 'password' && 'Choisissez un nouveau mot de passe'}
            {step === 'done' && 'Mot de passe mis à jour !'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendCode} className="card space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
            <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="card space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <p className="text-sm text-teal-800">
                Un code a été envoyé à <strong>{email}</strong>. Copiez-le tel quel depuis l'email et collez-le ici.
              </p>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="label">Code reçu par email</label>
              <input
                className="input text-center text-2xl font-mono tracking-widest"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.trim())}
                placeholder="Coller le code ici"
                required
              />
            </div>
            <button type="submit" disabled={loading || code.length < 4} className="btn-primary w-full">
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setError('') }}
              className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 w-full">
              <ArrowLeft size={14} /> Changer d'email
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleChangePassword} className="card space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
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

        {step === 'done' && (
          <div className="card text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Mot de passe mis à jour !</p>
            <p className="text-sm text-gray-500">Redirection vers le dashboard...</p>
          </div>
        )}

      </div>
    </div>
  )
}
