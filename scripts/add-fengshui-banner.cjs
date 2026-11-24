'use strict';
const fs = require('fs');

// 1. Añadir traducciones del banner en los 9 idiomas al final de src/i18n/fengshui.ts
const bannerStrings = `
export const fengShuiHomeBanner: Record<Lang, {
  badge: string;
  title: string;
  desc: string;
  cta: string;
}> = {
  es: {
    badge: '風水・家相 • GUÍA DE USO Y UBICACIÓN',
    title: '¿Ya sabes qué figura elegir? Descubre dónde colocarla',
    desc: 'Aprende a orientar tu Maneki-neko en el recibidor (genkan), tu negocio o la esquina Sureste según el Kasō japonés y el Feng Shui.',
    cta: 'Ver guía de Kasō y Feng Shui',
  },
  en: {
    badge: '風水・家相 • PLACEMENT & USAGE GUIDE',
    title: 'Know which figurine to choose? Discover where to place it',
    desc: 'Learn how to orient your Maneki-neko in the entryway (genkan), your shop, or the Southeast corner according to Japanese Kasō & Feng Shui.',
    cta: 'Read Kasō & Feng Shui guide',
  },
  fr: {
    badge: '風水・家相 • GUIDE D’EMPLACEMENT',
    title: 'Vous avez choisi votre figurine ? Découvrez où la placer',
    desc: 'Apprenez à orienter votre Maneki-neko dans l’entrée (genkan), votre boutique ou le coin Sud-Est selon le Kasō japonais et le Feng Shui.',
    cta: 'Voir le guide Kasō et Feng Shui',
  },
  de: {
    badge: '風水・家相 • AUFSTELLUNGS-GUIDE',
    title: 'Wunschfigur gefunden? Erfahren Sie, wo sie hingehört',
    desc: 'So richten Sie Ihre Maneki-neko im Eingangsbereich (Genkan), Geschäft oder Südost-Sektor nach japanischem Kasō & Feng Shui aus.',
    cta: 'Kasō & Feng Shui Guide lesen',
  },
  it: {
    badge: '風水・家相 • GUIDA ALLA POSIZIONE',
    title: 'Sai già quale statuina scegliere? Scopri dove metterla',
    desc: 'Impara a orientare il tuo Maneki-neko all’ingresso (genkan), in negozio o nell’angolo Sud-Est secondo il Kasō giapponese e il Feng Shui.',
    cta: 'Leggi la guida Kasō e Feng Shui',
  },
  pt: {
    badge: '風水・家相 • GUIA DE POSICIONAMENTO',
    title: 'Já sabe qual figura escolher? Descubra onde colocá-la',
    desc: 'Aprenda a orientar seu Maneki-neko na entrada (genkan), na loja ou no canto Sudeste segundo o Kasō japonês e o Feng Shui.',
    cta: 'Ver guia de Kasō e Feng Shui',
  },
  ja: {
    badge: '風水・家相 • 置き場所と飾り方ガイド',
    title: '招き猫が決まったら、次は「正しい置き場所」へ',
    desc: '玄関（家相）やお店のカウンター、風水の東南方位など、ご利益を高める向きと飾り方を分かりやすく解説します。',
    cta: '家相と風水ガイドを見る',
  },
  zh: {
    badge: '風水・家相 • 摆放与方位指南',
    title: '选好招财猫了吗？了解最旺福的摆放位置',
    desc: '结合日本玄关家相传统与风水八卦方位，掌握商铺门口、居家玄关与东南财位的最佳朝向。',
    cta: '查看家相与风水指南',
  },
  ru: {
    badge: '風水・家相 • ГИД ПО РАЗМЕЩЕНИЮ',
    title: 'Уже выбрали фигурку? Узнайте, куда её поставить',
    desc: 'Как правильно сориентировать Манэки-нэко в прихожей (гэнкан), магазине или юго-восточном секторе по японскому Касо и фэн-шуй.',
    cta: 'Открыть гид по Касо и фэн-шуй',
  },
};
`;

let fsFile = fs.readFileSync('src/i18n/fengshui.ts', 'utf8');
if (!fsFile.includes('fengShuiHomeBanner')) {
  fsFile = fsFile.trimEnd() + '\n' + bannerStrings;
  fs.writeFileSync('src/i18n/fengshui.ts', fsFile, 'utf8');
}

// 2. Crear el componente visual src/components/FengShuiHomeBanner.astro
const bannerComponent = `---
import fs from 'node:fs';
import path from 'node:path';
import { useTranslatedPath, type Lang } from '../i18n/ui';
import { fengShuiHomeBanner } from '../i18n/fengshui';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const b = fengShuiHomeBanner[lang];
const translatePath = useTranslatedPath(lang);

const hasHeroImg = fs.existsSync(
  path.join(process.cwd(), 'public', 'images', 'feng-shui', 'hero-genkan.jpg')
);
---

<section aria-label={b.badge} class="max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-2">
  <div class="relative overflow-hidden rounded-2xl border border-[#E5DEC9] bg-white shadow-xs transition-all hover:border-[#C6922C]">
    <div class="h-1 w-full bg-gradient-to-r from-[#8E1323] via-[#C6922C] to-[#161412]"></div>

    <div class="p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
        {hasHeroImg ? (
          <img
            src="/images/feng-shui/hero-genkan.jpg"
            alt={b.title}
            loading="lazy"
            class="w-full sm:w-28 h-32 sm:h-24 rounded-xl object-cover border border-[#E5DEC9] shrink-0"
          />
        ) : (
          <div class="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E5DEC9] flex flex-col items-center justify-center shrink-0 text-[#8E1323]">
            <span class="font-serif text-lg font-bold leading-none">風水</span>
            <span class="text-[9px] font-bold tracking-widest text-stone-500 mt-1">KASŌ</span>
          </div>
        )}

        <div class="space-y-1.5">
          <span class="inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-full bg-[#FAF6F0] border border-[#E5DEC9] text-[#8E1323]">
            {b.badge}
          </span>
          <h2 class="font-serif text-lg sm:text-xl font-bold text-[#161412] leading-snug">
            {b.title}
          </h2>
          <p class="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            {b.desc}
          </p>
        </div>
      </div>

      <a
        href={translatePath('/feng-shui/')}
        class="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#161412] hover:bg-[#8E1323] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
      >
        <span>{b.cta}</span>
        <span aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</section>
`;

fs.writeFileSync('src/components/FengShuiHomeBanner.astro', bannerComponent.trimStart(), 'utf8');

// 3. Insertarlo justo debajo del configurador (antes de #tradicion) en la portada
const candidates = [
  { file: 'src/components/HomePage.astro', importPath: './FengShuiHomeBanner.astro', langExpr: 'lang' },
  { file: 'src/pages/index.astro', importPath: '../components/FengShuiHomeBanner.astro', langExpr: '"es"' },
  { file: 'src/pages/[lang]/index.astro', importPath: '../../components/FengShuiHomeBanner.astro', langExpr: 'lang' },
];

let injected = 0;
for (const c of candidates) {
  if (!fs.existsSync(c.file)) continue;
  let content = fs.readFileSync(c.file, 'utf8');
  if (content.includes('FengShuiHomeBanner')) continue;

  const hasTradicion = content.includes('id="tradicion"');
  const hasConfigurator = /Configurator/i.test(content);
  if (!hasTradicion && !hasConfigurator) continue;

  content = content.replace(
    /^---\r?\n/,
    `---\nimport FengShuiHomeBanner from '${c.importPath}';\n`
  );

  if (hasTradicion) {
    content = content.replace(
      /(<section[^>]*id=["']tradicion["'][^>]*>)/i,
      `<FengShuiHomeBanner lang={${c.langExpr}} />\n\n  $1`
    );
  } else {
    content = content.replace(
      /(<[^>]*Configurator[^>]*\/>)/i,
      `$1\n\n  <FengShuiHomeBanner lang={${c.langExpr}} />`
    );
  }

  fs.writeFileSync(c.file, content, 'utf8');
  console.log('BANNER_INSERTADO_EN:', c.file);
  injected++;
}

if (!injected) {
  console.log('AVISO: Crea el componente listo y añade <FengShuiHomeBanner lang={lang} /> debajo del configurador.');
}
