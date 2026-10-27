/**
 * Image Open Graph (1200 × 630) générée au build, sans service externe ni dépendance :
 * encodeur PNG minimal (zlib de Node) et police bitmap 5 × 7 en capitales.
 */
import { deflateSync } from 'node:zlib';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// Chaque glyphe : 7 lignes de 5 colonnes séparées par « / » ; « # » = pixel allumé.
const GLYPHS = {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#', B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.####/#..../#..../#..../#..../#..../.####', D: '####./#...#/#...#/#...#/#...#/#...#/####.',
  E: '#####/#..../#..../####./#..../#..../#####', F: '#####/#..../#..../####./#..../#..../#....',
  G: '.####/#..../#..../#..##/#...#/#...#/.####', H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '#####/..#../..#../..#../..#../..#../#####', J: '..###/...#./...#./...#./...#./#..#./.##..',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#', L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#', N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.', P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#', R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.####/#..../#..../.###./....#/....#/####.', T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.', V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#', X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..', Z: '#####/....#/...#./..#../.#.../#..../#####',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.', 1: '..#../.##../..#../..#../..#../..#../.###.',
  2: '.###./#...#/....#/...#./..#../.#.../#####', 3: '####./....#/....#/.###./....#/....#/####.',
  4: '...#./..##./.#.#./#..#./#####/...#./...#.', 5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '.###./#..../#..../####./#...#/#...#/.###.', 7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.', 9: '.###./#...#/#...#/.####/....#/....#/.###.',
  '-': '...../...../...../#####/...../...../.....', '.': '...../...../...../...../...../..##./..##.',
  ',': '...../...../...../...../..#../..#../.#...', ':': '...../..#../...../...../..#../...../.....',
  '?': '.###./#...#/....#/...#./..#../...../..#..', '!': '..#../..#../..#../..#../..#../...../..#..',
  "'": '..#../..#../.#.../...../...../...../.....', '/': '....#/....#/...#./..#../.#.../#..../#....',
  '%': '##..#/##..#/...#./..#../.#.../#..##/#..##', '€': '..###/.#.../#####/.#.../#####/.#.../..###',
  '(': '...#./..#../.#.../.#.../.#.../..#../...#.', ')': '.#.../..#../...#./...#./...#./..#../.#...',
  '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#', '+': '...../..#../..#../#####/..#../..#../.....',
};

/** Capitales sans accents, caractères inconnus remplacés par une espace. */
export function normalizeText(s) {
  return String(s)
    .replace(/œ/gi, 'oe')
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split('')
    .map((c) => (c in GLYPHS || c === ' ' ? c : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Coupe en lignes d'au plus `max` caractères (mots entiers) ; ajoute « ... » si le texte est tronqué. */
export function wrapLines(text, max, maxLines) {
  const lines = [];
  let cur = '';
  const words = text.split(' ');
  let i = 0;
  for (; i < words.length; i++) {
    const w = words[i].slice(0, max);
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= max) cur = next;
    else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur), (i = words.length);
  if (i < words.length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = (last.length + 3 > max ? last.slice(0, max - 3) : last) + '...';
  }
  return lines.slice(0, maxLines);
}

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

export function encodePng(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profondeur
  ihdr[9] = 2; // RVB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const BG = [15, 23, 42];
const FG = [248, 250, 252];
const ACCENT = [45, 212, 191];
const MUTED = [148, 163, 184];

/** Dessine `text` (déjà normalisé) en (x, y) à l'échelle `s` ; renvoie la largeur dessinée. */
function drawText(img, text, x, y, s, color) {
  let cx = x;
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (g) {
      g.split('/').forEach((row, r) => {
        for (let c = 0; c < 5; c++) {
          if (row[c] !== '#') continue;
          for (let dy = 0; dy < s; dy++) {
            const o = ((y + r * s + dy) * OG_WIDTH + cx + c * s) * 3;
            for (let dx = 0; dx < s; dx++) img.set(color, o + dx * 3);
          }
        }
      });
    }
    cx += 6 * s;
  }
  return cx - x;
}

function fillRect(img, x, y, w, h, color) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) img.set(color, (j * OG_WIDTH + i) * 3);
}

/** PNG 1200 × 630 : bandeau « PATRIMOINE OS », étiquette de rubrique et titre sur 4 lignes au plus. */
export function renderOgImage({ title, label = '' }) {
  const img = Buffer.alloc(OG_WIDTH * OG_HEIGHT * 3);
  for (let i = 0; i < OG_WIDTH * OG_HEIGHT; i++) img.set(BG, i * 3);
  fillRect(img, 0, 0, 24, OG_HEIGHT, ACCENT);
  drawText(img, 'PATRIMOINE OS', 90, 70, 6, ACCENT);
  const tag = normalizeText(label);
  if (tag) drawText(img, tag, 90, 140, 5, MUTED);
  const scale = 9; // 54 px par caractère → 20 caractères par ligne dans 1080 px
  const lines = wrapLines(normalizeText(title), 20, 4);
  lines.forEach((l, i) => drawText(img, l, 90, 220 + i * 90, scale, FG));
  fillRect(img, 90, 580, 200, 6, ACCENT);
  return encodePng(OG_WIDTH, OG_HEIGHT, img);
}

/** Nom de fichier de l'image d'une page à partir de son chemin (« /guides/x/ » → « guides-x.png »). */
export function ogFileName(path) {
  const slug = path.replace(/^\/|\/$/g, '').replace(/\//g, '-');
  return slug ? `${slug}.png` : null;
}

export function ogLabel(path) {
  if (path.startsWith('/guides/')) return 'Guide';
  if (path.startsWith('/encyclopedie/')) return 'Fiche encyclopedie';
  if (path.startsWith('/simulateurs/')) return 'Simulateur';
  return '';
}
