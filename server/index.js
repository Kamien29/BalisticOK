'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const SECTION_SLOTS = new Set([
  'rocket-1', 'rocket-2', 'rocket-computer',
  'team-mechanics', 'team-electronics', 'team-organization',
]);
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function imageFormat(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')))
    return { mime: 'image/png', extension: '.png' };
  if (bytes.length >= 3 && bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')))
    return { mime: 'image/jpeg', extension: '.jpg' };
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP')
    return { mime: 'image/webp', extension: '.webp' };
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)))
    return { mime: 'image/gif', extension: '.gif' };
  return null;
}

function authorized(req, adminToken) {
  if (!adminToken || adminToken.length < 24) return false;
  const supplied = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1] || '';
  const digest = (value) => crypto.createHash('sha256').update(value).digest();
  return crypto.timingSafeEqual(digest(supplied), digest(adminToken));
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

async function bodyBuffer(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_IMAGE_SIZE) {
      const err = new Error('Maksymalny rozmiar zdjęcia to 8 MB.');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, total);
}

function validItem(item) {
  return item && typeof item.id === 'string' &&
    /^[0-9a-f-]{36}$/.test(item.id) &&
    typeof item.src === 'string' &&
    /^\/media\/[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(item.src) &&
    typeof item.alt === 'string';
}

function createAppServer({
  buildDir = path.resolve(__dirname, '../build'),
  dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../data'),
  adminToken = process.env.ADMIN_TOKEN || '',
} = {}) {
  const uploadsDir = path.join(dataDir, 'uploads');
  const metadataFile = path.join(dataDir, 'media.json');
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o700 });

  let media = { gallery: [], sections: {} };
  if (fs.existsSync(metadataFile)) {
    const saved = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    if (!Array.isArray(saved.gallery) || !saved.sections ||
        typeof saved.sections !== 'object' || Array.isArray(saved.sections)) {
      throw new Error('Niepoprawny plik media.json. Przywróć go z kopii zapasowej.');
    }
    media = {
      gallery: saved.gallery.filter(validItem),
      sections: Object.fromEntries(
        Object.entries(saved.sections).filter(([slot, item]) => SECTION_SLOTS.has(slot) && validItem(item))
      ),
    };
  }

  let pending = Promise.resolve();
  function serialized(job) {
    const result = pending.then(job);
    pending = result.catch(() => {});
    return result;
  }
  async function saveMedia(next) {
    const temporary = path.join(dataDir, '.media-' + crypto.randomUUID() + '.tmp');
    try {
      await fs.promises.writeFile(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
      await fs.promises.rename(temporary, metadataFile);
    } finally {
      await fs.promises.rm(temporary, { force: true }).catch(() => {});
    }
    media = next;
  }
  async function removeStoredFile(item) {
    if (item && validItem(item)) {
      await fs.promises.rm(path.join(uploadsDir, path.basename(item.src)), { force: true }).catch((error) => {
        console.error('Nie udało się usunąć starego zdjęcia:', error);
      });
    }
  }
  const staticRoot = path.resolve(buildDir);

  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === '/api/health' && req.method === 'GET') {
        return json(res, 200, { ok: true });
      }
      if (pathname === '/api/media' && req.method === 'GET') {
        return json(res, 200, media);
      }
      if (pathname === '/api/media' && req.method === 'POST') {
        if (!authorized(req, adminToken)) return json(res, 401, { error: 'Nieprawidłowe hasło administratora.' });
        const slot = url.searchParams.get('slot');
        if (slot !== 'gallery' && !SECTION_SLOTS.has(slot))
          return json(res, 400, { error: 'Nieznana sekcja zdjęć.' });
        const declaredType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(declaredType))
          return json(res, 415, { error: 'Dozwolone formaty: JPG, PNG, WEBP i GIF.' });
        if (Number(req.headers['content-length']) > MAX_IMAGE_SIZE)
          return json(res, 413, { error: 'Maksymalny rozmiar zdjęcia to 8 MB.' });
        const bytes = await bodyBuffer(req);
        const format = imageFormat(bytes);
        if (!format || format.mime !== declaredType)
          return json(res, 415, { error: 'Zawartość pliku nie jest poprawnym obrazem wybranego typu.' });
        const alt = (url.searchParams.get('alt') || 'Zdjęcie projektu').trim().slice(0, 160);
        const id = crypto.randomUUID();
        const filename = id + format.extension;
        const item = { id, src: '/media/' + filename, alt: alt || 'Zdjęcie projektu' };
        return await serialized(async () => {
          const destination = path.join(uploadsDir, filename);
          await fs.promises.writeFile(destination, bytes, { flag: 'wx', mode: 0o600 });
          const old = slot === 'gallery' ? null : media.sections[slot];
          const next = {
            gallery: slot === 'gallery' ? [...media.gallery, item] : media.gallery,
            sections: slot === 'gallery' ? media.sections : { ...media.sections, [slot]: item },
          };
          try {
            await saveMedia(next);
          } catch (error) {
            await fs.promises.rm(destination, { force: true });
            throw error;
          }
          await removeStoredFile(old);
          return json(res, 201, { item, media });
        });
      }
      if (pathname.startsWith('/api/media/') && req.method === 'DELETE') {
        if (!authorized(req, adminToken)) return json(res, 401, { error: 'Nieprawidłowe hasło administratora.' });
        const id = pathname.slice('/api/media/'.length);
        if (!/^[0-9a-f-]{36}$/.test(id)) return json(res, 400, { error: 'Nieprawidłowy identyfikator.' });
        return await serialized(async () => {
          const existing = media.gallery.find((item) => item.id === id) ||
            Object.values(media.sections).find((item) => item.id === id);
          if (!existing) return json(res, 404, { error: 'Nie znaleziono zdjęcia.' });
          const next = {
            gallery: media.gallery.filter((item) => item.id !== id),
            sections: Object.fromEntries(Object.entries(media.sections).filter(([, item]) => item.id !== id)),
          };
          await saveMedia(next);
          await removeStoredFile(existing);
          return json(res, 200, { media });
        });
      }
      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'Nie znaleziono API.' });

      if (pathname.startsWith('/media/')) {
        if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Metoda niedozwolona.' });
        const filename = pathname.slice('/media/'.length);
        if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(filename))
          return json(res, 404, { error: 'Nie znaleziono zdjęcia.' });
        const filepath = path.join(uploadsDir, filename);
        const bytes = await fs.promises.readFile(filepath).catch((error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (!bytes) return json(res, 404, { error: 'Nie znaleziono zdjęcia.' });
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[path.extname(filename)],
          'Content-Length': bytes.length,
          'Cache-Control': 'public, max-age=31536000, immutable',
        });
        return res.end(req.method === 'HEAD' ? undefined : bytes);
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Metoda niedozwolona.' });
      if (pathname.split('/').some((part) => part.startsWith('.')))
        return json(res, 404, { error: 'Nie znaleziono.' });
      let filename = path.resolve(staticRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (filename !== staticRoot && !filename.startsWith(staticRoot + path.sep))
        return json(res, 404, { error: 'Nie znaleziono.' });
      let bytes;
      try {
        if (!fs.statSync(filename).isFile()) throw Object.assign(new Error('Not a file'), { code: 'ENOENT' });
        bytes = await fs.promises.readFile(filename);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        if (!path.extname(pathname) && (req.headers.accept || '').includes('text/html')) {
          filename = path.join(staticRoot, 'index.html');
          bytes = await fs.promises.readFile(filename);
        } else {
          return json(res, 404, { error: 'Nie znaleziono pliku.' });
        }
      }
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(filename)] || 'application/octet-stream',
        'Cache-Control': path.basename(filename) === 'index.html' ? 'no-cache' : 'public, max-age=3600',
      });
      return res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (error.status) return json(res, error.status, { error: error.message });
      if (error instanceof URIError) return json(res, 400, { error: 'Nieprawidłowy adres.' });
      console.error('Błąd serwera:', error);
      if (!res.headersSent) return json(res, 500, { error: 'Wewnętrzny błąd serwera.' });
      res.end();
    }
  });
}

module.exports = { createAppServer };

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createAppServer();
  server.listen(port, process.env.HOST || '0.0.0.0', () => {
    console.log('BalisticOK działa na porcie ' + port);
    if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN.length < 24) {
      console.warn('UWAGA: ustaw ADMIN_TOKEN (min. 24 znaki), aby włączyć przesyłanie zdjęć.');
    }
  });
}
