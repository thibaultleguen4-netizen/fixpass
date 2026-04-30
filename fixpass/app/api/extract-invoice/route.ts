import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { file, mimeType } = await req.json()

    if (!file || !mimeType) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'Type non supporté' }, { status: 400 })
    }

    const prompt = `Tu es un assistant spécialisé dans l'extraction d'informations de factures.

Analyse cette facture et extrais les informations suivantes en JSON strict.
Réponds UNIQUEMENT avec du JSON valide, sans aucun texte avant ou après.

Format attendu :
{
  "product_name": "nom complet du produit",
  "brand": "marque",
  "model": "référence modèle",
  "category": "une des valeurs: Téléphone|Ordinateur|Tablette|TV / Écran|Audio|Photo / Vidéo|Console de jeux|Électroménager|Vélo / Trottinette|Mobilier|Outillage|Autre",
  "purchase_date": "YYYY-MM-DD ou null",
  "purchase_price": nombre ou null,
  "currency": "EUR",
  "seller": "nom du vendeur",
  "order_number": "numéro de commande ou null",
  "serial_number": "numéro de série ou null",
  "standard_warranty_months": 24,
  "extended_warranty_detected": true ou false,
  "extended_warranty_months": 0,
  "confidence_score": 0.0 à 1.0,
  "fields_to_confirm": ["liste des champs incertains"]
}

Règles importantes:
- Si une extension de garantie est mentionnée (AppleCare, Garantie+, extension sérénité, +3 ans, etc.), mets extended_warranty_detected à true et remplis extended_warranty_months
- Pour les produits neufs en France/UE, la garantie légale standard est de 24 mois
- Mets dans fields_to_confirm les champs dont tu n'es pas sûr à plus de 85%
- Si tu ne trouves pas une information, mets null
- La date doit être au format YYYY-MM-DD`

    const contentParts: any[] = [{ type: 'text', text: prompt }]

    if (isImage) {
      contentParts.push({
        type: 'image',
        source: { type: 'base64', media_type: mimeType, data: file },
      })
    } else {
      contentParts.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: file },
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: contentParts }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', errText)
      return NextResponse.json(emptyResult(), { status: 200 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()

    try {
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    } catch {
      console.error('JSON parse error:', clean)
      return NextResponse.json(emptyResult(), { status: 200 })
    }

  } catch (err) {
    console.error('Extract invoice error:', err)
    return NextResponse.json(emptyResult(), { status: 200 })
  }
}

function emptyResult() {
  return {
    product_name: '',
    brand: '',
    model: '',
    category: '',
    purchase_date: null,
    purchase_price: null,
    currency: 'EUR',
    seller: '',
    order_number: null,
    serial_number: null,
    standard_warranty_months: 24,
    extended_warranty_detected: false,
    extended_warranty_months: 0,
    confidence_score: 0,
    fields_to_confirm: [],
  }
}
