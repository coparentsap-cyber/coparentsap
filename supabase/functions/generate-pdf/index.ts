import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, content } = await req.json()

    // Générer le contenu HTML pour le PDF
    let htmlContent = ''

    switch (type) {
      case 'documents':
        htmlContent = generateDocumentsPDF(content)
        break
      case 'planning':
        htmlContent = generatePlanningPDF(content)
        break
      case 'messages':
        htmlContent = generateMessagesPDF(content)
        break
      default:
        throw new Error('Type de PDF non supporté')
    }

    // En mode démo, retourner une URL simulée
    const pdfUrl = `data:text/html;base64,${btoa(htmlContent)}`

    return new Response(
      JSON.stringify({ pdf_url: pdfUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateDocumentsPDF(content: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Documents Co-Parents</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #8b5cf6; font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .status-valide { color: #059669; font-weight: bold; }
        .status-attente { color: #d97706; font-weight: bold; }
        .status-refuse { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Co-Parents</div>
        <h1>Liste des Documents</h1>
        <p>Généré le ${content.date}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date</th>
            <th>Enfant</th>
            <th>Statut</th>
            <th>Taille</th>
          </tr>
        </thead>
        <tbody>
          ${content.documents.map((doc: any) => `
            <tr>
              <td>${doc.titre}</td>
              <td>${doc.date}</td>
              <td>${doc.enfant}</td>
              <td class="status-${doc.statut}">${doc.statut}</td>
              <td>${doc.taille}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
        Co-Parents - L'application des familles recomposées
      </div>
    </body>
    </html>
  `
}

function generatePlanningPDF(content: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Planning Co-Parents</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #8b5cf6; font-size: 24px; font-weight: bold; }
        .calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
        .day { border: 1px solid #ddd; padding: 10px; min-height: 60px; }
        .day-header { background-color: #f3f4f6; font-weight: bold; text-align: center; }
        .garde-day { background-color: #dbeafe; color: #1e40af; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Co-Parents</div>
        <h1>Planning de Garde</h1>
        <p>${content.month} ${content.year}</p>
      </div>
      
      <div class="calendar">
        ${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => 
          `<div class="day day-header">${day}</div>`
        ).join('')}
        ${content.days.map((day: any) => `
          <div class="day ${day.isGarde ? 'garde-day' : ''}">
            ${day.date}
            ${day.isGarde ? '<br>👶 Garde' : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `
}

function generateMessagesPDF(content: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Messages Co-Parents</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #8b5cf6; font-size: 24px; font-weight: bold; }
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .message-sent { background-color: #dbeafe; margin-left: 20%; }
        .message-received { background-color: #f3f4f6; margin-right: 20%; }
        .message-header { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Co-Parents</div>
        <h1>Historique des Messages</h1>
        <p>Période : ${content.period}</p>
      </div>
      
      ${content.messages.map((msg: any) => `
        <div class="message ${msg.sent ? 'message-sent' : 'message-received'}">
          <div class="message-header">${msg.author} - ${msg.date}</div>
          <div>${msg.text}</div>
        </div>
      `).join('')}
    </body>
    </html>
  `
}