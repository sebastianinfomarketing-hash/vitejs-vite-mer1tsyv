const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { listProfileVideos, downloadAudio, cleanupFile } = require('./services/instagram');
const { transcribeAudio } = require('./services/transcription');
const { analyzeScript } = require('./services/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

/**
 * GET /api/profile-videos?url=<instagram_url>
 * Returns a list of videos from the given Instagram profile/post URL.
 */
app.get('/api/profile-videos', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parámetro "url" requerido' });
  }

  try {
    const videos = await listProfileVideos(url);
    res.json({ videos });
  } catch (err) {
    console.error('[profile-videos]', err.message);
    res.status(500).json({
      error: 'No se pudo obtener la lista de videos. Verifica que yt-dlp esté instalado y que la URL sea pública.',
      details: err.message,
    });
  }
});

/**
 * POST /api/analyze-video
 * Body: { url: string, title?: string, apiKeys: { openai: string, anthropic: string } }
 * Downloads, transcribes and analyzes a single Instagram video.
 */
app.post('/api/analyze-video', async (req, res) => {
  const { url, title, apiKeys } = req.body;

  if (!url) return res.status(400).json({ error: 'Campo "url" requerido' });
  if (!apiKeys?.openai) return res.status(400).json({ error: 'API key de OpenAI requerida' });
  if (!apiKeys?.anthropic) return res.status(400).json({ error: 'API key de Anthropic requerida' });

  const videoId = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  let audioPath = null;

  try {
    // Step 1: Download audio
    console.log(`[analyze-video] Downloading audio for: ${url}`);
    audioPath = await downloadAudio(url, videoId);

    // Step 2: Transcribe with Whisper
    console.log(`[analyze-video] Transcribing: ${audioPath}`);
    const transcript = await transcribeAudio(audioPath, apiKeys.openai);

    if (!transcript || transcript.trim().length < 10) {
      throw new Error('La transcripción está vacía o es demasiado corta. Es posible que el video no tenga audio o esté en un idioma no reconocido.');
    }

    // Step 3: Analyze with Claude
    console.log(`[analyze-video] Analyzing transcript (${transcript.length} chars)`);
    const analysis = await analyzeScript(transcript, apiKeys.anthropic, title || '');

    res.json({
      success: true,
      url,
      title: title || '',
      transcript,
      analysis,
    });
  } catch (err) {
    console.error('[analyze-video] Error:', err.message);
    res.status(500).json({
      error: err.message,
      details: err.stack?.split('\n')[1] || '',
    });
  } finally {
    // Cleanup temp audio file
    if (audioPath) cleanupFile(audioPath);
  }
});

/**
 * POST /api/analyze-transcript
 * Body: { transcript: string, title?: string, apiKeys: { anthropic: string } }
 * Analyzes a manually provided transcript (no download/transcription needed).
 */
app.post('/api/analyze-transcript', async (req, res) => {
  const { transcript, title, apiKeys } = req.body;

  if (!transcript) return res.status(400).json({ error: 'Campo "transcript" requerido' });
  if (!apiKeys?.anthropic) return res.status(400).json({ error: 'API key de Anthropic requerida' });

  try {
    console.log(`[analyze-transcript] Analyzing transcript (${transcript.length} chars)`);
    const analysis = await analyzeScript(transcript, apiKeys.anthropic, title || '');

    res.json({
      success: true,
      title: title || '',
      transcript,
      analysis,
    });
  } catch (err) {
    console.error('[analyze-transcript] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve built frontend from dist/
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log(`Serving frontend from ${distPath}`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`App running on http://0.0.0.0:${PORT}`);
});
