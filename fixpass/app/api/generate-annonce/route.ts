import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { formatPrice, formatDate } from '@/lib/utils'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { object } = await req.json()

  const warrantyInfo = object.warranty_status === 'active'
    ? `Garantie active jusqu'au ${formatDate(object.warranty_end_date)}`
    : object.warranty_status === 'expiring_soon'
    ? `Garantie expire bientôt (${formatDate(object.warranty_end_date)})`
    : 'Garantie expirée'

  const prompt = `Génère une annonce de revente courte et efficace pour cet objet.

Objet : ${object.name}
Marque : ${object.brand || 'N/A'}
Modèle : ${object.model || 'N/A'}
Date d'achat : ${formatDate(object.purchase_date)}
Prix d'achat : ${formatPrice(object.purchase_price)}
Vendeur d'origine : ${object.seller || 'N/A'}
État : ${object.condition === 'good' ? 'Bon état' : object.condition === 'like_new' ? 'Comme neuf' : object.condition}
${warrantyInfo}
Prix recommandé : ${formatPrice(object.resale_recommended)}
${object.notes ? `Notes : ${object.notes}` : ''}

Format de l'annonce :
TITRE: [titre accrocheur court]

DESCRIPTION:
[2-3 phrases de description naturelle et honnête]

CARACTÉRISTIQUES:
[liste courte des points clés]

PRIX: [prix recommandé] €

Sois concis, naturel, et mets en avant la facture disponible et la garantie si elle est active.`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const annonce = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ annonce })
  } catch (err) {
    return NextResponse.json({ annonce: 'Erreur lors de la génération.' }, { status: 500 })
  }
}
