const http = require('http');
const fs   = require('fs');
const path = require('path');

const {
  ALLOWED_ORIGINS,
  defaultFloors,
  generateGAs,
  parseXML,
  buildXML,
  buildCSV
} = require('./engine');

const PORT = process.env.PORT || 3000;

// ── STATIC FILES ───────────────────────────────────────────────
if (method === 'GET' && !url.startsWith('/api')) {
  const filePath = path.join(__dirname, url === '/' ? '/index.html' : url);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);

    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    const file = fs.readFileSync(filePath);

    send(res, 200, file, contentType);
    return;
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, body, contentType = 'application/json') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function checkOrigin(req) {
  const origin = req.headers.origin || '';
  // allow direct access (no origin header = curl / same-machine browser open)
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

// ─── SERVER ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // ── Domain check for all API routes ─────────────────────────────────────────
  if (url.startsWith('/api') && !checkOrigin(req)) {
    send(res, 403, { error: 'Forbidden: origin not allowed' });
    return;
  }

  // ── GET / — serve index.html ─────────────────────────────────────────────────
  if (method === 'GET' && (url === '/' || url === '/index.html')) {
    try {
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
      send(res, 200, html, 'text/html; charset=utf-8');
    } catch {
      send(res, 500, { error: 'index.html not found' });
    }
    return;
  }

  // ── POST /api/generate ───────────────────────────────────────────────────────
  if (method === 'POST' && url === '/api/generate') {
    try {
      const body = await readBody(req);
      const gas = generateGAs({
        structure:  body.structure  || 'function',
        floors:     body.floors     || defaultFloors,
        systems:    body.systems    || {},
        quantities: body.quantities || {},
        manualGAs:  body.manualGAs  || [],
        ltSubs:     body.ltSubs     || {},
        hvacSubs:   body.hvacSubs   || {}
      });
      send(res, 200, { gas, count: gas.length });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  // ── POST /api/export/xml ─────────────────────────────────────────────────────
  if (method === 'POST' && url === '/api/export/xml') {
    try {
      const body = await readBody(req);
      const opts = body.opts || {};
      const xml = buildXML(body.gas || [], {
        projectName: opts.projectName || '',
        floors:      opts.floors      || [],
        includeDpt:  opts.includeDpt  !== false,
        includeDesc: opts.includeDesc || false
      });
      send(res, 200, xml, 'application/xml; charset=utf-8');
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  // ── POST /api/export/csv ─────────────────────────────────────────────────────
  if (method === 'POST' && url === '/api/export/csv') {
    try {
      const body = await readBody(req);
      const opts = body.opts || {};
      const csv = buildCSV(body.gas || [], {
        floors: opts.floors || []
      });
      send(res, 200, csv, 'text/plain; charset=utf-8');
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  // ── POST /api/import/xml ─────────────────────────────────────────────────────
  if (method === 'POST' && url === '/api/import/xml') {
    try {
      const body = await readBody(req);
      const xmlString = body.xml || '';
      if (!xmlString) {
        send(res, 400, { error: 'Missing xml field in request body' });
        return;
      }
      const gas = parseXML(xmlString);
      send(res, 200, { gas, count: gas.length });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
    return;
  }

  // ── 404 ──────────────────────────────────────────────────────────────────────
  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`KNX GA Planner running at http://localhost:${PORT}`);
});
