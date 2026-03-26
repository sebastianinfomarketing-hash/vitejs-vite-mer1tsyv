import Anthropic from '@anthropic-ai/sdk';

// NOTE: Calling the Anthropic API directly from the browser exposes your API key.
// For production, route requests through a backend proxy or serverless function.
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TrainingContext {
  profile: {
    name: string;
    objectives: string;
    weight: string;
    priorities: { squat: string; bench: string; deadlift: string };
  };
  daysPerWeek: number;
  recoveryType: string;
  weeklyTotals: Record<string, number>;
  dailyRoutines: Record<
    number,
    Array<{
      exerciseName: string;
      sets: number;
      reps: string;
      kgs: string;
      rest: string;
      rir: string;
      tempo: string;
      notes: string;
    }>
  >;
}

function buildSystemPrompt(ctx: TrainingContext): string {
  const muscleNames: Record<string, string> = {
    chest: 'Pecho',
    back: 'Espalda',
    quad: 'Cuádriceps',
    femoral: 'Isquios',
    glute: 'Glúteo',
    adductors: 'Aductores',
    deltoidAnt: 'Delt. Anterior',
    deltoidLat: 'Delt. Lateral',
    rearDelts: 'Delt. Posterior',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    traps: 'Trapecio',
    calves: 'Gemelos',
    abs: 'Abdomen',
  };

  const volumeSummary = Object.entries(ctx.weeklyTotals)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  - ${muscleNames[k] || k}: ${v.toFixed(1)}`)
    .join('\n');

  const routineSummary = Object.entries(ctx.dailyRoutines)
    .filter(([, exercises]) => exercises && exercises.length > 0)
    .map(([day, exercises]) => {
      const dayNum = parseInt(day) + 1;
      const exerciseList = exercises
        .map(
          (e) =>
            `    • ${e.exerciseName}: ${e.sets} series × ${e.reps} reps${e.kgs ? ` @ ${e.kgs}kg` : ''}, descanso ${e.rest}, RIR ${e.rir}${e.notes ? ` (${e.notes})` : ''}`
        )
        .join('\n');
      return `  Día ${dayNum}:\n${exerciseList}`;
    })
    .join('\n');

  return `Eres un coach de fitness y culturismo natural de élite. Tu rol es analizar y dar consejos sobre la rutina de entrenamiento del usuario, basándote en los datos que tiene cargados en la app.

## Datos actuales del atleta

**Perfil:**
- Nombre: ${ctx.profile.name}
- Objetivo: ${ctx.profile.objectives}
- Peso corporal: ${ctx.profile.weight ? ctx.profile.weight + ' kg' : 'no especificado'}
- Levantamientos prioritarios: Sentadilla ${ctx.profile.priorities.squat || '–'} | Press de Banca ${ctx.profile.priorities.bench || '–'} | Peso Muerto ${ctx.profile.priorities.deadlift || '–'}
- Días de entrenamiento por semana: ${ctx.daysPerWeek}
- Tipo de recuperación: ${ctx.recoveryType === 'high' ? 'Alta' : 'Estándar'}

**Volumen semanal real (sets × kg efectivos):**
${volumeSummary || '  (sin datos)'}

**Rutina actual:**
${routineSummary || '  (sin ejercicios cargados)'}

## Instrucciones
- Responde en español, de forma directa y experta
- Fundamenta tus recomendaciones en principios de hipertrofia y fuerza (volumen, frecuencia, intensidad, RIR, periodización)
- Identifica desequilibrios musculares, exceso o falta de volumen, y sugiere ajustes concretos
- Cuando el usuario pregunte algo general, usa los datos anteriores como contexto principal`;
}

export async function streamChat(
  messages: ChatMessage[],
  ctx: TrainingContext,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    onError(
      'No se encontró VITE_ANTHROPIC_API_KEY. Añade tu clave de API de Anthropic en el archivo .env.'
    );
    return;
  }

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: buildSystemPrompt(ctx),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk(event.delta.text);
      }
    }

    onDone();
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      onError('API key inválida. Verifica VITE_ANTHROPIC_API_KEY en tu .env.');
    } else if (err instanceof Anthropic.RateLimitError) {
      onError('Límite de rate alcanzado. Intenta de nuevo en unos segundos.');
    } else if (err instanceof Anthropic.APIError) {
      onError(`Error de API (${err.status}): ${err.message}`);
    } else {
      onError('Error inesperado al conectar con Claude.');
    }
  }
}
