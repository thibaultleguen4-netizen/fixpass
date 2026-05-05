import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-semibold text-gray-900">Mentions légales</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-8 pb-16 prose prose-sm text-gray-700">

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
          <p className="text-sm leading-relaxed">
            Le site FixPass (accessible à l'adresse fixpass-xi.vercel.app) est édité par :
          </p>
          <div className="bg-white border border-gray-100 rounded-xl p-4 mt-3 space-y-1 text-sm">
            <p><strong>LE GUEN Thibault</strong></p>
            <p>Auto-entrepreneur</p>
            <p>29200 Brest, France</p>
            <p>Email : <a href="mailto:thibaultleguen4@gmail.com" className="text-teal-600">thibaultleguen4@gmail.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">2. Hébergeur</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm space-y-1">
            <p><strong>Vercel Inc.</strong></p>
            <p>340 Pine Street, Suite 701</p>
            <p>San Francisco, CA 94104, États-Unis</p>
            <p>Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-teal-600">vercel.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">3. Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed">
            L'ensemble du contenu de ce site (textes, graphismes, logo, icônes, images, logiciels) est la propriété exclusive de LE GUEN Thibault et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, est strictement interdite sans autorisation préalable écrite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">4. Données personnelles et RGPD</h2>
          <p className="text-sm leading-relaxed mb-3">
            Conformément au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016 et à la loi Informatique et Libertés modifiée, vous disposez des droits suivants concernant vos données personnelles.
          </p>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Données collectées</h3>
          <p className="text-sm leading-relaxed mb-3">
            FixPass collecte les données suivantes dans le cadre de son service :
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mb-3">
            <li>Nom et prénom (lors de la création de compte)</li>
            <li>Adresse email (lors de la création de compte)</li>
            <li>Données relatives aux objets enregistrés (nom, marque, prix, date d'achat)</li>
            <li>Documents uploadés (factures, bons de garantie)</li>
          </ul>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Finalité du traitement</h3>
          <p className="text-sm leading-relaxed mb-3">
            Ces données sont collectées pour permettre la fourniture du service FixPass : gestion des objets personnels, suivi des garanties, estimation de revente et génération de dossiers d'assurance. Elles ne sont en aucun cas vendues, cédées ou transmises à des tiers à des fins commerciales.
          </p>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Durée de conservation</h3>
          <p className="text-sm leading-relaxed mb-3">
            Vos données sont conservées pendant toute la durée d'utilisation du service et supprimées dans un délai de 30 jours suivant la clôture de votre compte.
          </p>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Vos droits</h3>
          <p className="text-sm leading-relaxed mb-3">
            Conformément au RGPD, vous disposez des droits suivants : droit d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition au traitement de vos données. Pour exercer ces droits, contactez-nous à l'adresse : <a href="mailto:thibaultleguen4@gmail.com" className="text-teal-600">thibaultleguen4@gmail.com</a>. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
          </p>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Sous-traitants</h3>
          <p className="text-sm leading-relaxed">
            FixPass utilise les services tiers suivants pour la fourniture de son service :
          </p>
          <ul className="text-sm space-y-1 list-disc pl-5 mt-2">
            <li><strong>Supabase</strong> (base de données et authentification) — supabase.com</li>
            <li><strong>Vercel</strong> (hébergement) — vercel.com</li>
            <li><strong>OpenAI</strong> (analyse de documents par IA) — openai.com</li>
            <li><strong>Brevo</strong> (envoi d'emails transactionnels) — brevo.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">5. Cookies</h2>
          <p className="text-sm leading-relaxed mb-3">
            FixPass utilise des cookies strictement nécessaires au fonctionnement du service. Ces cookies permettent de maintenir votre session ouverte lors de votre connexion à l'application. Aucun cookie publicitaire ou de tracking n'est utilisé.
          </p>
          <p className="text-sm leading-relaxed">
            Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela empêchera le bon fonctionnement de l'application.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">6. Limitation de responsabilité</h2>
          <p className="text-sm leading-relaxed mb-3">
            Les estimations de valeur de revente fournies par FixPass sont générées par intelligence artificielle à titre indicatif uniquement. Elles ne constituent pas une expertise ou une évaluation professionnelle et ne peuvent être utilisées comme telles. LE GUEN Thibault ne saurait être tenu responsable des décisions prises sur la base de ces estimations.
          </p>
          <p className="text-sm leading-relaxed">
            FixPass s'efforce d'assurer la disponibilité et la continuité du service, mais ne garantit pas l'absence d'interruption. LE GUEN Thibault ne saurait être tenu responsable des dommages résultant d'une indisponibilité du service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">7. Droit applicable</h2>
          <p className="text-sm leading-relaxed">
            Le présent site et ses mentions légales sont soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
          Dernière mise à jour : mai 2026
        </p>
      </div>
    </div>
  )
}
