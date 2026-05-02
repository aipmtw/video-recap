// Build a POSIX-compliant deploy.zip from .next/standalone.
//
// Why not PowerShell Compress-Archive? It writes Windows backslashes inside
// zip entries (e.g. "node_modules\\foo\\bar.js") which Linux Kudu cannot
// expand into nested directories — rsync then fails with code 23.
//
// Why exclude .env? Next.js standalone copies .env from the project root
// into the bundle. Azure App Service supplies the same vars as App Settings,
// so shipping .env would duplicate (and leak) credentials.

import { createWriteStream, readdirSync, readFileSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';

const SRC = '.next/standalone';
const OUT = 'deploy.zip';
const EXCLUDE = new Set(['.env', '.env.local', '.env.production', '.env.development']);

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && !EXCLUDE.has(entry.name)) yield full;
  }
}

const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b; };

function dosDateTime(d = new Date()) {
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() >> 1) & 0x1f);
  const date = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0xf) << 5) | (d.getDate() & 0x1f);
  return { time, date };
}

const out = createWriteStream(OUT);
const central = [];
let offset = 0;
let count = 0;
const { time, date } = dosDateTime();

for (const full of walk(SRC)) {
  const rel = relative(SRC, full).split(sep).join(posix.sep);
  const data = readFileSync(full);
  const compressed = deflateRawSync(data);
  const useDeflate = compressed.length < data.length;
  const payload = useDeflate ? compressed : data;
  const method = useDeflate ? 8 : 0;
  const crc = crc32(data);
  const name = Buffer.from(rel, 'utf8');

  const local = Buffer.concat([
    u32(0x04034b50), u16(20), u16(0x0800),
    u16(method), u16(time), u16(date),
    u32(crc), u32(payload.length), u32(data.length),
    u16(name.length), u16(0), name, payload
  ]);
  out.write(local);

  central.push(Buffer.concat([
    u32(0x02014b50), u16(20), u16(20), u16(0x0800),
    u16(method), u16(time), u16(date),
    u32(crc), u32(payload.length), u32(data.length),
    u16(name.length), u16(0), u16(0), u16(0), u16(0),
    u32(0), u32(offset), name
  ]));
  offset += local.length;
  count += 1;
}

const cdStart = offset;
let cdSize = 0;
for (const c of central) { out.write(c); cdSize += c.length; }
out.write(Buffer.concat([
  u32(0x06054b50), u16(0), u16(0),
  u16(count), u16(count), u32(cdSize), u32(cdStart), u16(0)
]));

out.end(() => {
  console.log(`Wrote ${OUT}: ${count} files`);
});
