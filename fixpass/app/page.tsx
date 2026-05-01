import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-semibold text-gray-900 text-lg">FixPass</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Connexion
            </Link>
            <Link href="/auth/signup" className="bg-teal-400 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
          Version bêta disponible
        </div>
        <h1 className="text-5xl font-medium text-gray-900 leading-tight tracking-tight mb-6">
          Le carnet de santé<br />
          de vos <span className="text-teal-400">objets</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
          Scannez vos factures, suivez vos garanties, estimez la valeur de vos objets et préparez leur revente.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth/signup" className="bg-teal-400 hover:bg-teal-600 text-white text-base font-medium px-8 py-3.5 rounded-xl transition-colors">
            Créer mon coffre gratuit
          </Link>
          <Link href="/auth/login" className="text-gray-500 hover:text-gray-900 text-base px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            Se connecter
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Gratuit · Sans carte bancaire · 2 minutes pour commencer</p>
      </section>

      {/* App mockup */}
      <section className="px-6 pb-20 max-w-2xl mx-auto">
        <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            {/* App header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-400 rounded-md flex items-center justify-center text-white text-xs font-bold">F</div>
                <span className="text-sm font-semibold text-gray-900">FixPass</span>
              </div>
              <span className="text-xs text-gray-400">Thomas</span>
            </div>
            {/* App body */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Patrimoine estimé', value: '4 230 €' },
                  { label: 'Garanties actives', value: '8' },
                  { label: 'Factures sauvegardées', value: '12' },
                  { label: 'Revente estimée', value: '1 850 €' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                    <p className="text-xl font-medium text-gray-900">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-teal-400 text-white text-sm font-medium rounded-xl py-3 text-center mb-4">
                Scanner une facture
              </div>
              <div className="space-y-0">
                {[
                  { emoji: '📱', name: 'iPhone 14', meta: 'Apple · 899 €', status: 'active' },
                  { emoji: '💻', name: 'MacBook Pro M3', meta: 'Apple · 2 199 €', status: 'warn' },
                  { emoji: '🚲', name: 'Vélo Btwin', meta: 'Decathlon · 799 €', status: 'active' },
                ].map((o, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{o.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.meta}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      o.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.status === 'active' ? 'Active' : '28 jours'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="h-px bg-gray-100"></div>
      </div>

      {/* Steps */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Comment ça marche</p>
          <h2 className="text-3xl font-medium text-gray-900">Trois étapes, c'est tout</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Scannez', desc: 'Photo ou PDF de votre facture. L\'IA extrait toutes les informations automatiquement.' },
            { num: '2', title: 'Confirmez', desc: 'Vérifiez les données extraites et validez en un clic. Corrigez si besoin.' },
            { num: '3', title: 'Suivez', desc: 'Garanties, valeur de revente, réparabilité — tout est centralisé dans votre coffre.' },
          ].map(s => (
            <div key={s.num} className="text-center">
              <div className="w-10 h-10 bg-teal-400 text-white rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-4">{s.num}</div>
              <h3 className="text-base font-medium text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <div className="h-px bg-gray-100"></div>
      </div>

      {/* Features */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Fonctionnalités</p>
          <h2 className="text-3xl font-medium text-gray-900">Tout ce dont vous avez besoin</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: '📄', bg: 'bg-teal-50', title: 'Scan IA', desc: 'Extraction automatique depuis vos factures photo ou PDF.' },
            { emoji: '🛡️', bg: 'bg-green-50', title: 'Garanties', desc: 'Alertes avant expiration, extensions de garantie détectées.' },
            { emoji: '💶', bg: 'bg-yellow-50', title: 'Revente', desc: 'Estimation IA basée sur les prix du marché français.' },
            { emoji: '🔧', bg: 'bg-blue-50', title: 'Réparabilité', desc: 'Score officiel adapté à chaque type d\'objet.' },
            { emoji: '📎', bg: 'bg-purple-50', title: 'Documents', desc: 'Toutes vos factures stockées et téléchargeables.' },
            { emoji: '✍️', bg: 'bg-pink-50', title: 'Annonces', desc: 'Annonce de revente générée automatiquement.' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-xl mb-4`}>{f.emoji}</div>
              <h3 className="text-sm font-medium text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="bg-teal-400 rounded-3xl px-8 py-14 text-center">
          <h2 className="text-3xl font-medium text-white mb-3">Prêt à organiser vos objets ?</h2>
          <p className="text-teal-100 text-lg mb-8">Gratuit · Sans carte bancaire · 2 minutes pour commencer</p>
          <Link href="/auth/signup" className="bg-white text-teal-700 hover:bg-teal-50 text-base font-medium px-10 py-3.5 rounded-xl transition-colors inline-block">
            Créer mon coffre FixPass
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-400 rounded-md flex items-center justify-center text-white text-xs font-bold">F</div>
            <span className="text-sm text-gray-400">FixPass</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 FixPass — Le carnet de santé de vos objets</p>
        </div>
      </footer>

    </main>
  )
}
