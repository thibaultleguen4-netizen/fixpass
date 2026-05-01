'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check, X, Edit2, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [objects, setObjects] = useState<any[]>([])

  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  })

  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const meta = user.user_metadata || {}
      const fullName = meta.full_name || user.email?.split('@')[0] || ''
      const parts = fullName.split(' ')

      setProfile({
        first_name: meta.first_name || parts[0] || '',
        last_name: meta.last_name || parts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: meta.phone || '',
        address: meta.address || '',
      })

      const { data } = await supabase.from('objects').select('*')
      setObjects(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const startEdit = (field: string, value: string) => {
    setEditing(field)
    setEditValue(value)
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue('')
  }

  const saveField = async (field: string) => {
    setSaving(true)
    try {
      if (field === 'email') {
        // Mise à jour email via Supabase Auth
        const { error } = await supabase.auth.updateUser({ email: editValue })
        if (error) { alert('Erreur : ' + error.message); setSaving(false); return }
        setProfile(p => ({ ...p, email: editValue }))
        setSuccessMsg('Email mis à jour — vérifiez votre boîte mail pour confirmer.')
      } else {
        // Mise à jour métadonnées
        const newMeta: any = { ...user.user_metadata }
        newMeta[field] = editValue

        // Recalcule full_name si prénom ou nom changé
        const firstName = field === 'first_name' ? editValue : profile.first_name
        const lastName = field === 'last_name' ? editValue : profile.last_name
        newMeta.first_name = firstName
        newMeta.last_name = lastName
        newMeta.full_name = `${firstName} ${lastName}`.trim()

        const { data, error } = await supabase.auth.updateUser({ data: newMeta })
        if (error) { alert('Erreur : ' + error.message); setSaving(false); return }

        setUser(data.user)
        setProfile(p => ({ ...p, [field]: editValue }))
        setSuccessMsg('Informations mises à jour !')
      }

      setEditing(null)
      setEditValue('')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert('Erreur inattendue.')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalValue = objects.reduce((s, o) => s + (o.purchase_price || 0), 0)
  const activeWarranties = objects.filter(o => o.warranty_status === 'active').length

  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() ||
    profile.email.charAt(0).toUpperCase()

  const formatPrice = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

  const fields = [
    { key: 'first_name', label: 'Prénom', type: 'text' },
    { key: 'last_name', label: 'Nom', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Téléphone', type: 'tel' },
    { key: 'address', label: 'Adresse', type: 'text' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <path d="M24 8 L36 13 L36 26 C36 33 30.5 38 24 40 C17.5 38 12 33 12 26 L12 13 Z" fill="white" opacity="0.95"/>
              <text x="24" y="25" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-semibold text-gray-900">Mon profil</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">

        {/* Message succès */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">{successMsg}</span>
          </div>
        )}

        {/* Avatar + nom */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 bg-teal-400 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-3">
            {initials}
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Mon compte'}
          </p>
          <p className="text-sm text-gray-400 mt-1">{profile.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center">
            <p className="text-2xl font-semibold" style={{ color: '#1D9E75' }}>{objects.length}</p>
            <p className="text-xs text-gray-400 mt-1">Objets</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center">
            <p className="text-2xl font-semibold" style={{ color: '#BA7517' }}>{activeWarranties}</p>
            <p className="text-xs text-gray-400 mt-1">Garanties</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-3.5 text-center">
            <p className="text-lg font-semibold text-gray-900">{formatPrice(totalValue)}</p>
            <p className="text-xs text-gray-400 mt-1">Patrimoine</p>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Informations personnelles
          </p>
          <div className="space-y-1">
            {fields.map(f => (
              <div key={f.key}>
                {editing === f.key ? (
                  <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                      <input
                        type={f.type}
                        className="w-full text-sm text-gray-900 border border-teal-400 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveField(f.key); if (e.key === 'Escape') cancelEdit() }}
                      />
                    </div>
                    <div className="flex gap-1 flex-shrink-0 mt-4">
                      <button onClick={() => saveField(f.key)} disabled={saving}
                        className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center text-white hover:bg-teal-600">
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEdit}
                        className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs text-gray-400">{f.label}</p>
                      <p className={`text-sm mt-0.5 ${profile[f.key as keyof typeof profile] ? 'text-gray-900 font-medium' : 'text-gray-300 italic'}`}>
                        {profile[f.key as keyof typeof profile] || 'Non renseigné'}
                      </p>
                    </div>
                    <button onClick={() => startEdit(f.key, profile[f.key as keyof typeof profile])}
                      className="text-teal-600 hover:text-teal-700 p-1">
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Paramètres */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Paramètres</p>
          <div className="space-y-0">
            <Link href="/auth/reset-password"
              className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔒</span>
                <span className="text-sm text-gray-900">Changer le mot de passe</span>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <span className="text-sm text-gray-900">Alertes garanties</span>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Actives</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🌍</span>
                <span className="text-sm text-gray-900">Devise</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">EUR €</span>
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">À propos</p>
          <div className="space-y-0">
            {[
              { icon: '📄', label: 'Mentions légales', href: '#' },
              { icon: '🛡️', label: 'Politique de confidentialité', href: '#' },
              { icon: '💬', label: 'Nous contacter', href: 'mailto:contact@fixpass.fr' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-gray-900">{item.label}</span>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </a>
            ))}
          </div>
        </div>

        {/* Déconnexion */}
        <button onClick={handleLogout}
          className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl py-4 flex items-center justify-center gap-2.5 text-sm font-medium hover:bg-red-100 transition-colors">
          <LogOut size={16} />
          Se déconnecter
        </button>

      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around z-10">
        {[
          { icon: '🏠', label: 'Accueil', href: '/dashboard', active: false },
          { icon: '📦', label: 'Objets', href: '/objects', active: false },
          { icon: '📄', label: 'Scanner', href: '/scan', active: false },
          { icon: '👤', label: 'Profil', href: '/profile', active: true },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
            <span className="text-xl">{item.icon}</span>
            <span className={`text-xs ${item.active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  )
}
