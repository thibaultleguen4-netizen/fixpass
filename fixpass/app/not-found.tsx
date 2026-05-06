import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="mb-8">
        <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#1D9E75"/>
          <path d="M16 5 L24 8.5 L24 17 C24 22 20.5 25.5 16 27 C11.5 25.5 8 22 8 17 L8 8.5 Z" fill="white" opacity="0.95"/>
          <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
        </svg>
      </div>

      {/* Illustration */}
      <div className="text-7xl mb-6">📦</div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Objet introuvable
      </h1>
      <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed mb-8">
        La page que vous cherchez n'existe pas ou a été déplacée. Pas de panique — votre coffre est intact !
      </p>

      {/* Boutons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link href="/dashboard"
          className="w-full text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium transition-colors"
          style={{ background: '#1D9E75' }}>
          🏠 Retour au coffre
        </Link>
        <Link href="/scan"
          className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 flex items-center justify-center gap-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
          📄 Scanner une facture
        </Link>
      </div>

      {/* Code erreur */}
      <p className="text-gray-300 text-xs mt-12 font-mono">Erreur 404</p>

    </div>
  )
}
