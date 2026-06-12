/* One-off: translate every remaining Russian-copy string in each locale via the
   project's Groq engine. Only touches values still identical to the Russian
   source. Batches strings with an `N|||text` protocol; falls back to per-item
   on any batch parse mismatch. Run once, then delete. */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

// --- config from backend/.env ---
const envPath = path.join(dir, '..', '..', '..', '..', 'backend', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const getEnv = (k) => {
  const m = env.match(new RegExp('^' + k + '\\s*=\\s*(.+)$', 'm'));
  return m ? m[1].trim() : '';
};
const API_KEY = getEnv('GROQ_API_KEY');
const MODEL = getEnv('GROQ_TRANSLATION_MODEL') || 'qwen/qwen3-32b';
const URL = 'https://api.groq.com/openai/v1/chat/completions';

const LANG_NAMES = { kk: 'Kazakh', be: 'Belarusian', ky: 'Kyrgyz', hy: 'Armenian', ro: 'Romanian', tg: 'Tajik', tk: 'Turkmen', uz: 'Uzbek' };
const LANGS = Object.keys(LANG_NAMES);

const THINK = /<think>[\s\S]*?<\/think>/g;
const read = (l) => JSON.parse(fs.readFileSync(path.join(dir, l + '.json'), 'utf8'));
const write = (l, d) => fs.writeFileSync(path.join(dir, l + '.json'), JSON.stringify(d, null, 2) + '\n', 'utf8');
const flat = (o, p, acc) => { for (const k in o) { const v = o[k], np = p ? p + '.' + k : k; if (v && typeof v === 'object') flat(v, np, acc); else acc[np] = v; } return acc; };
const setPath = (o, p, val) => { const ks = p.split('.'); let c = o; for (let i = 0; i < ks.length - 1; i++) c = c[ks[i]]; c[ks[ks.length - 1]] = val; };
const hasLetter = (s) => /\p{L}/u.test(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chat(messages) {
  for (let attempt = 0; attempt < 7; attempt++) {
    try {
      const resp = await fetch(URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 4096, messages }),
      });
      if (resp.status === 429 || resp.status >= 500) { await sleep(3000 * (attempt + 1)); continue; }
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + (await resp.text()).slice(0, 200));
      const data = await resp.json();
      const c = data.choices?.[0]?.message?.content;
      if (c == null) throw new Error('no content');
      return c.replace(THINK, '').trim();
    } catch (e) {
      if (attempt === 6) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw new Error('retries exhausted');
}

function sysPrompt(language) {
  return `You are a professional UI localization engine. Translate each numbered item into ${language}.
Rules:
- Keep ALL placeholders like {{count}}, {{xp}}, {{total}} EXACTLY as written, untranslated.
- Keep emojis, HTML tags, leading "+"/"-" and trailing punctuation.
- "XP", "QR", "Email", "API" stay as-is. Do NOT translate brand/proper words that have no equivalent.
- If an item is already in ${language}, keep it.
- Return EXACTLY one line per item in the form N|||translation (same numbering, no extra lines, no commentary). /no_think`;
}

async function translateOne(text, language) {
  const out = await chat([
    { role: 'system', content: `You are a translation engine. Translate into ${language}. Keep {{placeholders}}, emojis and punctuation. Output only the translation. /no_think` },
    { role: 'user', content: text },
  ]);
  return (out || text).split('\n')[0].trim() || text;
}

async function translateBatch(items, language) {
  // items: [{n, text}]
  const body = items.map((it) => `${it.n}|||${it.text}`).join('\n');
  const out = await chat([
    { role: 'system', content: sysPrompt(language) },
    { role: 'user', content: body },
  ]);
  const map = {};
  for (const line of out.split('\n')) {
    const m = line.match(/^\s*(\d+)\s*\|\|\|(.*)$/);
    if (m) map[m[1]] = m[2].trim();
  }
  const result = {};
  let missing = 0;
  for (const it of items) {
    if (map[it.n] != null && map[it.n] !== '') result[it.text] = map[it.n];
    else missing++;
  }
  if (missing > 0) {
    // Fall back to per-item for the ones we couldn't parse.
    for (const it of items) {
      if (result[it.text] == null) {
        try { result[it.text] = await translateOne(it.text, language); } catch { /* leave untranslated; resumable */ }
      }
    }
  }
  return result;
}

async function pool(tasks, size) {
  const results = [];
  let i = 0;
  async function worker() { while (i < tasks.length) { const idx = i++; results[idx] = await tasks[idx](); } }
  await Promise.all(Array.from({ length: Math.min(size, tasks.length) }, worker));
  return results;
}

(async () => {
  if (!API_KEY) { console.error('No GROQ_API_KEY'); process.exit(1); }
  const ru = read('ru');
  const ruFlat = flat(ru, '', {});
  let grand = 0;
  for (const lang of LANGS) {
    const d = read(lang);
    const dFlat = flat(d, '', {});
    // paths still equal to ru and worth translating
    const paths = [];
    const uniq = new Map(); // text -> n
    const items = [];
    for (const p in ruFlat) {
      const v = ruFlat[p];
      if (typeof v !== 'string') continue;
      if (dFlat[p] !== v) continue;        // already translated / different
      if (!hasLetter(v)) continue;          // placeholder/symbol only
      paths.push(p);
      if (!uniq.has(v)) { const n = items.length + 1; uniq.set(v, n); items.push({ n, text: v }); }
    }
    if (items.length === 0) { console.log(lang, 'nothing to do'); continue; }
    console.log(lang, '->', LANG_NAMES[lang], ':', paths.length, 'paths,', items.length, 'unique strings');
    // batch unique items
    const B = 20;
    const batches = [];
    for (let i = 0; i < items.length; i += B) batches.push(items.slice(i, i + B));
    const tasks = batches.map((b, bi) => async () => {
      try {
        const r = await translateBatch(b, LANG_NAMES[lang]);
        process.stdout.write(`  [${lang}] batch ${bi + 1}/${batches.length} done (${Object.keys(r).length})\n`);
        return r;
      } catch (e) {
        process.stdout.write(`  [${lang}] batch ${bi + 1}/${batches.length} FAILED: ${e.message}\n`);
        return {};
      }
    });
    const partials = await pool(tasks, 3);
    const tx = Object.assign({}, ...partials);
    let applied = 0;
    for (const p of paths) {
      const src = ruFlat[p];
      const t = tx[src];
      if (t && t !== src) { setPath(d, p, t); applied++; }
    }
    write(lang, d);
    grand += applied;
    console.log(lang, 'applied', applied, 'translations');
  }
  console.log('DONE. total applied:', grand);
})();
