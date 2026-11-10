// Generate humanoid enemy PNGs for the offline homepage arena
// /assets/enemies/<id>/<side>.png  (left/right preview预售 images the SPA expects)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 220, H = 460; // px; CSS scales each enemy by bi{...scale}

function crc32(buf) {
  let table = crc32.t;
  if (!table) {
    table = crc32.t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(w, h, pixels) { // pixels: RGBA Uint8Array w*h*4
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter none
    Buffer.from(pixels.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// tiny alpha-blended ellipse/circle/rect painter
function makeCanvas(w, h) { return { w, h, px: new Uint8Array(w * h * 4) }; }
function put(c, x, y, r, g, b, a) {
  x |= 0; y |= 0; if (x < 0 || y < 0 || x >= c.w || y >= c.h || a <= 0) return;
  const i = (y * c.w + x) * 4;
  c.px[i] = r; c.px[i + 1] = g; c.px[i + 2] = b; c.px[i + 3] = a;
}
function ellipse(c, cx, cy, rx, ry, col, a = 255) {
  const [r, g, b] = col;
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) put(c, x, y, r, g, b, a);
    }
}
function rect(c, x0, y0, w, h, col, a = 255) {
  const [r, g, b] = col;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) put(c, x, y, r, g, b, a);
}

// Draw a stylized agent silhouette (facing direction flips pose bias)
function drawAgent(cell, flipSide) {
  const cx = cell.w / 2;
  const suit = { chamber: [178, 138, 92], cypher: [225, 228, 235], jett: [120, 190, 210], sage: [200, 225, 240] };
  const accent = { chamber: [240, 205, 150], cypher: [90, 200, 200], jett: [130, 170, 250], sage: [140, 220, 200] };
  const id = cell.id;
  const coat = suit[id] || [160, 170, 180];
  const acc = accent[id] || [255, 200, 120];
  const dark = [40, 46, 52];
  const skin = [232, 186, 146];
  const sgn = flipSide === 'left' ? 1 : -1; // bias weapon/arm toward the side it leans from

  // legs
  rect(cell, cx - 26, 300, 20, 130, dark);
  rect(cell, cx + 6, 300, 20, 130, dark);
  // boots
  rect(cell, cx - 30, 424, 30, 16, dark);
  rect(cell, cx + 4, 424, 30, 16, dark);
  // torso / vest
  ellipse(cell, cx, 250, 44, 66, coat);
  rect(cell, cx - 40, 214, 80, 96, coat);
  ellipse(cell, cx, 236, 34, 52, acc, 255); // chest plate
  // arms
  rect(cell, cx - 52, 230, 18, 84, coat);
  rect(cell, cx + 34, 230, 18, 84, coat);
  // weapon held across chest, offset toward lean side
  rect(cell, cx - 10 + sgn * 18, 268, 64, 12, dark);
  rect(cell, cx - 4 + sgn * 30, 280, 22, 8, dark);
  // head + face
  ellipse(cell, cx, 168, 34, 38, skin);
  ellipse(cell, cx, 152, 36, 22, dark); // cap/band
  if (id === 'cypher') ellipse(cell, cx, 176, 20, 14, [230, 60, 60], 255); // visor glow
  // shoulder pads
  ellipse(cell, cx - 44, 216, 16, 12, acc);
  ellipse(cell, cx + 44, 216, 16, 12, acc);
}

const enemies = ['chamber', 'cypher', 'jett', 'sage'];
const outRoot = path.join('assets', 'enemies');
for (const id of enemies) {
  for (const side of ['left', 'right']) {
    // left image leans right (facing left→right mirrored); right image leans left
    const cell = makeCanvas(W, H);
    cell.id = id;
    drawAgent(cell, side === 'left' ? 'right' : 'left');
    const dir = path.join(outRoot, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, side + '.png'), png(W, H, cell.px));
    console.log('wrote', path.join(dir, side + '.png'));
  }
}
