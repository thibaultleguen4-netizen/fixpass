'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ScanLine, Shield, TrendingUp, AlertTriangle, FileText, CheckCircle } from 'lucide-react'

const DEMO_STEPS = [
  'scan',
  'extracted',
  'dashboard',
  'warranty',
  'resale',
  'sinistre',
  'cta',
]

const DEMO_OBJECT = {
  name: 'iPhone 14 Pro 256Go',
  brand: 'Apple',
  model: 'A2890',
  category: 'Téléphone',
  purchase_date: '2023-03-15',
  purchase_price: 1129,
  seller: 'Apple Store',
  warranty_months: 24,
  warranty_end: '2025-03-15',
  serial_number: 'F2LXQ3MNPQ',
  condition: 'Bon état',
  resale_min: 580,
  resale_recommended: 650,
  resale_max: 720,
}

export default function DemoPage() {
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)

  const next = () => setStep(s => Math.min(s + 1, DEMO_STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); next() }, 2500)
  }

  const currentStep = DEMO_STEPS[step]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">F</div>
            <span className="font-semibold text-gray-900">Démo interactive</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{step + 1}/{DEMO_STEPS.length}</span>
          <div className="flex gap-1">
            {DEMO_STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-teal-400' : i < step ? 'w-1.5 bg-teal-200' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Étape 1 — Scanner */}
        {currentStep === 'scan' && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">Étape 1</p>
              <h2 className="text-xl font-bold text-gray-900">Scannez votre facture</h2>
              <p className="text-sm text-gray-500 mt-1">Importez une photo ou un PDF — l'IA extrait tout automatiquement.</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <span className="text-sm">👋</span>
              <p className="text-xs text-yellow-700">Ceci est une <strong>démo simulée</strong> — aucun compte requis. Les données sont fictives.</p>
            </div>
            {scanning ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4 animate-pulse">🔍</div>
                <p className="font-semibold text-gray-900">Analyse IA en cours...</p>
                <p className="text-sm text-gray-500 mt-2">L'IA lit votre facture iPhone...</p>
                <div className="mt-4 w-48 mx-auto bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-teal-400 animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-teal-400 hover:bg-teal-50 transition-colors cursor-pointer" onClick={handleScan}>
                  <ScanLine size={32} className="mx-auto text-gray-400 mb-3" />
                  <p className="font-medium text-gray-700">Cliquez pour simuler un scan</p>
                  <p className="text-sm text-gray-400 mt-1">Facture iPhone 14 Pro</p>
                </div>
                <button onClick={handleScan} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  <ScanLine size={18} /> Simuler le scan de facture
                </button>
              </div>
            )}
          </div>
        )}

        {/* Étape 2 — Données extraites */}
        {currentStep === 'extracted' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">Étape 2</p>
              <h2 className="text-xl font-bold text-gray-900">Données extraites automatiquement</h2>
              <p className="text-sm text-gray-500 mt-1">L'IA a tout extrait de votre facture en quelques secondes.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">Analyse terminée — 10 champs extraits avec succès</span>
            </div>
            <div className="card space-y-3">
              {[
                { label: 'Produit', value: DEMO_OBJECT.name },
                { label: 'Marque', value: DEMO_OBJECT.brand },
                { label: 'Modèle', value: DEMO_OBJECT.model },
                { label: 'Date d\'achat', value: '15 mars 2023' },
                { label: 'Prix d\'achat', value: `${DEMO_OBJECT.purchase_price} €` },
                { label: 'Vendeur', value: DEMO_OBJECT.seller },
                { label: 'N° de série', value: DEMO_OBJECT.serial_number },
                { label: 'Garantie', value: `${DEMO_OBJECT.warranty_months} mois` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-sm text-blue-800 font-medium">✨ Type d'achat détecté : Neuf</p>
              <p className="text-xs text-blue-600 mt-1">L'estimation de revente sera calculée en conséquence.</p>
            </div>
          </div>
        )}

        {/* Étape 3 — Dashboard */}
        {currentStep === 'dashboard' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">Étape 3</p>
              <h2 className="text-xl font-bold text-gray-900">Votre coffre FixPass</h2>
              <p className="text-sm text-gray-500 mt-1">Tous vos objets centralisés avec leur valeur en temps réel.</p>
            </div>
            <div className="bg-teal-400 rounded-2xl p-5">
              <p className="text-teal-100 text-xs mb-1">Valeur de revente estimée</p>
              <p className="text-white text-4xl font-semibold">4 230 €</p>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-teal-100 text-xs">5 objets · Acheté 6 840 €</p>
                <p className="text-teal-100 text-xs font-medium">-38% dépréciation</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-3.5 text-center">
                <p className="text-2xl font-semibold text-gray-900">5</p>
                <p className="text-xs text-gray-400 mt-1">Objets</p>
              </div>
              <div className="card p-3.5 text-center">
                <p className="text-2xl font-semibold" style={{ color: '#1D9E75' }}>4</p>
                <p className="text-xs text-gray-400 mt-1">Garanties</p>
              </div>
              <div className="card p-3.5 text-center">
                <p className="text-2xl font-semibold" style={{ color: '#EF9F27' }}>78</p>
                <p className="text-xs text-gray-400 mt-1">Score</p>
              </div>
            </div>
            <div className="card space-y-2">
              {[
                { emoji: '📱', name: 'iPhone 14 Pro 256Go', meta: 'Apple · 1 129 €', status: 'active', badge: 'Active' },
                { emoji: '💻', name: 'MacBook Pro M3', meta: 'Apple · 2 199 €', status: 'warn', badge: '28 jours' },
                { emoji: '🚲', name: 'Vélo électrique', meta: 'Decathlon · 799 €', status: 'active', badge: 'Active' },
                { emoji: '📷', name: 'Sony A7 IV', meta: 'Sony · 2 799 €', status: 'expired', badge: 'Expirée' },
              ].map((o, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">{o.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{o.name}</p>
                    <p className="text-xs text-gray-400">{o.meta}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    o.status === 'active' ? 'bg-green-100 text-green-700' :
                    o.status === 'warn' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{o.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Étape 4 — Garanties */}
        {currentStep === 'warranty' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">Étape 4</p>
              <h2 className="text-xl font-bold text-gray-900">Alertes de garantie</h2>
              <p className="text-sm text-gray-500 mt-1">FixPass vous alerte avant l'expiration — et vous conseille de vendre.</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">MacBook Pro M3 — Garantie dans 28 jours</p>
                  <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                    Votre MacBook Pro M3 est estimé à <strong>1 450 €</strong> sur le marché. Tant que la garantie est active, vous pouvez rassurer l'acheteur — ce qui justifie un meilleur prix. Dans 28 jours, la revente sera plus difficile.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <div className="bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg text-xs font-medium">💰 Vendre maintenant — 1 450 €</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Prochaines expirations</p>
              {[
                { name: 'MacBook Pro M3', days: 28, pct: 8 },
                { name: 'iPhone 14 Pro', days: 142, pct: 39 },
                { name: 'Vélo électrique', days: 285, pct: 78 },
              ].map(o => (
                <div key={o.name} className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{o.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{
                      width: `${o.pct}%`,
                      background: o.days <= 30 ? '#E24B4A' : o.days <= 90 ? '#EF9F27' : '#1D9E75'
                    }} />
                  </div>
                  <span className="text-xs font-medium w-12 text-right" style={{
                    color: o.days <= 30 ? '#E24B4A' : o.days <= 90 ? '#BA7517' : '#1D9E75'
                  }}>{o.days} j</span>
                </div>
              ))}
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
              <p className="text-sm text-teal-800 font-medium">📧 Emails automatiques</p>
              <p className="text-xs text-teal-600 mt-1">FixPass vous envoie des alertes 28j, 7j et 1j avant expiration — avec le prix de revente estimé.</p>
            </div>
          </div>
        )}

        {/* Étape 5 — Estimation revente */}
        {currentStep === 'resale' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-1">Étape 5</p>
              <h2 className="text-xl font-bold text-gray-900">Estimation de revente IA</h2>
              <p className="text-sm text-gray-500 mt-1">Prix réalistes basés sur le marché français actuel.</p>
            </div>
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">📱</div>
                <div>
                  <p className="font-semibold text-gray-900">{DEMO_OBJECT.name}</p>
                  <p className="text-xs text-gray-400">Acheté 1 129 € · {DEMO_OBJECT.condition}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Vente rapide', value: DEMO_OBJECT.resale_min, highlight: false },
                  { label: 'Recommandé', value: DEMO_OBJECT.resale_recommended, highlight: true },
                  { label: 'Ambitieux', value: DEMO_OBJECT.resale_max, highlight: false },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`rounded-xl p-3 text-center ${highlight ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-bold ${highlight ? 'text-teal-700' : 'text-gray-900'}`}>{value} €</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic mb-3">iPhone 14 Pro 256Go en bon état se vend entre 580€ et 720€ sur Leboncoin et Back Market en mai 2026.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-400">Vendre sur :</span>
                {['Leboncoin', 'Back Market', 'eBay France'].map(p => (
                  <span key={p} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
            <div className="card space-y-2">
              <p className="text-xs font-medium text-gray-900">Annonce générée automatiquement</p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                📱 <strong>iPhone 14 Pro 256Go — 650 €</strong><br/><br/>
                Vends iPhone 14 Pro 256Go couleur Noir Sidéral, acheté neuf chez Apple Store en mars 2023. Très bon état, quelques micro-rayures légères invisibles à l'utilisation.<br/><br/>
                ✅ Garantie Apple valide jusqu'en mars 2025<br/>
                ✅ Numéro de série : F2LXQ3MNPQ<br/>
                ✅ Facture d'achat disponible<br/><br/>
                Prix ferme : 650 €. Remise en main propre Paris ou envoi suivi.
              </div>
            </div>
          </div>
        )}

        {/* Étape 6 — Mode sinistre */}
        {currentStep === 'sinistre' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Étape 6</p>
              <h2 className="text-xl font-bold text-gray-900">Mode sinistre</h2>
              <p className="text-sm text-gray-500 mt-1">En cas de vol ou sinistre, générez votre dossier assurance en 30 secondes.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-red-800 mb-1">🚨 Dossier d'urgence assurance</p>
              <p className="text-xs text-red-600 leading-relaxed">Le PDF généré contient l'inventaire complet avec numéros de série, QR codes vers les factures et valeurs de remplacement.</p>
            </div>
            <div className="card space-y-3">
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500">Objets déclarés</span>
                <span className="font-medium text-gray-900">5 objets</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500">Valeur d'achat totale</span>
                <span className="font-medium text-red-600">6 840 €</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500">Valeur de remplacement</span>
                <span className="font-medium text-teal-600">4 230 €</span>
              </div>
              <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500">QR codes factures</span>
                <span className="font-medium text-teal-600">4 / 5</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-500">Numéros de série</span>
                <span className="font-medium text-gray-900">5 / 5</span>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-4 text-center border-2 border-dashed border-gray-300">
              <FileText size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Aperçu du dossier PDF</p>
              <p className="text-xs text-gray-400 mt-1">Inventaire · QR codes · Numéros de série · Valeurs</p>
            </div>
            <div style={{ background: '#E24B4A' }} className="w-full text-white rounded-2xl py-4 flex items-center justify-center gap-2.5 text-base font-medium opacity-60 cursor-not-allowed">
              <AlertTriangle size={18} /> Générer le dossier PDF (démo)
            </div>
            <p className="text-xs text-gray-400 text-center">La génération réelle est disponible après création de compte.</p>
          </div>
        )}

        {/* Étape 7 — CTA */}
        {currentStep === 'cta' && (
          <div className="space-y-6 text-center">
            <div className="text-5xl">🎉</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Vous avez vu l'essentiel !</h2>
              <p className="text-gray-500 leading-relaxed">
                FixPass gère vos garanties, estime la valeur de vos objets et prépare vos dossiers sinistres. Tout ça gratuitement.
              </p>
            </div>
            <div className="card space-y-3 text-left">
              {[
                '✅ Scan IA de vos factures en quelques secondes',
                '✅ Alertes avant expiration de garantie',
                '✅ Estimation de revente sur le marché français',
                '✅ Dossier sinistre en 30 secondes',
                '✅ Mode foyer pour toute la famille',
                '✅ 100% gratuit, sans carte bancaire',
              ].map(f => (
                <p key={f} className="text-sm text-gray-700">{f}</p>
              ))}
            </div>
            <div className="space-y-3">
              <Link href="/auth/signup" className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
                Créer mon coffre gratuitement →
              </Link>
              <Link href="/" className="block text-sm text-gray-400 hover:text-gray-600">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Navigation */}
      {currentStep !== 'cta' && currentStep !== 'scan' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-lg mx-auto flex gap-3">
            <button onClick={prev} className="btn-secondary flex items-center gap-2 px-5">
              <ArrowLeft size={16} /> Précédent
            </button>
            <button onClick={next} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'scan' && !scanning && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-lg mx-auto">
            <Link href="/auth/signup" className="block text-center text-sm text-gray-400 hover:text-teal-600">
              Passer la démo → Créer mon compte
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
