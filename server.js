const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 4173);

function loadEnvFromFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

loadEnvFromFile(path.join(ROOT, '.env'));

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function handleNotification(req, res) {
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
    if (rawBody.length > 1024 * 1024) req.destroy();
  });

  req.on('end', async () => {
    const {
      SENDGRID_API_KEY,
      SENDGRID_TEMPLATE_ID,
      SENDGRID_FROM_EMAIL,
      NOTIFY_TO_EMAIL,
    } = process.env;

    if (!SENDGRID_API_KEY || !SENDGRID_TEMPLATE_ID || !SENDGRID_FROM_EMAIL || !NOTIFY_TO_EMAIL) {
      return sendJson(res, 500, {
        success: false,
        error: 'Missing required SendGrid environment variables',
      });
    }

    try {
      const body = rawBody ? JSON.parse(rawBody) : {};
      const couponTitle = body.coupon_title || 'Unknown coupon';
      const event = body.event || 'Coupon redeemed';
      const message = body.message || 'A coupon has been redeemed.';
      const timestamp = body.timestamp || new Date().toISOString();

      const sendGridPayload = {
        from: { email: SENDGRID_FROM_EMAIL },
        personalizations: [
          {
            to: [{ email: NOTIFY_TO_EMAIL }],
            dynamic_template_data: {
              coupon_title: couponTitle,
              event,
              message,
              timestamp,
            },
          },
        ],
        template_id: SENDGRID_TEMPLATE_ID,
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendGridPayload),
      });

      const messageId = response.headers.get('x-message-id') || null;

      if (!response.ok) {
        const details = await response.text();
        return sendJson(res, response.status, {
          success: false,
          error: 'SendGrid request failed',
          details,
          messageId,
        });
      }

      return sendJson(res, 200, { success: true, messageId });
    } catch (error) {
      return sendJson(res, 500, {
        success: false,
        error: 'Server error while sending email',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
    }[ext] || 'application/octet-stream'
  );
}

function serveStatic(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  const requested = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(path.join(ROOT, requested));

  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType(safePath) });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/send-notification') {
    handleNotification(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405, { Allow: 'GET, HEAD, POST' });
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
