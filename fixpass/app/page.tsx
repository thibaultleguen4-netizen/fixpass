'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true)
    }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

function AnimatedNumber({ target, suffix = '' }: { target: number, suffix?: string }) {
  const [current, setCurrent] = useState(0)
  const { ref, inView } = useInView()
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCurrent(target); clearInterval(timer) }
      else setCurrent(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{current.toLocaleString('fr-FR')}{suffix}</span>
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #1D9E75, #0EA5E9, #1D9E75);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .float-card {
          animation: float 4s ease-in-out infinite;
        }
        .hero-badge {
          animation: fadeInDown 0.8s ease forwards;
        }
        .hero-title {
          animation: fadeInDown 0.8s ease 0.2s both;
        }
        .hero-subtitle {
          animation: fadeInDown 0.8s ease 0.4s both;
        }
        .hero-cta {
          animation: fadeInDown 0.8s ease 0.6s both;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #1D9E75;
          animation: pulse-ring 2s ease-out infinite;
        }
        .card-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(29, 158, 117, 0.12);
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -75%;
          width: 50%;
          height: 200%;
          background: rgba(255,255,255,0.2);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .btn-shine:hover::after {
          left: 125%;
        }
      `}</style>

      {/* Header */}
      <header className={`sticky top-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1D9E75"/>
              <path d="M16 5 L24 8.5 L24 17 C24 22 20.5 25.5 16 27 C11.5 25.5 8 22 8 17 L8 8.5 Z" fill="white" opacity="0.95"/>
              <text x="16" y="17" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#1D9E75" fontFamily="Arial">F</text>
            </svg>
            <span className="font-semibold text-gray-900 text-lg">FixPass</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">Connexion</Link>
            <Link href="/auth/signup" className="btn-shine bg-teal-400 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto relative">
        {/* Cercles décoratifs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60 -z-10" />

        <div className="hero-badge inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="pulse-dot relative w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
          Version bêta disponible
        </div>

        <h1 className="hero-title text-5xl font-medium text-gray-900 leading-tight tracking-tight mb-6">
          Ne perdez plus jamais<br />
          une <span className="gradient-text">garantie.</span>
        </h1>

        <p className="hero-subtitle text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
          Photographiez votre facture. FixPass extrait tout, calcule la garantie et vous alerte avant qu'elle expire. En cas de sinistre, votre dossier complet est prêt en 1 clic.
        </p>

        <div className="hero-cta flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth/signup" className="btn-shine bg-teal-400 hover:bg-teal-600 text-white text-base font-medium px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-200">
            Créer mon coffre gratuit
          </Link>
          <Link href="/demo" className="text-teal-600 hover:text-teal-700 text-base font-medium px-8 py-3.5 rounded-xl border border-teal-200 hover:border-teal-300 bg-teal-50 transition-colors flex items-center gap-2">
            ▶ Voir la démo
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4 hero-subtitle">Gratuit · Sans carte bancaire · 2 minutes pour commencer</p>
      </section>

      {/* Stats animées */}
      <FadeIn className="px-6 pb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 2, suffix: 'min', label: 'pour commencer' },
            { value: 100, suffix: '%', label: 'gratuit' },
            { value: 30, suffix: 's', label: 'pour le dossier sinistre' },
          ].map((s, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-2xl py-5 px-3">
              <p className="text-3xl font-bold text-teal-500">
                <AnimatedNumber target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* App mockup flottant */}
      <FadeIn className="px-6 pb-20 max-w-2xl mx-auto">
        <div className="float-card bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-xl shadow-gray-100">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-400 rounded-md flex items-center justify-center text-white text-xs font-bold">F</div>
                <span className="text-sm font-semibold text-gray-900">FixPass</span>
              </div>
              <span className="text-xs text-gray-400">Thomas</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Patrimoine estimé', value: '4 230 €', color: 'text-teal-600' },
                  { label: 'Garanties actives', value: '8', color: 'text-gray-900' },
                  { label: 'Factures sauvegardées', value: '12', color: 'text-gray-900' },
                  { label: 'Revente estimée', value: '1 850 €', color: 'text-orange-500' },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                    <p className={`text-xl font-medium ${m.color}`}>{m.value}</p>
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
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${o.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {o.status === 'active' ? 'Active' : '28 jours'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6 mb-20"><div className="h-px bg-gray-100"></div></div>

      {/* Steps */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Comment ça marche</p>
          <h2 className="text-3xl font-medium text-gray-900">Trois étapes, c'est tout</h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Scannez', desc: "Photo ou PDF de votre facture. L'IA extrait toutes les informations automatiquement.", delay: 0 },
            { num: '2', title: 'Confirmez', desc: 'Vérifiez les données extraites et validez en un clic. Corrigez si besoin.', delay: 150 },
            { num: '3', title: 'Suivez', desc: 'Garanties, valeur de revente, réparabilité — tout est centralisé dans votre coffre.', delay: 300 },
          ].map(s => (
            <FadeIn key={s.num} delay={s.delay} className="text-center card-hover bg-white border border-gray-100 rounded-2xl p-6">
              <div className="w-10 h-10 bg-teal-400 text-white rounded-full flex items-center justify-center text-sm font-medium mx-auto mb-4 shadow-lg shadow-teal-200">{s.num}</div>
              <h3 className="text-base font-medium text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6 mb-20"><div className="h-px bg-gray-100"></div></div>

      {/* Features */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Fonctionnalités</p>
          <h2 className="text-3xl font-medium text-gray-900">Tout ce dont vous avez besoin</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: '📄', bg: 'bg-teal-50', title: 'Scan IA', desc: "Extraction automatique depuis vos factures photo ou PDF.", delay: 0 },
            { emoji: '🛡️', bg: 'bg-green-50', title: 'Garanties', desc: 'Alertes avant expiration, extensions de garantie détectées.', delay: 100 },
            { emoji: '💶', bg: 'bg-yellow-50', title: 'Revente', desc: 'Estimation IA basée sur les prix du marché français.', delay: 200 },
            { emoji: '🔧', bg: 'bg-blue-50', title: 'Réparabilité', desc: "Score adapté à chaque type d'objet.", delay: 300 },
            { emoji: '📎', bg: 'bg-purple-50', title: 'Documents', desc: 'Toutes vos factures stockées et téléchargeables.', delay: 400 },
            { emoji: '🚨', bg: 'bg-red-50', title: 'Mode sinistre', desc: 'Dossier assurance complet généré en 30 secondes.', delay: 500 },
          ].map(f => (
            <FadeIn key={f.title} delay={f.delay}>
              <div className="card-hover bg-white border border-gray-100 rounded-2xl p-5 h-full">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-xl mb-4`}>{f.emoji}</div>
                <h3 className="text-sm font-medium text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <FadeIn className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="card-hover bg-gray-50 border border-gray-100 rounded-3xl px-8 py-12 text-center">
          <div className="text-4xl mb-4">▶</div>
          <h2 className="text-2xl font-medium text-gray-900 mb-3">Essayez sans créer de compte</h2>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
            Découvrez en 2 minutes comment FixPass peut vous aider à gérer vos objets, suivre vos garanties et préparer vos reventes.
          </p>
          <Link href="/demo" className="btn-shine bg-teal-400 hover:bg-teal-600 text-white text-base font-medium px-10 py-3.5 rounded-xl transition-colors inline-block">
            Voir la démo interactive →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Aucune inscription requise</p>
        </div>
      </FadeIn>

      {/* CTA final */}
      <FadeIn className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="rounded-3xl px-8 py-14 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1D9E75, #0D6B52)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <h2 className="text-3xl font-medium text-white mb-3 relative">Prêt à organiser vos objets ?</h2>
          <p className="text-teal-100 text-lg mb-8 relative">Gratuit · Sans carte bancaire · 2 minutes pour commencer</p>
          <Link href="/auth/signup" className="btn-shine bg-white text-teal-700 hover:bg-teal-50 text-base font-medium px-10 py-3.5 rounded-xl transition-colors inline-block relative shadow-lg">
            Créer mon coffre FixPass
          </Link>
        </div>
      </FadeIn>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-400 rounded-md flex items-center justify-center text-white text-xs font-bold">F</div>
            <span className="text-sm text-gray-400">FixPass</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 FixPass — Ne perdez plus jamais une garantie</p>
        </div>
      </footer>

    </main>
  )
}
