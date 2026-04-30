import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { file, mimeType } = await req.json()

  const isImage = mimeType.startsWith('image/')
  const isPdf = mimeType === 'application/pdf'

  if (!isImage && !isPdf) {
    return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
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
  "extended_warranty_detected": true/false,
  "extended_warranty_months": 0,
  "confidence_score": 0.0 à 1.0,
  "fields_to_confirm": ["liste des champs incertains"]
}

Important:
- Si une extension de garantie est mentionnée (AppleCare, Garantie+, extension sérénité, etc.), mets extended_warranty_detected à true
- Pour les produits neufs en France/UE, la garantie légale standard est de 24 mois
- Mets dans fields_to_confirm les champs dont tu n'es pas sûr à plus de 85%
- Si tu ne trouves pas une information, mets null`

  try {
    const content: any[] = [{ type: 'text', text: prompt }]

    if (isImage) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType,
          data: file,
        },
      })
    } else {
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: file,
        },
      })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Extraction error:', err)
    return NextResponse.json({
      product_name: '',
      brand: '',
      model: '',
      category: 'Autre',
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
    })
  }
}
