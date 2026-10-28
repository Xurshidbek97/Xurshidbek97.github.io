/* ============================================
   Cloudflare Worker — contact form → Telegram
   The bot token lives here as a secret, never in the website code.

   Secrets / variables (Cloudflare dashboard → Worker → Settings → Variables):
     BOT_TOKEN        (secret)  token from @BotFather
     CHAT_ID          (secret)  your Telegram chat id (where messages arrive)
     ALLOWED_ORIGINS  (text)    comma-separated, e.g. https://xurshidbek97.github.io
   ============================================ */

const LIMITS = { name: 100, email: 150, message: 3000 };
const RATE_LIMIT = 5;               // messages per IP …
const RATE_WINDOW_MS = 60 * 60e3;   // … per hour (per Worker instance)
const recent = new Map();

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0] || 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

const escapeHtml = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function rateLimited(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_LIMIT) return true;
  list.push(now);
  recent.set(ip, list);
  return false;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, cors);

    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.length && !allowed.includes(origin)) return json({ ok: false, error: 'origin' }, 403, cors);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: 'bad_json' }, 400, cors);
    }

    // Honeypot: real visitors never fill the hidden "website" field
    if (data.website) return json({ ok: true }, 200, cors);

    const name = String(data.name || '').trim().slice(0, LIMITS.name);
    const email = String(data.email || '').trim().slice(0, LIMITS.email);
    const message = String(data.message || '').trim().slice(0, LIMITS.message);
    const lang = String(data.lang || '').slice(0, 5);

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'invalid' }, 400, cors);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip)) return json({ ok: false, error: 'rate' }, 429, cors);

    const text =
      `📩 <b>Portfolio — yangi xabar</b>\n\n` +
      `👤 <b>Ism:</b> ${escapeHtml(name)}\n` +
      `✉️ <b>Email:</b> ${escapeHtml(email)}\n` +
      (lang ? `🌐 <b>Til:</b> ${escapeHtml(lang)}\n` : '') +
      `\n${escapeHtml(message)}`;

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });

    if (!tg.ok) return json({ ok: false, error: 'telegram' }, 502, cors);
    return json({ ok: true }, 200, cors);
  }
};
