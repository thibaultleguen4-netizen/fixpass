export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'unknown'
export type ObjectCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type DocumentType = 'receipt' | 'photo' | 'manual' | 'warranty' | 'other'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  premium_status: boolean
  created_at: string
}

export interface ObjectItem {
  id: string
  user_id: string
  name: string
  brand: string | null
  model: string | null
  category: string | null
  serial_number: string | null
  purchase_date: string | null
  purchase_price: number | null
  currency: string
  seller: string | null
  order_number: string | null
  warranty_months: number
  extended_warranty_months: number
  warranty_end_date: string | null
  warranty_status: WarrantyStatus
  condition: ObjectCondition
  resale_min: number | null
  resale_max: number | null
  resale_recommended: number | null
  notes: string | null
  created_at: string
  updated_at: string
  documents?: Document[]
}

export interface Document {
  id: string
  object_id: string
  user_id: string
  type: DocumentType
  file_url: string | null
  file_name: string | null
  mime_type: string | null
  extracted_text: string | null
  extraction_status: string
  created_at: string
}

export interface Repair {
  id: string
  object_id: string
  user_id: string
  title: string
  description: string | null
  repair_date: string | null
  cost: number | null
  provider: string | null
  created_at: string
}

export const CATEGORIES = [
  'Téléphone',
  'Ordinateur',
  'Tablette',
  'TV / Écran',
  'Audio',
  'Photo / Vidéo',
  'Console de jeux',
  'Électroménager',
  'Vélo / Trottinette',
  'Mobilier',
  'Outillage',
  'Autre',
]

export const WARRANTY_LABELS: Record<WarrantyStatus, string> = {
  active: 'Garantie active',
  expiring_soon: 'Expire bientôt',
  expired: 'Expirée',
  unknown: 'Inconnue',
}

export const WARRANTY_COLORS: Record<WarrantyStatus, string> = {
  active: 'bg-green-100 text-green-800',
  expiring_soon: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-600',
}
