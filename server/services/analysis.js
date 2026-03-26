const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `Eres un experto en copywriting, marketing de contenidos y análisis de guiones para redes sociales, especialmente para Instagram Reels y videos cortos.

Tu tarea es analizar la transcripción de un video de Instagram y desglosar su guion en partes estructuradas. Debes identificar con precisión cada sección del video y evaluar su efectividad.

Responde SIEMPRE con un JSON válido (sin markdown, sin bloques de código, solo el JSON puro) con exactamente esta estructura:

{
  "hook": {
    "texto": "Las palabras exactas del hook (primeras frases)",
    "duracion_estimada": "0-5s",
    "tecnica": "pregunta retórica | dato impactante | afirmación polémica | historia | promesa | problema | otro",
    "efectividad": 8,
    "comentario": "Por qué funciona o no el hook"
  },
  "desarrollo": {
    "texto": "El contenido principal del video",
    "puntos_clave": ["punto 1", "punto 2", "punto 3"],
    "estructura": "lista | historia | problema-solución | antes-después | pasos | otro",
    "comentario": "Análisis del desarrollo"
  },
  "cierre": {
    "texto": "Las palabras exactas del cierre",
    "tipo": "resumen | reflexión | pregunta | sorpresa | continuación | otro",
    "comentario": "Análisis del cierre"
  },
  "cta": {
    "texto": "Las palabras exactas del call to action (o null si no hay)",
    "tipo": "seguir | comentar | compartir | guardar | link en bio | comprar | suscribirse | ninguno | otro",
    "posicion": "al inicio | en el medio | al final | no hay",
    "comentario": "Análisis del CTA"
  },
  "metricas": {
    "tono": "educativo | entretenimiento | inspiracional | venta | informativo | humor | otro",
    "idioma": "es",
    "ritmo": "rápido | medio | lento",
    "puntuacion_gancho": 8,
    "puntuacion_general": 7
  },
  "resumen": "Resumen ejecutivo en 2-3 oraciones de qué trata el video y qué técnicas usa",
  "recomendaciones": ["Sugerencia 1 para mejorar", "Sugerencia 2"]
}

Si alguna sección no está claramente presente en la transcripción, indícalo en el campo "comentario" correspondiente con "No identificado claramente".
La puntuacion_gancho y puntuacion_general van del 1 al 10.`;

/**
 * Analyze a video transcript using Claude API.
 * @param {string} transcript - full transcript text
 * @param {string} apiKey - Anthropic API key
 * @param {string} videoTitle - title/description of the video (optional context)
 * @returns {Promise<Object>} structured analysis JSON
 */
async function analyzeScript(transcript, apiKey, videoTitle = '') {
  const client = new Anthropic({ apiKey });

  const userMessage = `Analiza el siguiente guion/transcripción de un video de Instagram${videoTitle ? ` titulado: "${videoTitle}"` : ''}:

---TRANSCRIPCIÓN---
${transcript}
---FIN TRANSCRIPCIÓN---

Devuelve el análisis completo en el formato JSON especificado.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const responseText = message.content[0]?.text || '{}';

  try {
    return JSON.parse(responseText);
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Claude did not return valid JSON: ' + responseText.slice(0, 200));
  }
}

module.exports = { analyzeScript };
