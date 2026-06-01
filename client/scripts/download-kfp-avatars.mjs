import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../public/avatars/kfp');
const SCALE = '/revision/latest/scale-to-width-down/400';

const CHARS = [
  ['po', 'https://static.wikia.nocookie.net/kungfupanda/images/7/73/KFP3-promo-po4.jpg'],
  ['shifu', 'https://static.wikia.nocookie.net/kungfupanda/images/a/a6/KFP3-promo-shifu.jpg'],
  ['tigress', 'https://static.wikia.nocookie.net/kungfupanda/images/e/ea/Tigress.png'],
  ['crane', 'https://static.wikia.nocookie.net/kungfupanda/images/d/de/KFP3-promo-crane1.jpg'],
  ['mantis', 'https://static.wikia.nocookie.net/kungfupanda/images/e/ef/KFP3-promo-mantis1.jpg'],
  ['viper', 'https://static.wikia.nocookie.net/kungfupanda/images/d/db/KFP3-promo-viper.png'],
  ['monkey', 'https://static.wikia.nocookie.net/kungfupanda/images/f/f9/KFP3-promo-monkey1.jpg'],
  ['oogway', 'https://static.wikia.nocookie.net/kungfupanda/images/2/2e/Oogway-white.png'],
  ['tai-lung', 'https://static.wikia.nocookie.net/kungfupanda/images/c/ca/Spirit_Tai_Lung.jpg'],
  ['mr-ping', 'https://static.wikia.nocookie.net/kungfupanda/images/3/39/MrPingMain.jpg'],
  ['zeng', 'https://static.wikia.nocookie.net/kungfupanda/images/e/ec/ZengHoliday.PNG'],
  ['vachir', 'https://static.wikia.nocookie.net/kungfupanda/images/b/b1/Commander_vachir.jpg'],
  ['shen', 'https://static.wikia.nocookie.net/kungfupanda/images/d/d2/ShenKFP2.png'],
  ['wolf-boss', 'https://static.wikia.nocookie.net/kungfupanda/images/b/bd/BossWolf2.jpg'],
  ['storming-ox', 'https://static.wikia.nocookie.net/kungfupanda/images/3/39/StormingOxMain.jpg'],
  ['master-croc', 'https://static.wikia.nocookie.net/kungfupanda/images/d/d9/Croc.jpg'],
  ['thunder-rhino', 'https://static.wikia.nocookie.net/kungfupanda/images/5/5d/ThunderingRhino2.jpg'],
  ['kai', 'https://static.wikia.nocookie.net/kungfupanda/images/8/85/KFP3-promo-kai.jpg'],
  ['li-shan', 'https://static.wikia.nocookie.net/kungfupanda/images/e/e1/Li-shan.jpg'],
  ['bao', 'https://static.wikia.nocookie.net/kungfupanda/images/4/45/Bao-pod.jpg'],
  ['mei-mei', 'https://static.wikia.nocookie.net/kungfupanda/images/3/3d/Mei-Mei.jpg'],
  ['jindiao', 'https://static.wikia.nocookie.net/kungfupanda/images/5/5a/Jindiao_Dragon_form.png'],
  ['zhen', 'https://static.wikia.nocookie.net/kungfupanda/images/1/1f/Zhen.jpg'],
  ['han', 'https://static.wikia.nocookie.net/kungfupanda/images/7/74/Han2.jpg'],
];

function extFromUrl(url, contentType) {
  if (url.includes('.png') || contentType?.includes('png')) return 'png';
  if (url.includes('.webp') || contentType?.includes('webp')) return 'webp';
  return 'jpg';
}

await mkdir(outDir, { recursive: true });
const manifest = {};

for (const [id, baseUrl] of CHARS) {
  const imgUrl = `${baseUrl}${SCALE}`;
  try {
    const res = await fetch(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = extFromUrl(baseUrl, res.headers.get('content-type'));
    const filename = `${id}.${ext}`;
    await writeFile(path.join(outDir, filename), buf);
    manifest[id] = filename;
    console.log(`OK ${id} (${buf.length}b)`);
  } catch (e) {
    console.log(`FAIL ${id}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 200));
}

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Saved', Object.keys(manifest).length, 'avatars');
