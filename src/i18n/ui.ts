export const languages = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ru: 'Русский',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'es';
export const showDefaultLang = false;

export const ui = {
  es: {
    'nav.amuleto': 'El Amuleto',
    'nav.evolucion': 'Evolución',
    'nav.leyendas': 'Leyendas',
    'nav.figuras': 'Figuras',
    'footer.desc': 'Archivo cultural, simbólico y artesanal dedicado al gato de la fortuna japonés desde sus orígenes hasta nuestros días.',
    'footer.explore': 'Explorar',
    'footer.traditionTitle': 'Tradición Nipona',
    'footer.traditionText': '«Maneku» (招く) significa invitar a pasar; «Neko» (猫) significa gato. Un símbolo de hospitalidad, prosperidad y protección.',
    'footer.affiliate': 'Algunos enlaces de la sección Figuras participan en programas de afiliación.',
    'banner.text': 'Esta página está disponible en español.',
    'banner.cta': 'Ver en Español',
  },
  en: {
    'nav.amuleto': 'The Amulet',
    'nav.evolucion': 'Evolution',
    'nav.leyendas': 'Legends',
    'nav.figuras': 'Figurines',
    'footer.desc': 'Cultural, symbolic and artisanal archive dedicated to the Japanese lucky cat from its origins to the present day.',
    'footer.explore': 'Explore',
    'footer.traditionTitle': 'Japanese Tradition',
    'footer.traditionText': '“Maneku” (招く) means to beckon; “Neko” (猫) means cat. A symbol of hospitality, prosperity and protection.',
    'footer.affiliate': 'Some links in the Figurines section participate in affiliate programs.',
    'banner.text': 'This site is available in English.',
    'banner.cta': 'Switch to English',
  },
  fr: {
    'nav.amuleto': "L'Amulette",
    'nav.evolucion': 'Évolution',
    'nav.leyendas': 'Légendes',
    'nav.figuras': 'Figurines',
    'footer.desc': 'Archives culturelles, symboliques et artisanales dédiées au chat porte-bonheur japonais de ses origines à nos jours.',
    'footer.explore': 'Explorer',
    'footer.traditionTitle': 'Tradition Japonaise',
    'footer.traditionText': '« Maneku » (招く) signifie inviter à entrer ; « Neko » (猫) signifie chat. Un symbole d’hospitalité, de prospérité et de protection.',
    'footer.affiliate': 'Certains liens de la section Figurines participent à des programmes d’affiliation.',
    'banner.text': 'Ce site est disponible en français.',
    'banner.cta': 'Passer en français',
  },
  de: {
    'nav.amuleto': 'Das Amulett',
    'nav.evolucion': 'Entwicklung',
    'nav.leyendas': 'Legenden',
    'nav.figuras': 'Figuren',
    'footer.desc': 'Kulturelles, symbolisches und kunsthandwerkliches Archiv über die japanische Glückskatze von ihren Ursprüngen bis heute.',
    'footer.explore': 'Entdecken',
    'footer.traditionTitle': 'Japanische Tradition',
    'footer.traditionText': '„Maneku“ (招く) bedeutet hereinwinken; „Neko“ (猫) bedeutet Katze. Ein Symbol für Gastfreundschaft, Wohlstand und Schutz.',
    'footer.affiliate': 'Einige Links im Bereich Figuren nehmen an Partnerprogrammen teil.',
    'banner.text': 'Diese Website ist auf Deutsch verfügbar.',
    'banner.cta': 'Auf Deutsch wechseln',
  },
  it: {
    'nav.amuleto': "L'Amuleto",
    'nav.evolucion': 'Evoluzione',
    'nav.leyendas': 'Leggende',
    'nav.figuras': 'Statuine',
    'footer.desc': 'Archivio culturale, simbolico e artigianale dedicato al gatto della fortuna giapponese dalle origini ai giorni nostri.',
    'footer.explore': 'Esplora',
    'footer.traditionTitle': 'Tradizione Giapponese',
    'footer.traditionText': '«Maneku» (招く) significa invitare a entrare; «Neko» (猫) significa gatto. Un simbolo di ospitalità, prosperità e protezione.',
    'footer.affiliate': 'Alcuni link della sezione Statuine partecipano a programmi di affiliazione.',
    'banner.text': 'Questo sito è disponibile in italiano.',
    'banner.cta': 'Passa all’italiano',
  },
  pt: {
    'nav.amuleto': 'O Amuleto',
    'nav.evolucion': 'Evolução',
    'nav.leyendas': 'Lendas',
    'nav.figuras': 'Figuras',
    'footer.desc': 'Arquivo cultural, simbólico e artesanal dedicado ao gato da sorte japonês desde suas origens até os dias de hoje.',
    'footer.explore': 'Explorar',
    'footer.traditionTitle': 'Tradição Nipônica',
    'footer.traditionText': '«Maneku» (招く) significa convidar a entrar; «Neko» (猫) significa gato. Um símbolo de hospitalidade, prosperidade e proteção.',
    'footer.affiliate': 'Alguns links da seção Figuras participam de programas de afiliados.',
    'banner.text': 'Este site está disponível em português.',
    'banner.cta': 'Mudar para português',
  },
  ja: {
    'nav.amuleto': '招き猫とは',
    'nav.evolucion': '歴史と変遷',
    'nav.leyendas': '伝説と物語',
    'nav.figuras': '招き猫一覧',
    'footer.desc': '日本の縁起物「招き猫」の由来、色彩と手の意味、江戸時代から現代までの歴史を紐解く文化アーカイブ。',
    'footer.explore': 'メニュー',
    'footer.traditionTitle': '日本の伝統',
    'footer.traditionText': '「招く」は福や人を呼び込むこと、「猫」は愛される守り神。おもてなしと繁栄、厄除けの象徴です。',
    'footer.affiliate': '「招き猫一覧」ページの一部のリンクにはアフィリエイトプログラムが含まれています。',
    'banner.text': 'このサイトは日本語でもご覧いただけます。',
    'banner.cta': '日本語に切り替える',
  },
  zh: {
    'nav.amuleto': '招财猫寓意',
    'nav.evolucion': '历史演变',
    'nav.leyendas': '经典传说',
    'nav.figuras': '招财猫图鉴',
    'footer.desc': '致力于日本传统招财猫文化、象征寓意与匠心工艺的档案网站，探索从江户时代至今的演变历程。',
    'footer.explore': '浏览导航',
    'footer.traditionTitle': '日本传统文化',
    'footer.traditionText': '“招”（Maneku）意为邀请与召唤，“猫”（Neko）即猫咪，象征着盛情款待、商业兴隆与辟邪护佑。',
    'footer.affiliate': '“招财猫图鉴”栏目中的部分链接包含联盟推广计划。',
    'banner.text': '本网站提供简体中文版本。',
    'banner.cta': '切换至中文',
  },
  ru: {
    'nav.amuleto': 'Талисман',
    'nav.evolucion': 'Эволюция',
    'nav.leyendas': 'Легенды',
    'nav.figuras': 'Фигурки',
    'footer.desc': 'Культурный и символический архив, посвящённый японскому коту удачи Манэки-нэко от его истоков до наших дней.',
    'footer.explore': 'Разделы',
    'footer.traditionTitle': 'Японская традиция',
    'footer.traditionText': '«Манэку» (招く) означает приглашать, «Нэко» (猫) — кот. Символ гостеприимства, процветания и защиты.',
    'footer.affiliate': 'Некоторые ссылки в разделе «Фигурки» участвуют в партнёрских программах.',
    'banner.text': 'Этот сайт доступен на русском языке.',
    'banner.cta': 'Перейти на русский',
  },
} as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in languages) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, l: Lang = lang) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return !showDefaultLang && l === defaultLang ? cleanPath : `/${l}${cleanPath}`;
  };
}

export function getSwitchLangUrl(url: URL, targetLang: Lang): string {
  const currentLang = getLangFromUrl(url);
  let basePath = url.pathname;
  if (currentLang !== defaultLang) {
    const prefixRegex = new RegExp(`^/${currentLang}(?=/|$)`);
    basePath = basePath.replace(prefixRegex, '') || '/';
  }
  return useTranslatedPath(targetLang)(basePath, targetLang);
}