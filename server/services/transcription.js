const fs = require('fs');
const OpenAI = require('openai');

/**
 * Transcribe an audio file using OpenAI Whisper.
 * @param {string} audioFilePath - path to audio file (mp3, m4a, etc.)
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} transcript text
 */
async function transcribeAudio(audioFilePath, apiKey) {
  const openai = new OpenAI({ apiKey });

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: 'whisper-1',
    language: 'es',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  // Return the full transcript text
  return transcription.text || '';
}

module.exports = { transcribeAudio };
