const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * List videos from an Instagram profile using yt-dlp.
 * @param {string} profileUrl - Instagram profile or hashtag URL
 * @returns {Promise<Array<{url, title, id, thumbnail, timestamp, duration}>>}
 */
function listProfileVideos(profileUrl) {
  return new Promise((resolve, reject) => {
    const args = [
      '--flat-playlist',
      '--dump-single-json',
      '--no-warnings',
      '--playlist-end', '20',
      profileUrl,
    ];

    execFile('yt-dlp', args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`yt-dlp error: ${err.message}\n${stderr}`));
      }

      try {
        const data = JSON.parse(stdout);
        const entries = data.entries || [data];
        const videos = entries
          .filter(e => e && e.url)
          .map(e => ({
            id: e.id || e.url,
            url: e.url || `https://www.instagram.com/p/${e.id}/`,
            title: e.title || e.description || '(sin título)',
            thumbnail: e.thumbnail || null,
            timestamp: e.timestamp || null,
            duration: e.duration || null,
          }));
        resolve(videos);
      } catch (parseErr) {
        reject(new Error(`Failed to parse yt-dlp output: ${parseErr.message}`));
      }
    });
  });
}

/**
 * Download audio from an Instagram video URL using yt-dlp.
 * @param {string} videoUrl
 * @param {string} outputId - unique identifier for the temp file
 * @returns {Promise<string>} path to the downloaded audio file (.mp3 or .m4a)
 */
function downloadAudio(videoUrl, outputId) {
  ensureTempDir();
  const outputTemplate = path.join(TEMP_DIR, `${outputId}.%(ext)s`);

  return new Promise((resolve, reject) => {
    const args = [
      '--no-warnings',
      '-x',                          // extract audio
      '--audio-format', 'mp3',
      '--audio-quality', '5',        // 128kbps is enough for Whisper
      '-o', outputTemplate,
      videoUrl,
    ];

    execFile('yt-dlp', args, { maxBuffer: 20 * 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) {
        return reject(new Error(`yt-dlp download error: ${err.message}\n${stderr}`));
      }

      const outputPath = path.join(TEMP_DIR, `${outputId}.mp3`);
      if (!fs.existsSync(outputPath)) {
        // Try m4a as fallback
        const m4aPath = path.join(TEMP_DIR, `${outputId}.m4a`);
        if (fs.existsSync(m4aPath)) return resolve(m4aPath);
        return reject(new Error('Audio file not found after download'));
      }
      resolve(outputPath);
    });
  });
}

/**
 * Delete a temp file after processing.
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_) {}
}

module.exports = { listProfileVideos, downloadAudio, cleanupFile };
