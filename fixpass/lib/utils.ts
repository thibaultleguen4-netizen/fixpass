import { differenceInDays, parseISO, addMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { WarrantyStatus } from './types'

export function computeWarrantyEndDate(
  purchaseDate: string,
  warrantyMonths: number,
  extendedMonths: number = 0
): string {
  const date = parseISO(purchaseDate)
  const totalMonths = warrantyMonths + extendedMonths
  return addMonths(date, totalMonths).toISOString().split('T')[0]
}

export function computeWarrantyStatus(warrantyEndDate: string | null): WarrantyStatus {
  if (!warrantyEndDate) return 'unknown'
  const end = parseISO(warrantyEndDate)
  const today = new Date()
  const daysLeft = differenceInDays(end, today)
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'expiring_soon'
  return 'active'
}

export function daysUntilExpiry(warrantyEndDate: string | null): number | null {
  if (!warrantyEndDate) return null
  return differenceInDays(parseISO(warrantyEndDate), new Date())
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: fr })
}

export function formatPrice(amount: number | null, currency = 'EUR'): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function computeResaleEstimate(
  purchasePrice: number,
  purchaseDate: string,
  category: string,
  condition: string
): { min: number; max: number; recommended: number } {
  const ageMonths = differenceInDays(new Date(), parseISO(purchaseDate)) / 30

  const depreciationRates: Record<string, number> = {
    'Téléphone': 0.25,
    'Ordinateur': 0.2,
    'Tablette': 0.22,
    'TV / Écran': 0.15,
    'Audio': 0.18,
    'Console de jeux': 0.15,
    'Électroménager': 0.12,
    'Vélo / Trottinette': 0.15,
    'Photo / Vidéo': 0.2,
    'Mobilier': 0.1,
    'Outillage': 0.1,
    'Autre': 0.15,
  }

  const conditionMultipliers: Record<string, number> = {
    new: 0.95,
    like_new: 0.85,
    good: 0.7,
    fair: 0.55,
    poor: 0.35,
  }

  const rate = depreciationRates[category] ?? 0.15
  const conditionMult = conditionMultipliers[condition] ?? 0.7
  const yearlyDepreciation = rate / 12
  const baseValue = purchasePrice * Math.max(0.1, 1 - yearlyDepreciation * ageMonths)
  const recommended = Math.round(baseValue * conditionMult)

  return {
    min: Math.round(recommended * 0.85),
    max: Math.round(recommended * 1.15),
    recommended,
  }
}

export function getCategoryEmoji(category: string | null): string {
  const map: Record<string, string> = {
    'Téléphone': '📱',
    'Ordinateur': '💻',
    'Tablette': '📱',
    'TV / Écran': '📺',
    'Audio': '🎧',
    'Console de jeux': '🎮',
    'Électroménager': '🏠',
    'Vélo / Trottinette': '🚲',
    'Photo / Vidéo': '📷',
    'Mobilier': '🛋️',
    'Outillage': '🔧',
  }
  return map[category ?? ''] ?? '📦'
}
