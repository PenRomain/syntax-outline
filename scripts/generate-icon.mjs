import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const width = 128;
const height = 128;
const channels = 4;
const data = Buffer.alloc(width * height * channels, 0);

const crcTable = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let current = index;

  for (let bit = 0; bit < 8; bit += 1) {
    current = (current & 1) !== 0 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  }

  crcTable[index] = current >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function blendPixel(x, y, red, green, blue, alpha) {
  if (x < 0 || x >= width || y < 0 || y >= height || alpha <= 0) {
    return;
  }

  const normalizedAlpha = clamp(alpha, 0, 255) / 255;
  const offset = (y * width + x) * channels;
  const currentAlpha = data[offset + 3] / 255;
  const nextAlpha = normalizedAlpha + currentAlpha * (1 - normalizedAlpha);

  if (nextAlpha <= 0) {
    return;
  }

  data[offset] = Math.round(
    (red * normalizedAlpha + data[offset] * currentAlpha * (1 - normalizedAlpha)) / nextAlpha,
  );
  data[offset + 1] = Math.round(
    (green * normalizedAlpha + data[offset + 1] * currentAlpha * (1 - normalizedAlpha)) /
      nextAlpha,
  );
  data[offset + 2] = Math.round(
    (blue * normalizedAlpha + data[offset + 2] * currentAlpha * (1 - normalizedAlpha)) /
      nextAlpha,
  );
  data[offset + 3] = Math.round(nextAlpha * 255);
}

function fillRoundedRect(x, y, rectWidth, rectHeight, radius, color) {
  const left = x;
  const top = y;
  const right = x + rectWidth;
  const bottom = y + rectHeight;

  for (let pixelY = top; pixelY < bottom; pixelY += 1) {
    for (let pixelX = left; pixelX < right; pixelX += 1) {
      const dx =
        pixelX < left + radius
          ? left + radius - pixelX
          : pixelX > right - radius - 1
            ? pixelX - (right - radius - 1)
            : 0;
      const dy =
        pixelY < top + radius
          ? top + radius - pixelY
          : pixelY > bottom - radius - 1
            ? pixelY - (bottom - radius - 1)
            : 0;

      if (dx * dx + dy * dy <= radius * radius) {
        blendPixel(pixelX, pixelY, color.r, color.g, color.b, color.a);
      }
    }
  }
}

const glyphs = {
  s: [
    '01110',
    '10001',
    '10000',
    '01110',
    '00001',
    '10001',
    '01110',
  ],
  o: [
    '01110',
    '10001',
    '10001',
    '10001',
    '10001',
    '10001',
    '01110',
  ],
};

function drawGlyph(character, originX, originY, scale, color) {
  const pattern = glyphs[character];

  if (!pattern) {
    return;
  }

  for (let row = 0; row < pattern.length; row += 1) {
    for (let column = 0; column < pattern[row].length; column += 1) {
      if (pattern[row][column] !== '1') {
        continue;
      }

      for (let offsetY = 0; offsetY < scale; offsetY += 1) {
        for (let offsetX = 0; offsetX < scale; offsetX += 1) {
          blendPixel(
            originX + column * scale + offsetX,
            originY + row * scale + offsetY,
            color.r,
            color.g,
            color.b,
            color.a,
          );
        }
      }
    }
  }
}

function drawOutlinedGlyph(character, originX, originY, scale, strokeColor, fillColor) {
  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];

  for (const [offsetX, offsetY] of offsets) {
    drawGlyph(character, originX + offsetX * scale, originY + offsetY * scale, scale, strokeColor);
  }

  drawGlyph(character, originX, originY, scale, fillColor);
}

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const verticalMix = y / height;
    const glowDistance = Math.hypot(x - 70, y - 44);
    const glowStrength = Math.max(0, 1 - glowDistance / 100);
    const red = Math.round(9 + verticalMix * 6 + glowStrength * 10);
    const green = Math.round(14 + verticalMix * 8 + glowStrength * 16);
    const blue = Math.round(26 + verticalMix * 12 + glowStrength * 28);
    blendPixel(x, y, red, green, blue, 255);
  }
}

fillRoundedRect(18, 22, 92, 84, 24, { r: 9, g: 18, b: 34, a: 255 });
fillRoundedRect(20, 24, 88, 80, 22, { r: 13, g: 30, b: 56, a: 255 });
fillRoundedRect(22, 26, 84, 76, 20, { r: 18, g: 48, b: 92, a: 255 });
fillRoundedRect(25, 29, 78, 70, 18, { r: 10, g: 18, b: 33, a: 255 });

fillRoundedRect(26, 30, 76, 68, 18, { r: 10, g: 18, b: 31, a: 215 });
fillRoundedRect(26, 30, 76, 68, 18, { r: 64, g: 167, b: 255, a: 20 });

drawOutlinedGlyph(
  's',
  30,
  40,
  6,
  { r: 69, g: 176, b: 255, a: 255 },
  { r: 12, g: 18, b: 31, a: 255 },
);
drawOutlinedGlyph(
  'o',
  62,
  40,
  6,
  { r: 69, g: 176, b: 255, a: 255 },
  { r: 12, g: 18, b: 31, a: 255 },
);

function chunk(type, content) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(content.length, 0);
  const name = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, content])), 0);
  return Buffer.concat([length, name, content, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const value of buffer) {
    crc = crcTable[(crc ^ value) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

const scanlines = Buffer.alloc((width * channels + 1) * height);

for (let y = 0; y < height; y += 1) {
  const scanlineOffset = y * (width * channels + 1);
  const sourceOffset = y * width * channels;

  scanlines[scanlineOffset] = 0;
  data.copy(scanlines, scanlineOffset + 1, sourceOffset, sourceOffset + width * channels);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
header[10] = 0;
header[11] = 0;
header[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header),
  chunk('IDAT', deflateSync(scanlines)),
  chunk('IEND', Buffer.alloc(0)),
]);

await mkdir('assets', { recursive: true });
await writeFile('assets/icon.png', png);
