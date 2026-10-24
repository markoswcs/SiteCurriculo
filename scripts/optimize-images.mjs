// Gera versões WebP responsivas das imagens em design/originais para public/img.
// Uso: npm run images
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const src = 'design/originais';
const out = 'public/img';

const jobs = [
  { file: 'foto-profissional-markos.png', name: 'markos-foto', widths: [480, 900] },
  { file: 'markos-portrait.png', name: 'markos-avatar', widths: [360, 720] },
  { file: 'creative-brain.png', name: 'cerebro', widths: [600, 1100] },
  { file: 'real-gl-desktop.png', name: 'gl-ultra', widths: [800, 1600] },
  { file: 'real-sfl-farm.png', name: 'sfl-pro', widths: [400, 780] },
  { file: 'real-dopashop.png', name: 'dopashop', widths: [800, 1440] },
  { file: 'project-notion.png', name: 'notion', widths: [700, 1300] },
  { file: 'project-gabriella.png', name: 'gabriella', widths: [700, 1200], extract: { left: 40, top: 180, width: 380, height: 540 }, pad: true },
  { file: 'flowy-logo.png', name: 'flowy-logo', widths: [160] },
];

await mkdir(out, { recursive: true });

for (const job of jobs) {
  for (const width of job.widths) {
    let img = sharp(`${src}/${job.file}`);
    if (job.extract) {
      // Recorta o livro da captura e o centraliza em um quadro 16:10 com o fundo original.
      const book = await img.extract(job.extract).toBuffer();
      img = sharp({ create: { width: 1440, height: 900, channels: 3, background: '#1a0c0f' } })
        .composite([{ input: await sharp(book).resize({ height: 760 }).toBuffer(), gravity: 'centre' }]);
      img = sharp(await img.png().toBuffer());
    }
    const target = `${out}/${job.name}-${width}.webp`;
    const info = await img.resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(target);
    console.log(target, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
  }
}
