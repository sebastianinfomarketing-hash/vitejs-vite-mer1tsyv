import { useState, useEffect } from 'react';
import {
  Instagram,
  Key,
  Search,
  Video,
  CheckSquare,
  Square,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
  Target,
  TrendingUp,
  AlertCircle,
  FileText,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiKeys {
  openai: string;
  anthropic: string;
}

interface VideoItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string | null;
  timestamp: number | null;
  duration: number | null;
}

interface HookAnalysis {
  texto: string;
  duracion_estimada: string;
  tecnica: string;
  efectividad: number;
  comentario: string;
}

interface DesarrolloAnalysis {
  texto: string;
  puntos_clave: string[];
  estructura: string;
  comentario: string;
}

interface CierreAnalysis {
  texto: string;
  tipo: string;
  comentario: string;
}

interface CtaAnalysis {
  texto: string | null;
  tipo: string;
  posicion: string;
  comentario: string;
}

interface MetricasAnalysis {
  tono: string;
  idioma: string;
  ritmo: string;
  puntuacion_gancho: number;
  puntuacion_general: number;
}

interface ScriptAnalysis {
  hook: HookAnalysis;
  desarrollo: DesarrolloAnalysis;
  cierre: CierreAnalysis;
  cta: CtaAnalysis;
  metricas: MetricasAnalysis;
  resumen: string;
  recomendaciones: string[];
}

interface AnalysisResult {
  url: string;
  title: string;
  transcript: string;
  analysis: ScriptAnalysis;
  loading?: false;
  error?: string;
}

interface AnalysisLoading {
  url: string;
  title: string;
  loading: true;
  step: string;
}

type AnalysisEntry = AnalysisResult | AnalysisLoading;

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-6 text-right">{value}/{max}</span>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-200">
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-slate-200 transition-colors" title="Copiar">
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-slate-400" />}
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  accentColor,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${accentColor} text-left`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="p-4 bg-white space-y-3 text-sm text-slate-700">{children}</div>}
    </div>
  );
}

// ── Single video analysis card ────────────────────────────────────────────────

function VideoAnalysisCard({ entry, index }: { entry: AnalysisEntry; index: number }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  if ('loading' in entry && entry.loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-3 shadow-sm">
        <Loader2 size={20} className="animate-spin text-pink-500" />
        <div>
          <p className="font-semibold text-slate-700 text-sm">{entry.title || entry.url}</p>
          <p className="text-xs text-slate-500 mt-0.5">{entry.step}</p>
        </div>
      </div>
    );
  }

  if (entry.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-2 text-red-700">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">{entry.title || entry.url}</p>
            <p className="text-xs mt-1">{entry.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { analysis, transcript, title, url } = entry as AnalysisResult;
  const { hook, desarrollo, cierre, cta, metricas, resumen, recomendaciones } = analysis;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs opacity-75 mb-0.5">Video {index + 1}</p>
            <p className="font-bold text-sm leading-tight truncate">{title || url}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black">{metricas?.puntuacion_general ?? '?'}</p>
              <p className="text-xs opacity-75">general</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{metricas?.puntuacion_gancho ?? '?'}</p>
              <p className="text-xs opacity-75">gancho</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {metricas?.tono && <Badge label={metricas.tono} />}
          {metricas?.ritmo && <Badge label={`ritmo ${metricas.ritmo}`} />}
          {cta?.tipo && cta.tipo !== 'ninguno' && <Badge label={`CTA: ${cta.tipo}`} />}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Resumen */}
        {resumen && (
          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 italic border border-slate-100">
            "{resumen}"
          </div>
        )}

        {/* Hook */}
        <SectionCard
          icon={<Target size={15} />}
          title="Hook (Gancho)"
          accentColor="bg-pink-50 text-pink-800 hover:bg-pink-100"
        >
          {hook?.texto && (
            <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
              <div className="flex justify-between items-start gap-1">
                <p className="italic text-pink-900 text-xs leading-relaxed">"{hook.texto}"</p>
                <CopyButton text={hook.texto} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Técnica</p>
              <p className="font-medium capitalize">{hook?.tecnica || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Duración est.</p>
              <p className="font-medium">{hook?.duracion_estimada || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">Efectividad del gancho</p>
            <ScoreBar value={hook?.efectividad ?? 0} />
          </div>
          {hook?.comentario && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{hook.comentario}</p>
          )}
        </SectionCard>

        {/* Desarrollo */}
        <SectionCard
          icon={<TrendingUp size={15} />}
          title="Desarrollo"
          accentColor="bg-blue-50 text-blue-800 hover:bg-blue-100"
        >
          {desarrollo?.texto && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex justify-between items-start gap-1">
                <p className="text-blue-900 text-xs leading-relaxed">{desarrollo.texto}</p>
                <CopyButton text={desarrollo.texto} />
              </div>
            </div>
          )}
          {desarrollo?.puntos_clave?.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs mb-1.5">Puntos clave</p>
              <ul className="space-y-1">
                {desarrollo.puntos_clave.map((p, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Estructura</p>
              <p className="font-medium capitalize">{desarrollo?.estructura || '—'}</p>
            </div>
          </div>
          {desarrollo?.comentario && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{desarrollo.comentario}</p>
          )}
        </SectionCard>

        {/* Cierre */}
        <SectionCard
          icon={<MessageSquare size={15} />}
          title="Cierre"
          accentColor="bg-green-50 text-green-800 hover:bg-green-100"
        >
          {cierre?.texto && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex justify-between items-start gap-1">
                <p className="italic text-green-900 text-xs leading-relaxed">"{cierre.texto}"</p>
                <CopyButton text={cierre.texto} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Tipo de cierre</p>
              <p className="font-medium capitalize">{cierre?.tipo || '—'}</p>
            </div>
          </div>
          {cierre?.comentario && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{cierre.comentario}</p>
          )}
        </SectionCard>

        {/* CTA */}
        <SectionCard
          icon={<Star size={15} />}
          title="Call to Action (CTA)"
          accentColor="bg-amber-50 text-amber-800 hover:bg-amber-100"
        >
          {cta?.texto ? (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <div className="flex justify-between items-start gap-1">
                <p className="italic text-amber-900 text-xs leading-relaxed">"{cta.texto}"</p>
                <CopyButton text={cta.texto} />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No se detectó un CTA explícito</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500 mb-0.5">Tipo</p>
              <p className="font-medium capitalize">{cta?.tipo || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-0.5">Posición</p>
              <p className="font-medium capitalize">{cta?.posicion || '—'}</p>
            </div>
          </div>
          {cta?.comentario && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">{cta.comentario}</p>
          )}
        </SectionCard>

        {/* Recomendaciones */}
        {recomendaciones?.length > 0 && (
          <SectionCard
            icon={<Lightbulb size={15} />}
            title="Recomendaciones"
            accentColor="bg-purple-50 text-purple-800 hover:bg-purple-100"
            defaultOpen={false}
          >
            <ul className="space-y-1.5">
              {recomendaciones.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-purple-500 font-bold mt-0.5">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setTranscriptOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left"
            >
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-600">
                <FileText size={15} />
                Transcripción completa
              </div>
              <div className="flex items-center gap-1">
                <CopyButton text={transcript} />
                {transcriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            {transcriptOpen && (
              <div className="p-4 bg-white">
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{transcript}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type Step = 'config' | 'url' | 'videos' | 'results';

export default function InstagramAnalyzer() {
  const [step, setStep] = useState<Step>('config');
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ openai: '', anthropic: '' });
  const [profileUrl, setProfileUrl] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videosError, setVideosError] = useState('');
  const [analyses, setAnalyses] = useState<AnalysisEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Manual transcript mode
  const [manualMode, setManualMode] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [manualTitle, setManualTitle] = useState('');

  // Load saved keys from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ig_analyzer_keys');
    if (saved) {
      try {
        const keys = JSON.parse(saved);
        setApiKeys(keys);
        if (keys.anthropic) setStep('url');
      } catch {}
    }
  }, []);

  const saveKeys = () => {
    if (!apiKeys.anthropic) return;
    localStorage.setItem('ig_analyzer_keys', JSON.stringify(apiKeys));
    setStep('url');
  };

  const fetchVideos = async () => {
    if (!profileUrl.trim()) return;
    setLoadingVideos(true);
    setVideosError('');
    setVideos([]);

    try {
      const resp = await fetch(`/api/profile-videos?url=${encodeURIComponent(profileUrl)}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al obtener videos');
      setVideos(data.videos || []);
      setStep('videos');
    } catch (err: unknown) {
      setVideosError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingVideos(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const analyzeSelected = async () => {
    const toAnalyze = videos.filter(v => selectedIds.has(v.id));
    if (toAnalyze.length === 0) return;

    setAnalyses([]);
    setAnalyzing(true);
    setStep('results');

    // Process videos sequentially to avoid API rate limits
    const results: AnalysisEntry[] = [];

    for (const video of toAnalyze) {
      const loadingEntry: AnalysisLoading = {
        url: video.url,
        title: video.title,
        loading: true,
        step: 'Descargando audio...',
      };
      results.push(loadingEntry);
      setAnalyses([...results]);

      try {
        const resp = await fetch('/api/analyze-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: video.url,
            title: video.title,
            apiKeys,
          }),
        });

        const data = await resp.json();
        results[results.length - 1] = resp.ok
          ? { url: video.url, title: video.title, transcript: data.transcript, analysis: data.analysis }
          : { url: video.url, title: video.title, transcript: '', analysis: {} as ScriptAnalysis, error: data.error };
      } catch (err: unknown) {
        results[results.length - 1] = {
          url: video.url,
          title: video.title,
          transcript: '',
          analysis: {} as ScriptAnalysis,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      setAnalyses([...results]);
    }

    setAnalyzing(false);
  };

  const analyzeManualTranscript = async () => {
    if (!manualTranscript.trim() || !apiKeys.anthropic) return;
    setAnalyses([]);
    setAnalyzing(true);
    setStep('results');

    const loadingEntry: AnalysisLoading = {
      url: '',
      title: manualTitle || 'Transcripción manual',
      loading: true,
      step: 'Analizando con Claude...',
    };
    setAnalyses([loadingEntry]);

    try {
      const resp = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: manualTranscript,
          title: manualTitle,
          apiKeys,
        }),
      });

      const data = await resp.json();
      setAnalyses([
        resp.ok
          ? { url: '', title: manualTitle || 'Transcripción manual', transcript: manualTranscript, analysis: data.analysis }
          : { url: '', title: manualTitle || 'Transcripción manual', transcript: manualTranscript, analysis: {} as ScriptAnalysis, error: data.error },
      ]);
    } catch (err: unknown) {
      setAnalyses([{
        url: '',
        title: manualTitle || 'Transcripción manual',
        transcript: manualTranscript,
        analysis: {} as ScriptAnalysis,
        error: err instanceof Error ? err.message : String(err),
      }]);
    }

    setAnalyzing(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Instagram size={22} className="text-pink-500" />
          <h1 className="text-xl font-bold text-slate-800">Instagram Script Analyzer</h1>
        </div>
        <p className="text-sm text-slate-500">Analiza guiones de videos con IA: Hook · Desarrollo · Cierre · CTA</p>
      </div>

      {/* Step nav */}
      <div className="flex items-center gap-1 text-xs">
        {(['config', 'url', 'videos', 'results'] as Step[]).map((s, i) => {
          const labels: Record<Step, string> = { config: 'API Keys', url: 'URL', videos: 'Videos', results: 'Análisis' };
          const reached =
            step === 'results' ? true :
            step === 'videos' ? i <= 2 :
            step === 'url' ? i <= 1 :
            i === 0;
          return (
            <div key={s} className="flex items-center gap-1">
              {i > 0 && <div className={`h-px w-6 ${reached ? 'bg-pink-400' : 'bg-slate-200'}`} />}
              <span className={`px-2 py-0.5 rounded-full font-medium ${step === s ? 'bg-pink-500 text-white' : reached ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-400'}`}>
                {labels[s]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: API Keys */}
      {step === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <Key size={16} />
            Configuración de API Keys
          </div>
          <p className="text-xs text-slate-500">Las keys se guardan localmente en tu navegador (localStorage). No se envían a ningún servidor externo salvo las APIs correspondientes.</p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">OpenAI API Key (para Whisper)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKeys.openai}
                onChange={e => setApiKeys(k => ({ ...k, openai: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Anthropic API Key (para Claude)</label>
              <input
                type="password"
                placeholder="sk-ant-..."
                value={apiKeys.anthropic}
                onChange={e => setApiKeys(k => ({ ...k, anthropic: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <button
            onClick={saveKeys}
            disabled={!apiKeys.anthropic}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity text-sm"
          >
            Guardar y continuar
          </button>

          <p className="text-xs text-slate-400 text-center">
            Solo necesitas Anthropic key si usarás el modo "pegar transcripción" sin descarga de video.
          </p>
        </div>
      )}

      {/* Step 2: URL input */}
      {step === 'url' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Search size={16} />
                Buscar videos de perfil
              </div>
              <button
                onClick={() => setManualMode(m => !m)}
                className="text-xs text-pink-600 underline hover:no-underline"
              >
                {manualMode ? 'Usar URL de Instagram' : 'Pegar texto manualmente'}
              </button>
            </div>

            {!manualMode ? (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">URL del perfil o video de Instagram</label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/nombreusuario/"
                    value={profileUrl}
                    onChange={e => setProfileUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchVideos()}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <p className="text-xs text-slate-400 mt-1">Perfil público, post individual o Reel. Requiere yt-dlp instalado en el servidor.</p>
                </div>

                {videosError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    {videosError}
                  </div>
                )}

                <button
                  onClick={fetchVideos}
                  disabled={loadingVideos || !profileUrl.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                >
                  {loadingVideos ? <><Loader2 size={15} className="animate-spin" /> Obteniendo videos...</> : <><Search size={15} /> Obtener videos</>}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Título del video (opcional)</label>
                  <input
                    type="text"
                    placeholder="Título descriptivo..."
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Transcripción del video</label>
                  <textarea
                    placeholder="Pega aquí la transcripción o el guion del video..."
                    value={manualTranscript}
                    onChange={e => setManualTranscript(e.target.value)}
                    rows={8}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
                  />
                </div>
                <button
                  onClick={analyzeManualTranscript}
                  disabled={!manualTranscript.trim() || !apiKeys.anthropic || analyzing}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                >
                  {analyzing ? <><Loader2 size={15} className="animate-spin" /> Analizando...</> : <><Play size={15} /> Analizar con Claude</>}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setStep('config')}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Cambiar API keys
          </button>
        </div>
      )}

      {/* Step 3: Video selection */}
      {step === 'videos' && videos.length > 0 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Video size={16} />
                Seleccionar videos ({selectedIds.size} seleccionados)
              </div>
              <button
                onClick={() => {
                  if (selectedIds.size === videos.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(videos.map(v => v.id)));
                  }
                }}
                className="text-xs text-pink-600 underline hover:no-underline"
              >
                {selectedIds.size === videos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {videos.map(video => {
                const selected = selectedIds.has(video.id);
                return (
                  <button
                    key={video.id}
                    onClick={() => toggleSelect(video.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected ? 'border-pink-300 bg-pink-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    {selected ? <CheckSquare size={16} className="text-pink-500 flex-shrink-0" /> : <Square size={16} className="text-slate-300 flex-shrink-0" />}
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{video.title || '(sin título)'}</p>
                      {video.duration && (
                        <p className="text-xs text-slate-400">{Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={analyzeSelected}
              disabled={selectedIds.size === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
            >
              <Play size={15} />
              Analizar {selectedIds.size > 0 ? `${selectedIds.size} video${selectedIds.size > 1 ? 's' : ''}` : 'videos seleccionados'}
            </button>
          </div>

          <button onClick={() => setStep('url')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Cambiar URL
          </button>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 'results' && (
        <div className="space-y-4">
          {analyzing && (
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 text-sm text-pink-700 flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" />
              Procesando videos… esto puede tardar unos minutos.
            </div>
          )}

          {analyses.map((entry, i) => (
            <VideoAnalysisCard key={i} entry={entry} index={i} />
          ))}

          {!analyzing && analyses.length > 0 && (
            <button
              onClick={() => { setStep('url'); setAnalyses([]); setVideos([]); setSelectedIds(new Set()); }}
              className="w-full py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Analizar otros videos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
