import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-semibold text-gray-900">FixPass</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Connexion
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-sm px-3 py-1 rounded-full mb-6">
          <span>🆕</span> Version bêta disponible
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Le carnet de santé intelligent<br />de tous vos objets
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          Scannez vos factures. FixPass retrouve vos garanties, estime vos objets et prépare leur revente.
        </p>
        <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-block">
          Créer mon coffre FixPass
        </Link>
        <p className="text-sm text-gray-400 mt-3">Gratuit · Sans carte bancaire</p>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '📄', title: 'Scannez vos factures', desc: 'Importez une photo ou un PDF. L\'IA extrait automatiquement toutes les informations.' },
            { emoji: '🛡️', title: 'Suivez vos garanties', desc: 'Recevez une alerte avant l\'expiration. Ne ratez plus jamais une garantie.' },
            { emoji: '💶', title: 'Estimez la revente', desc: 'Obtenez une estimation de revente et générez une annonce en un clic.' },
          ].map((f) => (
            <div key={f.title} className="card text-center">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
