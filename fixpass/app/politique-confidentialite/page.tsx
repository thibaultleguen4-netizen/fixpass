import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/profile" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-gray-900">Politique de confidentialité</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8 pb-16 text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm space-y-1">
            <p><strong>LE GUEN Thibault</strong> — Auto-entrepreneur</p>
            <p>29200 Brest, France</p>
            <p>Email : <a href="mailto:thibaultleguen4@gmail.com" className="text-teal-600">thibaultleguen4@gmail.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">2. Données collectées</h2>
          <p className="text-sm leading-relaxed mb-3">Dans le cadre de l'utilisation de FixPass, nous collectons les données suivantes :</p>
          <div className="space-y-3">
            {[
              { title: 'Données de compte', desc: 'Nom, prénom, adresse email — nécessaires à la création et gestion de votre compte.' },
              { title: 'Données des objets', desc: 'Informations sur vos objets personnels : nom, marque, prix d\'achat, date d\'achat, numéro de série, vendeur.' },
              { title: 'Documents uploadés', desc: 'Factures et bons de garantie que vous importez dans l\'application.' },
              { title: 'Données de connexion', desc: 'Adresse IP, type de navigateur, horodatage des connexions — collectées automatiquement pour la sécurité du service.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
          <p className="text-sm leading-relaxed mb-3">Vos données sont utilisées pour :</p>
          <ul className="text-sm space-y-2 text-gray-600">
            <li className="flex gap-2"><span className="text-teal-500 flex-shrink-0">•</span>Fournir le service FixPass — gestion de vos objets, suivi des garanties, estimation de revente</li>
            <li className="flex gap-2"><span className="text-teal-500 flex-shrink-0">•</span>Vous envoyer des alertes email sur l'expiration de vos garanties</li>
            <li className="flex gap-2"><span className="text-teal-500 flex-shrink-0">•</span>Générer des dossiers d'assurance en cas de sinistre</li>
            <li className="flex gap-2"><span className="text-teal-500 flex-shrink-0">•</span>Assurer la sécurité et le bon fonctionnement du service</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3 text-gray-600">Vos données ne sont <strong>jamais vendues</strong> ni transmises à des tiers à des fins commerciales.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">4. Base légale du traitement</h2>
          <p className="text-sm leading-relaxed">Le traitement de vos données repose sur l'exécution du contrat de service (CGU) que vous acceptez lors de votre inscription. Les alertes email reposent sur votre consentement explicite lors de l'activation du service.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">5. Sous-traitants</h2>
          <p className="text-sm leading-relaxed mb-3">FixPass fait appel aux prestataires suivants, chacun soumis à des obligations de confidentialité strictes :</p>
          <div className="space-y-2">
            {[
              { name: 'Supabase', role: 'Base de données et authentification', url: 'supabase.com' },
              { name: 'Vercel', role: 'Hébergement de l\'application', url: 'vercel.com' },
              { name: 'OpenAI', role: 'Analyse des factures par intelligence artificielle', url: 'openai.com' },
              { name: 'Brevo', role: 'Envoi des emails transactionnels', url: 'brevo.com' },
            ].map(s => (
              <div key={s.name} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.role}</p>
                </div>
                <span className="text-xs text-gray-400">{s.url}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">6. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">Vos données sont conservées pendant toute la durée d'utilisation du service FixPass. En cas de suppression de votre compte, toutes vos données personnelles sont effacées dans un délai de 30 jours. Les documents uploadés (factures) sont supprimés immédiatement.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">7. Vos droits</h2>
          <p className="text-sm leading-relaxed mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { right: 'Accès', desc: 'Obtenir une copie de vos données' },
              { right: 'Rectification', desc: 'Corriger vos données inexactes' },
              { right: 'Effacement', desc: 'Supprimer vos données' },
              { right: 'Portabilité', desc: 'Exporter vos données' },
              { right: 'Opposition', desc: 'Vous opposer au traitement' },
              { right: 'Limitation', desc: 'Limiter le traitement' },
            ].map(r => (
              <div key={r.right} className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900">{r.right}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">Pour exercer ces droits, contactez-nous à <a href="mailto:thibaultleguen4@gmail.com" className="text-teal-600">thibaultleguen4@gmail.com</a>. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-teal-600">CNIL</a>.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">8. Cookies</h2>
          <p className="text-sm leading-relaxed">FixPass utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service (maintien de votre session de connexion). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">9. Sécurité</h2>
          <p className="text-sm leading-relaxed">Vos données sont stockées de manière sécurisée sur les serveurs Supabase avec chiffrement en transit (HTTPS) et au repos. L'accès à vos données est protégé par authentification et les règles de sécurité (RLS) de Supabase garantissent que vous ne pouvez accéder qu'à vos propres données.</p>
        </section>

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
          Dernière mise à jour : mai 2026
        </p>
      </div>
    </div>
  )
}
