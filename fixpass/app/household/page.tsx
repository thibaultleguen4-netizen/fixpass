'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Copy, Check, UserPlus, Trash2, Home, Users, UserMinus } from 'lucide-react'

export default function HouseholdPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [household, setHousehold] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await loadHousehold(user)
      setLoading(false)
    }
    load()
  }, [])

  const loadHousehold = async (currentUser: any) => {
    const { data: memberData } = await supabase
      .from('household_members')
      .select('household_id, role')
      .eq('user_id', currentUser.id)
      .single()

    if (!memberData) return

    const { data: householdData } = await supabase
      .from('households')
      .select('*')
      .eq('id', memberData.household_id)
      .single()

    if (!householdData) return
    setHousehold({ ...householdData, myRole: memberData.role })

    const { data: membersData } = await supabase
      .from('household_members')
      .select('user_id, role, joined_at')
      .eq('household_id', householdData.id)

    // Récupérer les vrais noms depuis la table profiles
    const membersWithProfiles = await Promise.all(
      (membersData || []).map(async (m) => {
        if (m.user_id === currentUser.id) {
          const meta = currentUser.user_metadata || {}
          return {
            ...m,
            name: meta.full_name || meta.first_name || currentUser.email?.split('@')[0] || 'Moi',
            email: currentUser.email,
            isMe: true,
          }
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', m.user_id)
          .single()

        return {
          ...m,
          name: profileData?.full_name || profileData?.email?.split('@')[0] || 'Membre',
          email: profileData?.email || '',
          isMe: false,
        }
      })
    )
    setMembers(membersWithProfiles)
  }

  const createHousehold = async () => {
    if (!householdName.trim()) { setErrorMsg('Donnez un nom à votre foyer.'); return }
    setCreating(true)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('households')
      .insert({ name: householdName.trim(), owner_id: user.id })
      .select()
      .single()

    if (error) { setErrorMsg('Erreur : ' + error.message); setCreating(false); return }

    await supabase.from('household_members').insert({
      household_id: data.id,
      user_id: user.id,
      role: 'owner',
    })

    setSuccessMsg('Foyer créé ! Invitez vos proches avec le code ci-dessous.')
    await loadHousehold(user)
    setCreating(false)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const joinHousehold = async () => {
    if (!inviteCode.trim()) { setErrorMsg('Entrez un code d\'invitation.'); return }
    setJoining(true)
    setErrorMsg('')

    const { data: householdData, error } = await supabase
      .from('households')
      .select('*')
      .eq('invite_code', inviteCode.trim().toLowerCase())
      .single()

    if (error || !householdData) {
      setErrorMsg('Code invalide. Vérifiez le code et réessayez.')
      setJoining(false)
      return
    }

    const { error: joinError } = await supabase
      .from('household_members')
      .insert({ household_id: householdData.id, user_id: user.id, role: 'member' })

    if (joinError) {
      setErrorMsg(joinError.code === '23505' ? 'Vous êtes déjà membre de ce foyer.' : 'Erreur : ' + joinError.message)
      setJoining(false)
      return
    }

    setSuccessMsg(`Vous avez rejoint le foyer "${householdData.name}" !`)
    await loadHousehold(user)
    setJoining(false)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const leaveHousehold = async () => {
    if (!confirm('Quitter ce foyer ?')) return
    if (household.myRole === 'owner') {
      if (!confirm('Vous êtes le chef de ce foyer. En le quittant, le foyer sera supprimé. Continuer ?')) return
      await supabase.from('households').delete().eq('id', household.id)
    } else {
      await supabase.from('household_members').delete()
        .eq('household_id', household.id)
        .eq('user_id', user.id)
    }
    setHousehold(null)
    setMembers([])
  }

  const excludeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Exclure ${memberName} du foyer ?`)) return
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', household.id)
      .eq('user_id', memberId)

    if (error) { alert('Erreur : ' + error.message); return }

    setMembers(prev => prev.filter(m => m.user_id !== memberId))
    setSuccessMsg(`${memberName} a été exclu du foyer.`)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/auth/join?code=${household.invite_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/profile" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-gray-900 flex items-center gap-2">
          <Home size={18} /> Mon foyer
        </h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 pb-24">

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <span className="text-sm text-red-700">{errorMsg}</span>
          </div>
        )}

        {household ? (
          <>
            {/* Foyer existant */}
            <div className="bg-teal-400 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏠</div>
                <div>
                  <p className="text-white font-semibold text-lg">{household.name}</p>
                  <p className="text-teal-100 text-xs">
                    {household.myRole === 'owner' ? '👑 Chef de foyer' : '👤 Membre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Membres */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users size={13} /> Membres ({members.length})
              </p>
              <div className="space-y-1">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 text-sm font-semibold flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {m.name} {m.isMe && <span className="text-gray-400 font-normal">(moi)</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m.role === 'owner' ? '👑 Chef de foyer' : '👤 Membre'}
                        {m.email && ` · ${m.email}`}
                      </p>
                    </div>
                    {/* Bouton exclure — seulement pour le chef sur les membres */}
                    {household.myRole === 'owner' && !m.isMe && m.role !== 'owner' && (
                      <button onClick={() => excludeMember(m.user_id, m.name)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                        title={`Exclure ${m.name}`}>
                        <UserMinus size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Inviter — seulement pour le chef */}
            {household.myRole === 'owner' && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus size={13} /> Inviter un membre
                </p>
                <p className="text-sm text-gray-500">Partagez ce code ou ce lien avec vos proches :</p>
                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Code d'invitation</p>
                    <p className="text-lg font-mono font-bold text-gray-900 tracking-widest uppercase">
                      {household.invite_code}
                    </p>
                  </div>
                  <button onClick={copyCode}
                    className="w-9 h-9 bg-teal-400 rounded-xl flex items-center justify-center text-white hover:bg-teal-600 transition-colors">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <button onClick={copyInviteLink}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  Copier le lien d'invitation
                </button>
              </div>
            )}

            {/* Quitter / Supprimer */}
            <button onClick={leaveHousehold}
              className="w-full bg-red-50 border border-red-200 text-red-600 rounded-2xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
              <Trash2 size={15} />
              {household.myRole === 'owner' ? 'Supprimer le foyer' : 'Quitter le foyer'}
            </button>
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-3">🏠</div>
              <p className="font-semibold text-gray-900 mb-1">Pas encore de foyer</p>
              <p className="text-sm text-gray-400">Créez un foyer pour regrouper les objets de votre famille, ou rejoignez celui d'un proche.</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Créer un foyer</p>
              <div>
                <label className="label">Nom du foyer</label>
                <input className="input" value={householdName}
                  onChange={e => setHouseholdName(e.target.value)}
                  placeholder="ex: Famille Dupont" />
              </div>
              <button onClick={createHousehold} disabled={creating} className="btn-primary w-full">
                {creating ? 'Création...' : '🏠 Créer mon foyer'}
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rejoindre un foyer</p>
              <div>
                <label className="label">Code d'invitation</label>
                <input className="input font-mono tracking-widest uppercase"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="ex: a3f9b2" />
              </div>
              <button onClick={joinHousehold} disabled={joining} className="btn-secondary w-full">
                {joining ? 'Vérification...' : '🔗 Rejoindre le foyer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
