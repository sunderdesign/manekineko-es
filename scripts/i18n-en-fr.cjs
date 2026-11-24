const fs = require('fs');
const path = require('path');

// 1. Actualizar HomePage.astro para usar leyendas traducidas con respaldo en español
let hp = fs.readFileSync('src/components/HomePage.astro', 'utf8');
hp = hp.replace(
  /const leyendas = \(await getCollection\('leyendas'\)\)\.sort\([\s\S]*?\);/,
  `const allLeyendas = await getCollection('leyendas');
const baseLeyendas = allLeyendas
  .filter((e) => !e.id.includes('/'))
  .sort((a, b) => a.data.order - b.data.order);
const leyendas = baseLeyendas.map((base) => {
  const entry = lang === 'es' ? base : (allLeyendas.find((e) => e.id === \`\${lang}/\${base.id}\`) ?? base);
  return { slug: base.id, data: entry.data };
});`
);
hp = hp.replace(/leyenda\.id/g, 'leyenda.slug');
fs.writeFileSync('src/components/HomePage.astro', hp, 'utf8');

// 2. Actualizar src/pages/[lang]/historia/[...slug].astro
let langHist = fs.readFileSync('src/pages/[lang]/historia/[...slug].astro', 'utf8');
langHist = langHist.replace(
  /export async function getStaticPaths\(\) \{[\s\S]*?\n\}/,
  `export async function getStaticPaths() {
  const allHistorias = await getCollection('historia');
  const baseHistorias = allHistorias.filter((e) => !e.id.includes('/'));
  const langs = (Object.keys(languages) as Lang[]).filter((l) => l !== defaultLang);
  return langs.flatMap((lang) =>
    baseHistorias.map((base) => {
      const entry = allHistorias.find((e) => e.id === \`\${lang}/\${base.id}\`) ?? base;
      return {
        params: { lang, slug: base.id },
        props: { entry, slug: base.id, lang },
      };
    })
  );
}`
);
langHist = langHist.replace(
  /const \{ entry, lang \} = Astro\.props as \{ entry: any; lang: Lang \};/,
  'const { entry, slug, lang } = Astro.props as { entry: any; slug: string; lang: Lang };'
);
langHist = langHist.replace(/entry\.id/g, 'slug');
langHist = langHist.replace(
  /\.map\(\(l: string\) => l\.replace\(\/\^##s\+\(\?:[0-9]\+\.s\*\)\?\/, ''\)\.trim\(\)\)/,
  ".map((l: string) => l.replace(/^##\\s+(?:[0-9]+\\.\\s*)?/, '').trim())"
);
fs.writeFileSync('src/pages/[lang]/historia/[...slug].astro', langHist, 'utf8');

// 3. Actualizar src/pages/[lang]/leyendas/[...slug].astro
let langLey = fs.readFileSync('src/pages/[lang]/leyendas/[...slug].astro', 'utf8');
langLey = langLey.replace(
  /export async function getStaticPaths\(\) \{[\s\S]*?\n\}/,
  `export async function getStaticPaths() {
  const allLeyendas = await getCollection('leyendas');
  const baseLeyendas = allLeyendas
    .filter((e) => !e.id.includes('/'))
    .sort((a, b) => a.data.order - b.data.order);
  const langs = (Object.keys(languages) as Lang[]).filter((l) => l !== defaultLang);
  return langs.flatMap((lang) => {
    const localizedList = baseLeyendas.map((base) => {
      const entry = allLeyendas.find((e) => e.id === \`\${lang}/\${base.id}\`) ?? base;
      return { slug: base.id, entry };
    });
    return localizedList.map((item) => ({
      params: { lang, slug: item.slug },
      props: { entry: item.entry, slug: item.slug, lang, leyendas: localizedList },
    }));
  });
}`
);
langLey = langLey.replace(
  /const \{ entry, lang, leyendas \} = Astro\.props as \{ entry: any; lang: Lang; leyendas: any\[\] \};/,
  'const { entry, slug, lang, leyendas } = Astro.props as { entry: any; slug: string; lang: Lang; leyendas: any[] };'
);
langLey = langLey.replace(/item\.id/g, 'item.slug');
langLey = langLey.replace(/prevLeyenda\.id/g, 'prevLeyenda.slug');
langLey = langLey.replace(/nextLeyenda\.id/g, 'nextLeyenda.slug');
langLey = langLey.replace(/=== entry\.id/g, '=== slug');
langLey = langLey.replace(
  /\.map\(\(l: string\) => l\.replace\(\/\^##s\+\(\?:[0-9]\+\.s\*\)\?\/, ''\)\.trim\(\)\)/,
  ".map((l: string) => l.replace(/^##\\s+(?:[0-9]+\\.\\s*)?/, '').trim())"
);
fs.writeFileSync('src/pages/[lang]/leyendas/[...slug].astro', langLey, 'utf8');

// 4. Asegurar que las rutas raíz en español filtren subcarpetas y limpien ##
for (const [p, col] of [
  ['src/pages/historia/[...slug].astro', 'historia'],
  ['src/pages/leyendas/[...slug].astro', 'leyendas'],
]) {
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes("!e.id.includes('/')")) {
    c = c.replace(
      new RegExp(`await getCollection\\('${col}'\\)`),
      `(await getCollection('${col}')).filter((e) => !e.id.includes('/'))`
    );
  }
  c = c.replace(
    /\.map\(\(l: string\) => l\.replace\(\/\^##s\+\(\?:[0-9]\+\.s\*\)\?\/, ''\)\.trim\(\)\)/,
    ".map((l: string) => l.replace(/^##\\s+(?:[0-9]+\\.\\s*)?/, '').trim())"
  );
  fs.writeFileSync(p, c, 'utf8');
}

// 5. Escribir los 16 artículos traducidos en Inglés (en) y Francés (fr)
const files = {
  "src/content/historia/en/antes-del-gato-dosojin.md": `---
title: "Before the Maneki-neko: Dōsojin, Konsei-sama, and the Commercial Talismans of Pre-Edo Japan"
subtitle: "Long before the cat raised its paw in Tokyo shopfronts, Japanese merchants and travelers entrusted their luck to stone deities and ancestral fertility amulets."
era: "Stage I • 16th Century"
period: "Sengoku Period and Dawn of Edo"
location: "Rural roads and inns of Honshū"
coverImage: "/images/timeline-1-dosojin.jpeg"
coverAlt: "Sacred Dōsojin stones and traditional 16th-century Japanese talismans"
readingTime: "6 min read"
order: 1
summary: "Discover which amulets protected Japanese shops, inns, and trade routes before the birth of the Maneki-neko in the 17th century."
featuredFigure:
  name: "Traditional White Maneki-neko"
  meaning: "The direct heir to the ancient amulets of protection and purity in the Japanese home."
  shopUrl: "/tienda/?color=white&pata=right"
---

When we think of Japanese commerce today, the image is immediate: a ceramic cat sitting beside the cash register, raising a paw to invite customers inside. Yet during the **16th century (Sengoku period)** and the opening decades of the Edo period, the *Maneki-neko* did not yet exist as a commercial talisman.

In that rural Japan undergoing rapid economic transformation, itinerant merchants, innkeepers, tavern owners, and farmers relied on a far more rustic repertoire of Shinto and folk amulets. Understanding which objects once occupied household entrance altars (*kamidana*) and shop thresholds reveals why the lucky cat eventually conquered the country centuries later.

## The Perils of the Road and the Birth of Dōsojin

In the 16th century, traveling across Japan to sell silk, pottery, rice, or tools was a hazardous undertaking. Roads linking the provinces lacked constant patrol, epidemics spread rapidly from village to village, and territorial boundaries were perceived in the Shinto worldview as spiritual frontiers haunted by malevolent spirits (*akuryō*).

To protect both villagers and the merchants passing between settlements, stone stelae known as **Dōsojin** (道祖神, literally *"ancestral deities of the roads"*) were erected at crossroads, bridges, and village entrances.

![Carved Dōsojin stones wearing red bibs at a Japanese crossroads](/images/historia-dosojin-cruce.jpeg)

Carved from volcanic stone or unpolished granite, Dōsojin took several distinct forms:

- **Divine couples carved in relief:** Representing marital harmony, hospitality toward travelers, and the continuity of the community.
- **Pillars inscribed with sacred characters:** Acting as protective boundary markers that prevented calamities from crossing the village threshold.
- **Wayside offerings:** Merchants left small coins, paper-wrapped rice, or worn straw sandals to pray for a safe journey and brisk sales at their destination market.

> "Where two roads cross, trade is born—and with it, uncertainty. The Dōsojin reminds the traveler that no commerce prospers without the blessing of the place that welcomes it."

Intriguingly, many Dōsojin preserved in Nagano, Gunma, and Yamanashi prefectures are dressed today in **red cloth bibs**—the very same protective attribute later inherited by the Maneki-neko's scarlet collar. In Japanese folk tradition, the color red symbolizes vitality and acts as a barrier against illness and misfortune.

## Konsei-sama: Fertility Amulets in Inns and Shops

While Dōsojin guarded the roads outside, inside inns (*hatago*), teahouses, and the earliest urban shops of Kyoto, Osaka, and fledgling Edo (modern Tokyo), another kind of talisman held sway: phallic amulets known as **Konsei-sama** (金精神).

To modern Western eyes this may seem surprising, yet in pre-Meiji Japanese folk Shinto these objects carried no obscene or ribald connotation whatsoever. In an agrarian society where survival depended on harvests and family lineage, biological fertility and economic abundance were understood as expressions of a single life force (*musubi*).

![Traditional Japanese shop altar with shimenawa rope and wooden amulets](/images/historia-konsei-shimenawa.jpeg)

Merchants displayed figures carved from cypress wood, stone, or fired clay near the entrance of their premises with three specific aims:

1. **Multiplying clientele:** Just as seed multiplied grain in the rice paddies, these talismans were believed to draw a steady stream of visitors and buyers.
2. **Protecting the prosperity of the merchant lineage:** Ensuring the business passed from parents to children without ruin or fire.
3. **Sealing good fortune through daily rituals:** Each morning before sliding open the shop doors, the proprietor sprinkled purifying salt (*morijio*) on the threshold and offered a bowl of sake before the amulet.

## Ritual Paraphernalia: Shimenawa Ropes and Purifying Salt

No commercial talisman operated in isolation. Sixteenth-century amulets belonged to a precise ritual aesthetic that marked off the sacred space of the shop from the bustle of the street:

- **Sacred *shimenawa* ropes:** Braided from freshly harvested rice straw and adorned with zigzag-folded white paper strips (*shide*), signaling that the interior of the establishment was purified and under divine protection.
- **Small cones of salt (*morijio*):** Placed in two neat white mounds flanking the doorway—a custom that still survives today outside thousands of restaurants and shops across Japan.
- **Votive *ema* plaques:** Small wooden tablets on which artisan guilds inscribed prayers for prosperity at the turn of each season.

## The Bridge to the 17th Century: When the Cat Relieved the Stone

As the 17th century progressed and the peace of the Tokugawa shogunate spurred the growth of cities and a new urban merchant class (*chōnin*), the aesthetic sensibility of storefronts began to shift. Edo residents sought closer, more narrative, domestic symbols reflecting the daily life of their neighborhoods.

Cats—valued until then chiefly for protecting rice granaries and silkworms from rodents—began starring in miraculous tales set in temples and teahouses. From those chronicles would emerge, beginning in **1615**, the figure destined to inherit the spiritual mantle of Dōsojin and Konsei-sama and become Japan's ultimate good-fortune talisman: the **Maneki-neko**.`,

  "src/content/historia/en/templo-gotokuji-tama.md": `---
title: "Gōtokuji Temple and Tama: The Samurai Legend That Gave Life to the Maneki-neko"
subtitle: "A thunderstorm, a lightning-struck tree, and the saving gesture of a humble white cat laid the foundation for Japan's most iconic commercial amulet."
era: "Stage II • Year 1615"
period: "Early Edo Period"
location: "Setagaya Ward (Edo / Tokyo)"
coverImage: "/images/timeline-2-gotokuji.jpeg"
coverAlt: "Illustration of the white cat Tama in front of Gōtokuji Temple"
readingTime: "7 min read"
order: 2
summary: "Discover how the encounter between a powerful feudal lord and the monk's cat at Gōtokuji Temple forged the original Maneki-neko legend."
featuredFigure:
  name: "White Maneki-neko of Gōtokuji"
  meaning: "True to the legend, it raises its right paw without holding a coin to wish for purity and opportunities to cultivate."
  shopUrl: "/tienda/?color=white&pata=right"
---

The year was **1615**. Japan had just emerged from the turbulent Warring States period (*Sengoku Jidai*) under the unification of the Tokugawa shogunate. The seat of military power had moved to Edo—modern Tokyo—a booming city under frantic construction that would soon become the most populous metropolis in the world.

On the rural fringes of that rising capital, in the district of Setagaya, languished a modest Buddhist temple of the Sōtō Zen school: **Gōtokuji Temple** (豪徳寺). Its head priest, though living in dire poverty, shared the scant rations of food he obtained by begging with his sole companion, a white cat named **Tama**.

Legend tells that one winter night, beside the dying embers of a small brazier, the monk looked at his feline and whispered: *"Tama, if you truly harbor gratitude for the food I share with you, I pray that one day you may bring good fortune to our humble temple."*

## The Falconry Hunt and the Summer Storm

Not long afterward, a party of mounted samurai was riding back through Setagaya from a falconry hunt (*takagari*). Leading the retinue was **Ii Naotaka** (1590–1659), the powerful feudal lord (*daimyō*) of the Hikone domain and a trusted vassal of shōgun Tokugawa Ieyasu himself.

Suddenly, the sky darkened and a violent summer thunderstorm broke out. Seeking shelter from the torrential downpour, Ii Naotaka and his men dismounted beneath a leafy tree near the dilapidated gates of Gōtokuji Temple.

As the feudal lord waited for the squall to pass, he noticed a strange movement beside the temple entrance. There sat Tama, the monk's white cat. Far from being frightened by the thunderclaps or the armed warriors, the feline gazed intently at Ii Naotaka, wiped its face with one paw, and held it aloft in the unmistakable Japanese gesture of **beckoning someone to approach**.

![Ukiyo-e style illustration of Tama the white cat raising its paw in the rain before a samurai](/images/historia-gotokuji-lluvia.jpeg)

Intrigued by the animal's unusual behavior, Ii Naotaka stepped out from under the tree's shelter and walked through the pouring rain toward the temple steps to take a closer look at the cat.

> Scarcely had the samurai stepped away from the trunk when a deafening thunderclap shook the ground and a bolt of lightning struck the very tree beneath which he had stood moments before, shattering it into smoking splinters.

The cat's gesture had not merely invited him inside; **it had saved his life**.

## The Rebirth of Gōtokuji Temple

Rushing to the gates after the crash of thunder, the monk found the samurai outside and invited them to take shelter within the modest temple hall. He served them hot green tea and shared Buddhist teachings while the storm blew over.

Deeply moved by the salvation Tama had granted him and by the serenity and wisdom of the elderly priest, Ii Naotaka made a decision that changed Setagaya's history forever: **he endowed the temple with vast tracts of rice-producing land (*koku*)** and funded its complete reconstruction, establishing it as the exclusive family temple of the mighty Ii clan in Edo.

Gōtokuji was transformed from a crumbling wooden hut into one of the wealthiest and most magnificent sacred complexes in the city—a privileged status it retained throughout the entire Edo period.

## The Birth of Shōfuku-neko-ji

When Tama, the white cat, passed away years later in old age, the monk and local villagers gave him a solemn burial in a cat cemetery inside the temple grounds.

To honor his memory and the miracle that had saved both temple and feudal lord, figures of the cat with its raised paw were commissioned. At Gōtokuji Temple, these statuettes were not given the commercial name Maneki-neko, but were christened **Shōfuku-neko-ji** (招福猫児), meaning *"The Cat That Invites Good Fortune."*

![Offering altar at Gōtokuji Temple filled with thousands of white cat figurines raising their right paw](/images/historia-gotokuji-altar.jpeg)

This name carries a subtle yet fundamental **Buddhist nuance**. Unlike the commercial Maneki-neko that would appear a century later in Tokyo's entertainment quarters, Gōtokuji cats exhibit three unmistakable, non-negotiable traits:

1. **They are always pure white:** Tama's original coat symbolizes purity of heart, spiritual cleanliness, and Buddhist devotion, free of tricolor markings.
2. **They always raise their right paw:** In classical Shinto and Buddhism, the right paw invokes general household fortune and family health, whereas the left is associated more closely with business and customers.
3. **They do not hold a gold coin (Koban):** While commercial Maneki-neko display a large gold medallion on their chest to promise rapid material wealth, Gōtokuji cats carry no money.

The Buddhist reason for this absence of coin is profound: *"The cat raising its paw does not hand you money or success directly; it simply grants you the connection or opportunity ('en' or positive karma). It rests in human hands to seize that opportunity through honest work, effort, and gratitude."*

## Gōtokuji Today

Today, Gōtokuji Temple, tucked away amid the quiet residential streets of Setagaya in Tokyo, is a worldwide pilgrimage destination. Visitors whose wishes are granted or whose ventures succeed thanks to the "opportunity" bestowed return to the temple to donate a new white cat in gratitude.

This centuries-old custom has created the famous visual landscape that defines Gōtokuji in the 21st century: shelves, altars, and temple corners crowded with **tens of thousands of white Shōfuku-neko-ji** of every size, silently watching visitors with their right paw raised, forever commemorating the day thunder and a feline bound together the destiny of a feudal lord and a monk.`,

  "src/content/historia/en/ceramica-imado-usugumo.md": `---
title: "Imado Ceramics: Usugumo, the Pleasure Quarter, and the Commercialization of the Maneki-neko"
subtitle: "From the temples of Setagaya to the pleasure districts of Asakusa: how the lucky cat became a colorful clay craft and won over Edo's merchants."
era: "Stage III • 18th Century"
period: "Cultural Flowering of Edo (Bunka-Bunsei)"
location: "Asakusa District, Edo (Tokyo)"
coverImage: "/images/timeline-3-imado.jpeg"
coverAlt: "Illustration of an antique Imado ceramic figurine of a cat in profile"
readingTime: "6 min read"
order: 3
summary: "Learn the legend of the courtesan Usugumo and discover how the Imado pottery kilns popularized the modern Maneki-neko."
featuredFigure:
  name: "Traditional Clay Maneki-neko"
  meaning: "The original Imado design that united household protection with local commerce."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

If the legend of Gōtokuji Temple (1615) recounts the spiritual birth of the amulet, the 18th century and the cultural maturity of the capital (*Edo*) explain its explosion as a mass phenomenon. The pacification of Japan under Tokugawa rule enabled a vibrant urban merchant culture (*ukiyo*, "the floating world") to flourish, led by shopkeepers, kabuki actors, and courtesans.

It was in the pleasure districts around **Asakusa**, in northeastern Edo, that the Maneki-neko ceased to be the religious relic of a samurai clan and became the brightly painted clay talisman eagerly sought by tavern keepers and shop owners. It all began with another dramatic legend: the story of **Usugumo**.

## The Courtesan Usugumo and Her Guardian Cat

In the mid-Edo period, the Yoshiwara district (near Asakusa) was the epicenter of nocturnal entertainment. There lived and worked **Usugumo** (薄雲), a high-ranking courtesan (*tayū*) celebrated for her beauty, her refinement in poetry, and her boundless devotion to cats.

Her favorite was a large tomcat she raised in luxury and who never left her side under any circumstances. The bond between them was so intense that patrons and teahouse proprietors began to whisper. Rumors soon spread that Usugumo had been "bewitched" (*bakeneko*) by the animal, explaining why she occasionally turned down wealthy guests.

One evening, as Usugumo prepared to receive an affluent patron, the cat began acting frantically. He latched onto the hem of the courtesan's heavy silk kimono, hissing and tugging violently at the fabric, preventing her from taking a single step toward the reception room.

![Ukiyo-e style illustration of the courtesan Usugumo and her cat clinging to her kimono](/images/historia-imado-usugumo.jpeg)

Convinced that the feline was possessed and about to attack his most prized courtesan, the brothel owner drew his short sword and, in a single swift stroke, **decapitated the cat**.

> Yet the animal's severed head did not fall to the floor. Propelled by an uncanny force, it flew up toward the ceiling rafters and sank its fangs into a gigantic **venomous snake** crouched above, poised to strike Usugumo. The cat had never meant to harm her; he had been desperately trying to keep her from walking beneath the serpent to save her life.

Usugumo fell into deep grief over the loss of her savior and protector, refusing food and visitors alike. To console her mourning, one of her regular patrons visited a skilled potter at the nearby Imado kilns and commissioned a handsome clay statuette modeled in the likeness of her lost cat. Usugumo was deeply touched by the gift, and her story moved the Yoshiwara quarter so profoundly that soon everyone wanted a replica of that faithful guardian cat.

## The Imado Kilns: Cradle of the Marushime-neko

The legend of Usugumo sparked surging demand in the neighboring district of **Imado**, an area along the Sumida River renowned for its low-fired earthenware kilns (*Imado-yaki*). Potters who had previously produced roof tiles and everyday bowls seized the commercial opportunity and began crafting small hand-painted clay cat figurines in large numbers for pilgrims.

These earliest commercial clay figurines were sold within the precincts of **Imado Shrine (Imado Jinja)** and at Asakusa's famous Sensō-ji Temple. They were originally known as **Marushime-neko** (丸〆猫).

![Antique woodblock print showing Imado ceramic figurines sold around Asakusa](/images/historia-imado-puesto.jpeg)

The aesthetic of those early Imado cats differed noticeably from the plump, front-facing Maneki-neko we know today. Classic 18th-century Imado features included:

- **Profile posture:** The cat was typically sculpted seated sideways while turning its head toward the viewer.
- **The "Marushime" symbol (㋡):** Painted on the cat's back was a circle enclosing the hiragana syllable *"shime"*, signifying *"gathering good fortune in a rounded, complete whole."*
- **Traditional attire:** They invariably wore a prominent painted **red silk bib (*yodarekake*) and a bell**, a luxury wealthy Edo owners placed on real pet cats to keep them from getting lost.

## Hiroshige's Woodblock Print and the Old Woman's Dream

The transition of Imado cats from local charm to iconic city emblem was documented in 1852. That year, legendary *ukiyo-e* woodblock master **Utagawa Hiroshige** published his print *"Thriving Prosperity of the Jōruri-machi District,"* explicitly depicting a stall selling *Marushime-neko* figurines—the **oldest confirmed visual record** of a commercialized lucky cat.

That very same year, 1852, another story swept through the alleys of Asakusa and cemented the fame of the local kilns. An impoverished elderly woman, forced by hunger to abandon her beloved cat, wept bitterly as she left it in the street. That night, the cat appeared to her in a dream and said: *"Old woman, if you mold my likeness in clay, I will bring you great fortune."*

She began shaping cats from leftover Imado clay and selling them outside the gates of Sensō-ji Temple. The figurines proved so popular that they lifted her out of poverty overnight, inspiring every shop and teahouse in the city to buy its own clay cat. The **commercial Maneki-neko** had truly been born.`,

  "src/content/historia/en/era-meiji-revolucion-comercial.md": `---
title: "The Meiji Era and the Commercial Revolution: How an 1872 Ordinance Crowned the Maneki-neko"
subtitle: "With Japan's opening to the world and Tokyo's urban modernization, ancient fertility amulets were banned and the lucky cat took their place in every shop."
era: "Stage IV • 1868 – 1912"
period: "Meiji Restoration"
location: "Tokyo, Osaka, and commercial ports of Japan"
coverImage: "/images/timeline-4-meiji.jpeg"
coverAlt: "Traditional Japanese shop during the Meiji Era with a Maneki-neko at the entrance"
readingTime: "6 min read"
order: 4
summary: "Discover how Meiji Era modernization laws outlawed older phallic talismans and catapulted the koban-holding Maneki-neko to national fame."
featuredFigure:
  name: "Golden Maneki-neko of Prosperity"
  meaning: "Inspired by the commercial boom of the Meiji Era, combining the call to success with the gold koban coin."
  shopUrl: "/tienda/?color=gold&pata=right"
---

In **1868**, Japan ended more than two and a half centuries of isolation under the Tokugawa shogunate and embarked on a dizzying transformation known as the **Meiji Restoration**. Within a few decades, former feudal cities like Edo—renamed **Tokyo**—welcomed railways, telegraphs, gas streetlamps, daily newspapers, and brisk international trade.

That modernization drive (*Bunmei Kaika*, "Civilization and Enlightenment") reshaped not only the nation's architecture and economy, but also storefront aesthetics and the everyday beliefs of Japanese merchants. It was precisely at this crossroads of tradition and modernity that the **Maneki-neko** made its decisive leap from local folk craft to national emblem of commerce.

## The 1872 Ordinances and Farewell to Ancient Amulets

Throughout the Edo period, inns, teahouses, taverns, and neighborhood shops had displayed traditional fertility and abundance talismans known as **Konsei-sama** (金精神) beside their entrances. To Japanese merchants, these were sacred emblems of prosperity, bountiful harvests, and multiplying clientele.

However, with the arrival of foreign diplomats, engineers, and travelers in ports such as Yokohama, Kobe, and Tokyo, the new imperial government became determined to project an image of a modern, decorous nation to the West. In **1872 (the fifth year of Meiji)**, strict urban morality ordinances (*Ishiki Kaii Jōrei*) were enacted, prohibiting the public display in streets or shopfronts of any phallic object or item deemed improper by Victorian standards of the day.

![Ukiyo-e style illustration of a Meiji Era merchant removing old wooden amulets and placing a Maneki-neko at his shop entrance](/images/historia-meiji-ordenanza.jpeg)

Overnight, thousands of merchants in Tokyo and Osaka faced a spiritual and practical dilemma: they had to remove their ancestral amulets from public view, yet no Japanese shopkeeper was willing to open for business each morning without a protective talisman beside the door.

> "The law could remove carved stone and wood from the shopfront, but it could not extinguish the merchant's need to invoke good fortune at the threshold of the store."

The answer emerged organically across Tokyo's commercial districts: the **Maneki-neko**. It was charming, refined, unmistakably Japanese, and wholly innocent in the eyes of foreign visitors, while preserving every ounce of symbolic welcome and prosperity.

## The Addition of the Koban Coin and New Commercial Iconography

As it became the official successor to older abundance talismans, the Maneki-neko's design underwent a decisive evolution during the Meiji Era. Artisans in Tokyo and Seto le dotaron—endowing it with attributes explicitly linked to money and business success:

- **The gold *Koban* coin:** It became standard to depict the cat holding a large oval Edo-period gold coin against its chest, typically inscribed with the characters **«Senman Ryō»** (千万両, *"ten million gold pieces"*), a hyperbolic sum symbolizing inexhaustible wealth.
- **Distinction between left and right paws:** During this era, commercial lore codified the difference between the **raised left paw** (ideal for restaurants, theaters, teahouses, and shops seeking a steady stream of customers) and the **raised right paw** (favored by moneychangers, wholesalers, and households praying for direct financial fortune).
- **Calico tricolor coat (*Mi-ke*):** The white coat with black and orange patches—genetically rare in male Japanese cats—established itself as the most coveted finish, regarded as a bearer of extraordinary luck.

![Ukiyo-e style illustration of a Meiji Era Maneki-neko holding a golden Koban coin on a shop counter](/images/historia-meiji-koban.jpeg)

## From Tokyo Across the Archipelago via Rail and Press

The rise of the Maneki-neko in the Meiji Era coincided with the expansion of the national railway network and the birth of modern department stores (*hyakkaten*). Provincial merchants traveling to Tokyo to source goods returned home carrying lucky cat figurines as souvenirs and talismans for their own establishments.

Illustrated newspapers (*nishiki-e shinbun*) and late-19th-century advertising posters likewise adopted the silhouette of the cat with raised paw as a visual cue for special offers, grand openings, and thriving businesses.

In less than three decades, what had begun as a pious legend in Setagaya and popular earthenware in Asakusa had become the **universal symbol of Japanese entrepreneurship and commercial hospitality**, setting the stage for industrial production and global conquest in the 20th century.`,

  "src/content/historia/en/tokoname-icono-mundial.md": `---
title: "Tokoname and the Conquest of the World: The Birth of the Modern Maneki-neko"
subtitle: "In the pottery kilns of Aichi Prefecture was born the rounded, colorful design that welcomes visitors into shops and homes across five continents today."
era: "Stage V • 20th Century – Today"
period: "Shōwa Era to the Present"
location: "Tokoname (Aichi) and international expansion"
coverImage: "/images/timeline-5-tokoname.jpeg"
coverAlt: "Modern Tokoname-style ceramic Maneki-neko with glossy finishes"
readingTime: "6 min read"
order: 5
summary: "Learn how master ceramists in Tokoname created the modern mold of the Maneki-neko and how the amulet became a global pop icon."
featuredFigure:
  name: "Classic Tricolor Maneki-neko"
  meaning: "The iconic Tokoname design with a Mi-ke coat uniting supreme fortune, customers, and protection."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

When anyone in Madrid, New York, Paris, or Bangkok pictures a **Maneki-neko** today, the figure that comes to mind has very specific proportions: a plump, friendly body, a large rounded head, perked ears, eyes curved into a serene smile, and a vibrant ceramic glaze.

That design, which feels timeless today, did not exist in the 18th century or the Meiji Era. It was born in the mid-**20th century (Shōwa era)** in a coastal city of Aichi Prefecture celebrated for more than a thousand years of pottery tradition: **Tokoname** (常滑).

## The Workshops of Tokoname and the Modern Cat Mold

Tokoname is one of the *Rokkoyō*—the Six Ancient Kilns of Japan—historically famous for its red clay teapots (*kyūsu*) and large stoneware jars. After World War II, during Japan's economic reconstruction, local artisans sought new decorative wares that would stimulate trade and bring good omens to homes and businesses reopening their doors.

In the late 1940s and early 1950s, master modelers in Tokoname stylized the slender antique figurines of Edo and Imado to create the **Tokoname style** (*Tokoname-kei*):

- **Early *kawaii* proportions:** They rounded the torso and enlarged the head to convey warmth, sweetness, and immediate optimism.
- **Expressive hand-painting:** Specialized painters brushed on the whiskers, arched eyebrows, golden bell, and *koban* coin inscription with unmistakable graphic clarity.
- **Plaster-mold casting (*ikomi*):** This technique preserved the artisanal quality of hand-painted finishes while supplying surging demand across all of Japan.

![Ukiyo-e style illustration of a master artisan in a Tokoname workshop hand-painting ceramic Maneki-neko figurines](/images/historia-tokoname-taller.jpeg)

Within a few decades, Tokoname came to produce roughly **80% of all traditional ceramic Maneki-neko in Japan**, rightfully earning the title of world capital of the lucky cat.

## The Explosion of Colors: A Talisman for Every Wish

Until the mid-20th century, the vast majority of Maneki-neko were white, tricolor (*Mi-ke*), or black. Yet as the century progressed and theories of spatial harmony and color symbolism gained popularity across Asia, Tokoname workshops introduced a full palette of glossy glazes in which each hue answered a specific aspiration:

1. **Gold and yellow:** Financial wealth, business success, and economic stability.
2. **Red and pink:** Health, vitality, protection of children, love, and romantic relationships.
3. **Green and blue:** Academic focus, wisdom, mental serenity, and safe travel.
4. **Purple:** Longevity, nobility, and artistic inspiration.

This chromatic diversity transformed the amulet: no longer confined to shops and restaurants, it became a popular gift for graduations, weddings, housewarmings, and the launch of personal ventures of every kind.

## Global Conquest and Tokonyan

From the 1970s and 1980s onward—propelled by Asian commercial diasporas, the rise of Japanese restaurants in the West, and Japanese pop culture—the Maneki-neko crossed every ocean. In the 1990s, battery- and solar-powered versions featuring a continuously waving paw also became worldwide favorites.

![Ukiyo-e style illustration of the Tokoname promenade with ceramic Maneki-neko sculptures and the giant Tokonyan head](/images/historia-tokoname-paseo.jpeg)

Today, in the city of Tokoname itself, visitors can stroll along the famous **Maneki-neko Street** (*Maneki-neko Dōri*), a wall adorned with dozens of ceramic sculptures crafted by local artists and crowned by **Tokonyan**, a monumental Maneki-neko head nearly four meters tall watching over the town from above.

From humble *Dōsojin* stones at 16th-century crossroads to contemporary display cases across the globe, the Maneki-neko has reinvented itself in every age without ever losing its core message: **opening the door with hospitality, gratitude, and hope for good fortune**.`,

  "src/content/leyendas/en/templo-gotokuji-tama.md": `---
title: "The Miracle of Tama at Gōtokuji Temple"
subtitle: "How a humble white cat saved feudal lord Ii Naotaka from a lightning bolt in 1615 and gave birth to the Maneki-neko."
era: "Year 1615 • Edo Period"
location: "Setagaya, Tokyo"
coverImage: "/images/leyenda-gotokuji.jpeg"
coverAlt: "The white cat Tama in front of Gōtokuji Temple"
readingTime: "7 min read"
isOriginal: true
order: 1
summary: "The founding chronicle of the Maneki-neko: a poor monk, a cat named Tama, and a thunderstorm that changed the destiny of Gōtokuji Temple."
chapters:
  - act: "Act I • Devotion"
    title: "The Humble Monk and His Only Companion, Tama"
    summary: "In a ruined temple in Setagaya, an elderly monk shares his meager daily rice with his white cat."
  - act: "Act II • The Storm"
    title: "A Sudden Thunderstorm on the Roads of Setagaya"
    summary: "Feudal lord Ii Naotaka and his samurai take shelter beneath a giant cedar during a downpour."
  - act: "Act III • The Miracle"
    title: "The Gesture That Stopped Death"
    summary: "Tama raises his right paw to beckon the samurai seconds before lightning shatters the tree."
  - act: "Act IV • The Legacy"
    title: "The Rebirth of the Temple and the Altar of Shōfuku-neko-ji"
    summary: "In gratitude, Naotaka rebuilds Gōtokuji, giving rise to thousands of white figurines inviting good fortune."
featuredFigure:
  name: "White Maneki-neko of Gōtokuji"
  meaning: "Raises its right paw without a koban coin to attract pure opportunities and good fortune to the home."
  shopUrl: "/tienda/?color=white&pata=right"
---

On the rural outskirts of old Edo—the city that centuries later would be renamed Tokyo—amid rice paddies, bamboo groves, and packed-earth roads in the district of Setagaya, stood a small Buddhist monastery of the Sōtō Zen school known today as **Gōtokuji Temple** (豪徳寺).

At the dawn of the **17th century (around the year 1615)**, when the Tokugawa shogunate had only just pacified Japan after decades of civil war, that temple had fallen into deep decline. Rain leaked through its wooden roofs, dampness had frayed its tatami mats, and alms from neighboring farmers barely sufficed to light a handful of charcoal on freezing winter nights.

## 1. The Humble Monk and His Only Companion, Tama

The elderly abbot of the temple lived entirely alone, devoted to meditation and tending the altar, with no companion other than an amber-eyed white cat he had taken in as an abandoned kitten beside the road. He had named him **Tama**.

Even on days when the priest gathered barely a bowl of boiled rice and thin broth on his begging rounds, he never touched a bite without first placing half in a small wooden dish for his feline.

![The elderly Buddhist monk sharing his humble bowl of rice with the white cat Tama in winter](/images/leyenda-tama-1-monje.jpeg)

Oral tradition passed down in Setagaya tells that one particularly bitter night, as snow fell silently outside the translucent paper sliding doors (*shōji*), the monk gazed at the dying brazier and spoke aloud to his cat, as one confides a secret to an old friend:

> "Tama, we both know this temple barely stands. I will never reproach you for our poverty, for your company alone brightens my days; yet if ever you feel gratitude for this humble roof and the little rice we share, I pray you may bring a measure of good fortune to our sanctuary."

The cat blinked slowly, tilted his head, and curled up beside the old man's patched robe.

## 2. A Sudden Thunderstorm on the Roads of Setagaya

Months later, on a sultry summer afternoon, an armed retinue was riding back toward Edo after a day of falconry (*takagari*) in the nearby fields. At its head rode **Ii Naotaka** (1590–1659), the mighty feudal lord (*daimyō*) of the Hikone domain and one of shōgun Tokugawa Ieyasu's closest military strategists.

Without warning, the sky over Setagaya turned black with storm clouds. A chill gust shook the tops of the cedars and, within seconds, a torrential electrical storm broke loose, turning the dirt paths into impassable quagmires.

![Feudal lord Ii Naotaka and his samurai caught in the storm beside a giant cedar in front of the temple](/images/leyenda-tama-2-tormenta.jpeg)

Soaked to the bone and blinded by lightning flashes, Ii Naotaka and his retainers dismounted and sought shelter beneath the dense canopy of a towering centuries-old cedar growing a few paces from the weathered entrance of Gōtokuji Temple.

## 3. The Gesture That Stopped Death

As the samurai waited in silence for the downpour to ease, Ii Naotaka lifted his gaze toward the wooden temple gate. There, seated on the threshold beneath the eaves, was **Tama**.

Unlike any stray animal that would have fled in terror at the roar of thunder and the glint of armor, the white cat kept his amber eyes fixed squarely on the feudal lord. Suddenly, he lifted his right paw above his ear and moved it gently back and forth in the unmistakable Japanese gesture used to beckon someone inside.

![The white cat Tama raising his right paw to call the samurai as lightning splits the tree behind him](/images/leyenda-tama-3-rayo.jpeg)

Curiosity and wonder overcame the warrior's caution. *"Is that cat beckoning me toward the temple?"* Naotaka murmured. He stepped out from beneath the cedar and walked through the curtain of rain toward the stone steps where Tama waited.

Scarcely had the feudal lord taken a few steps away from the trunk when a blinding flash lit up the entire valley and a deafening thunderclap shook the earth: **a bolt of lightning struck the giant cedar square on**, splitting the tree beneath which they had sheltered moments before into smoking splinters.

Had he not heeded the white cat's call, Ii Naotaka and his escort would have perished on the spot.

## 4. The Rebirth of the Temple and the Altar of Shōfuku-neko-ji

Hearing the crash, the elderly monk hurried to the entrance and welcomed the lord of Hikone with calm hospitality, offering warm green tea and Buddhist conversation until the skies cleared once more.

Deeply moved to realize that the humble monastery's cat had saved his life, Ii Naotaka resolved to repay that miracle many times over: he donated vast expanses of rice fields (*koku*) to ensure the monks' perpetual sustenance, financed the complete reconstruction of the wooden halls, and designated Gōtokuji as the **official family funerary temple (*bodaiji*) of the Ii clan** in Edo.

![Gōtokuji Temple rebuilt in full splendor with blooming cherry trees and an altar of white Tama figurines](/images/leyenda-tama-4-templo.jpeg)

When Tama died years later after a long and peaceful life, the monk dedicated an honorary grave to him inside the sacred compound and commissioned his likeness with raised right paw under the name **Shōfuku-neko-ji** (招福猫児, *"the cat that invites good fortune"*).

Ever since, visitors from across Japan have come to Gōtokuji to take home one of these white figurines—which never hold a *koban* coin, for Zen tradition teaches that the cat opens the door of opportunity, yet human effort must cultivate it—and return to place them on the altar when their wishes come true, forming a silent sea of thousands of white cats that keep Tama's memory alive.`,

  "src/content/leyendas/en/anciana-imado-suenos-arcilla.md": `---
title: "Usugumo and the Guardian Cat of Yoshiwara"
subtitle: "The tragic and miraculous story of the Asakusa courtesan whose tricolor cat gave its life to save her and inspired Imado ceramic figurines."
era: "18th Century • Edo Period"
location: "Yoshiwara and Asakusa, Tokyo"
coverImage: "/images/leyenda-usugumo.jpeg"
coverAlt: "Guardian cat watching from the rooftops of Yoshiwara"
readingTime: "7 min read"
isOriginal: false
order: 2
summary: "In the nocturnal splendor of Yoshiwara, the loyal tricolor cat of courtesan Usugumo saved her from a deadly serpent, inspiring the first commercial figurines of Imado."
chapters:
  - act: "Act I • Yoshiwara"
    title: "The Courtesan of Yoshiwara and Her Inseparable Companion"
    summary: "In 18th-century Edo, the celebrated Usugumo lives devoted to a large amber-eyed tricolor cat."
  - act: "Act II • The Warning"
    title: "The Night the Cat Held Back Her Kimono"
    summary: "The feline clings fiercely to the silk hem of Usugumo's kimono to keep her from crossing the corridor."
  - act: "Act III • The Sacrifice"
    title: "The Blade's Edge and the Danger Hidden in the Rafters"
    summary: "The cat leaps toward the ceiling and slays a venomous serpent lying in wait above the courtesan."
  - act: "Act IV • Imado-yaki"
    title: "Solace from the Imado Kilns and Saihō-ji Temple"
    summary: "An admirer commissions a clay replica from Imado that soon captivates the shops of Asakusa."
featuredFigure:
  name: "Protective Tricolor Maneki-neko"
  meaning: "Heir to Usugumo's brave tricolor cat, uniting supreme fortune, protection from danger, and customers."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

In the mid-**18th century**, when Edo—modern Tokyo—bustled as a metropolis of over a million inhabitants, the capital's cultural and nocturnal life revolved around the famed **Yoshiwara** district, beside the historic quarter of **Asakusa**. Amid lantern-lit pavilions, teahouses (*ageya*), *shamisen* masters, and poets of the "floating world" (*ukiyo*), shone a high-ranking courtesan (*tayū*) named **Usugumo** (薄雲).

Celebrated as much for her sartorial grace as for her mastery of calligraphy, the tea ceremony, and classical verse, Usugumo harbored an unshakable devotion to cats. Among all the felines that had passed through her chambers, one held a special place in her heart: a **large amber-eyed tricolor (*mi-ke*) cat** whom she tended with utmost care and who never left her side.

## 1. The Courtesan of Yoshiwara and Her Inseparable Companion

While other ladies of the quarter collected tortoiseshell combs, painted fans, or imported bolts of silk, Usugumo spent her leisure hours brushing her cat's coat, feeding him from lacquered bowls, and speaking softly to him behind sliding wood-and-paper screens (*shōji*).

![Usugumo stroking her faithful tricolor cat in her Yoshiwara parlor](/images/leyenda-usugumo-1-salon.jpeg)

Such unusual intimacy soon sparked gossip among servants and teahouse patrons. In Edo-period Japanese folklore there existed a belief in *bakeneko*—supernatural cats capable of bewitching humans—and more than one guest whispered that Usugumo's feline had cast a spell over her, for she occasionally declined banquets with wealthy nobles on the grounds that her cat was restless.

## 2. The Night the Cat Held Back Her Kimono

On a humid summer night, a wealthy merchant reserved the main hall of the teahouse for a private banquet in Usugumo's honor. Dressed in her finest crimson silk kimono embroidered with golden cranes, the courtesan stepped into the wooden corridor leading toward the guest room.

Hardly had she taken a few steps when the tricolor cat planted himself in her path with arched back and a piercing cry. Far from stepping aside, **he sank his claws into the heavy silk hem of her kimono** and pulled backward with all his strength, preventing her from advancing toward the sliding door.

![The tricolor cat gripping Usugumo's kimono firmly in the lantern-lit corridor](/images/leyenda-usugumo-2-kimono.jpeg)

Surprised by such fierce behavior in an ordinarily gentle animal, Usugumo tried to soothe him by stroking his head, yet the feline returned again and again to clutch the fabric as though his very life depended on halting her on that exact threshold.

## 3. The Blade's Edge and the Danger Hidden in the Rafters

Alerted by the commotion in the corridor, the teahouse proprietor hurried out. Seeing the large cat forcibly restraining his most prestigious courtesan before an important guest, he gave credence to neighborhood superstitions and assumed the animal was possessed and about to attack her.

Without a second thought, the man drew his short sword (*wakizashi*) and struck a swift blow at the feline.

> In that miraculous instant, the cat made a superhuman leap toward the dark ceiling beams directly above the doorway through which Usugumo was about to pass, and **sank his fangs into the neck of a gigantic venomous snake** coiled in ambush, ready to strike the courtesan.

![The loyal cat leaping toward the ceiling rafters to defeat the venomous serpent threatening Usugumo](/images/leyenda-usugumo-3-serpiente.jpeg)

The viper fell lifeless onto the tatami beside the faithful guardian, who had given his last breath to protect his mistress. The teahouse owner let his sword drop to the floor, overcome with remorse as he realized that the creature he had judged bewitched had just saved Usugumo's life.

## 4. Solace from the Imado Kilns and Saihō-ji Temple

For weeks, Usugumo observed silent mourning. She had her brave companion buried with honors at nearby **Saihō-ji Temple** in Asakusa—where for generations a monument known as *Neko-zuka* ("the Cat's Tomb") stood—and withdrew to her chambers, unable to recover her spirits.

Moved by her sorrow, one of her most devoted admirers visited the master potters of the neighboring **Imado** district on the banks of the Sumida River and commissioned a fired-clay statuette faithfully capturing the likeness of that tricolor cat, adorned with a protective red bib and one paw raised in greeting and shelter.

![Usugumo tenderly receiving the Imado ceramic figurine of her tricolor cat](/images/leyenda-usugumo-4-imado.jpeg)

When Usugumo opened the wooden box and beheld the figure, a serene smile finally lit up her face. Word of the Yoshiwara cat's sacrifice spread swiftly across Asakusa: neighbors and shopkeepers began flocking to the **Imado pottery** workshops and **Imado Jinja** shrine to acquire replicas of that *Marushime-neko*, convinced that a cat willing to give its life for its mistress was the mightiest amulet for guarding the home and attracting good fortune.`,

  "src/content/leyendas/en/cortesana-usugumo-eko-in.md": `---
title: "The Old Woman of Imado and the Dream of Sensō-ji"
subtitle: "Forced by destitution to part with her beloved cat in 1852, a humble woman of Asakusa received in a dream the clay secret that lifted them both from poverty."
era: "Year 1852 • Edo Period"
location: "Imado and Asakusa, Tokyo"
coverImage: "/images/leyenda-imado.jpeg"
coverAlt: "The old woman of Imado sculpting clay cat figurines"
readingTime: "7 min read"
isOriginal: false
order: 3
summary: "The celebrated 1852 legend explaining how humble Imado clay cats conquered the gates of Sensō-ji Temple and became Edo's beloved folk amulet."
chapters:
  - act: "Act I • The Farewell"
    title: "A Rice-less Winter Beside the Sumida River"
    summary: "Poverty forces a kind-hearted old woman of Imado to part sorrowfully with her inseparable cat."
  - act: "Act II • The Revelation"
    title: "The Cat's Message in a Dream"
    summary: "That very night, the feline appears in her dream bearing a promise of prosperity shaped in clay."
  - act: "Act III • The Craft"
    title: "Molding Good Fortune from Imado Clay"
    summary: "At dawn, the woman sculpts and hand-paints small cat figurines with one paw raised."
  - act: "Act IV • The Miracle"
    title: "Crowds Before the Gates of Sensō-ji"
    summary: "Her clay cats sell out every day in Asakusa, giving birth to Edo's first commercial talismans."
featuredFigure:
  name: "Yellow Maneki-neko of Stability"
  meaning: "Inspired by the everyday miracle of the old woman of Imado, encouraging livelihood, savings, and household prosperity."
  shopUrl: "/tienda/?color=yellow&pata=left"
---

The year was **1852** (*the fifth year of the Kaei era*), in the twilight of the Edo period. Along the banks of the Sumida River, close to the ancient pottery kilns of **Imado** and the bustling sacred precincts of **Sensō-ji Temple** in Asakusa, lived an elderly widow in a small wooden cottage, known throughout the neighborhood for her gentle nature and generous heart.

For years, her sole companion had been a small white cat with tricolor patches and a bobbed tail whom she had raised since he was barely a kitten. Though times were hard, the woman always found a way to share a few morsels of dried fish or warm rice with him at dusk.

## 1. A Rice-less Winter Beside the Sumida River

Following a string of poor harvests and a sharp surge in the price of grain in Edo, however, the old woman fell ill and spent her very last copper coin. One evening came when the wooden chest where she stored rice stood completely empty and the brazier held scarcely a handful of cold ashes.

With a heavy heart, she realized that if her cat remained beneath her roof, he would starve alongside her.

![The old woman of Imado sadly stroking her cat beside the empty rice chest](/images/leyenda-anciana-1-pobreza.jpeg)

Gently stroking his back one final time, she spoke in a voice choked with tears:

> "Forgive me, little companion. I have not a single grain of rice left to offer you. Go toward the streets near the temple, where merchants and pilgrims always drop scraps of food, and find a home where you may live without hunger."

With deep sorrow, she slid open the wooden door and let him slip out into the twilight lane, returning to her worn tatami amid quiet sobs.

## 2. The Cat's Message in a Dream

That same night, as silvery moonlight filtered through the translucent paper of the *shōji* doors, the old woman drifted off, exhausted by fatigue and grief. In the stillness of the night, she had a dream so vivid it felt entirely real.

Her beloved cat appeared seated beside her wooden pillow, bathed in a warm, serene glow. He raised his right paw in a gentle beckoning gesture and spoke clearly:

> "Weep no more for me, dear grandmother. Take a little clay from the kilns of Imado, mold my likeness seated with one paw raised, and paint it with care. If you carry those figures to the gates of Sensō-ji Temple, good fortune will soon knock at your door."

![The cat appearing in a dream to the sleeping old woman to show her his clay figurine](/images/leyenda-anciana-2-sueno.jpeg)

Waking at first light of dawn, the old woman felt an unexpected calm in her chest. She remembered every detail of the posture, the smiling curve of the eyes, and the small red bib she had seen in her dream.

## 3. Molding Good Fortune from Imado Clay

Without wasting a moment, she walked over to the neighboring **Imado-yaki** workshops, where the potters gladly gave her several lumps of leftover clay along with red, black, and gold mineral pigments.

Seated on the wooden threshold of her cottage in the morning sun, the woman began sculpting with her own hands small figurines of seated cats, one paw raised beside the ear in invitation and a kindly expression that seemed to smile at all who beheld them.

![The old woman molding and hand-painting clay cat figurines on her Imado veranda](/images/leyenda-anciana-3-arcilla.jpeg)

After firing the pieces in the neighborhood communal kiln, she used a fine bamboo brush to paint the whiskers, golden bell, and coat markings she knew so well.

## 4. Crowds Before the Gates of Sensō-ji

The next morning, the old woman spread a straw mat beside the approach path to **Sensō-ji Temple** in Asakusa and arranged her first dozen clay cats on a small wooden stand.

The natural charm of those figurines instantly captivated pilgrims, artisans, and teahouse proprietors passing by. Before noon every single one had sold, and the following day a small crowd was already waiting at dawn to obtain a lucky cat of their own.

![The old woman selling her clay cats in front of Sensō-ji Temple surrounded by Edo townsfolk](/images/leyenda-anciana-4-sensoji.jpeg)

Through that humble craft, the old woman not only escaped destitution forever and welcomed her faithful cat back home, but also sparked the popular craze for **Imado clay cats**—immortalized that very year of 1852 in the *ukiyo-e* woodblock prints of master Utagawa Hiroshige and enshrined forever as one of the founding legends of the Maneki-neko.`,

  "src/content/historia/fr/antes-del-gato-dosojin.md": `---
title: "Avant le Maneki-neko : Dōsojin, Konsei-sama et les talismans commerciaux du Japon pré-Edo"
subtitle: "Bien avant que le chat ne lève la patte dans les vitrines de Tokyo, les marchands et voyageurs japonais confiaient leur chance à des divinités de pierre et des amulettes ancestrales de fertilité."
era: "Étape I • XVIe siècle"
period: "Période Sengoku et aube d'Edo"
location: "Routes rurales et auberges de Honshū"
coverImage: "/images/timeline-1-dosojin.jpeg"
coverAlt: "Pierres sacrées Dōsojin et talismans traditionnels japonais du XVIe siècle"
readingTime: "6 min de lecture"
order: 1
summary: "Découvrez quelles amulettes protégeaient les boutiques, auberges et routes commerciales du Japon avant la naissance du Maneki-neko au XVIIe siècle."
featuredFigure:
  name: "Maneki-neko Blanc Traditionnel"
  meaning: "L'héritier direct des anciennes amulettes de protection et de pureté du foyer japonais."
  shopUrl: "/tienda/?color=white&pata=right"
---

Lorsque l'on évoque aujourd'hui le commerce japonais, une image s'impose aussitôt : un chat en céramique assis près de la caisse, levant une patte pour inviter les clients à entrer. Pourtant, au **XVIe siècle (période Sengoku)** et aux tout débuts de l'époque d'Edo, le *Maneki-neko* n'existait pas encore en tant que talisman commercial.

Dans ce Japon rural en pleine mutation économique, marchands ambulants, aubergistes, tenanciers de tavernes et paysans s'en remettaient à un répertoire d'amulettes shintoïstes et populaires bien plus rustique. Comprendre quels objets occupaient alors les autels d'entrée (*kamidana*) et les seuils des échoppes permet de saisir pourquoi le chat porte-bonheur a fini par conquérir tout le pays des siècles plus tard.

## Les dangers des routes et la naissance des Dōsojin

Au XVIe siècle, parcourir le Japon pour vendre de la soie, de la céramique, du riz ou des outils était une entreprise périlleuse. Les routes reliant les provinces manquaient de surveillance régulière, les épidémies se propageaient rapidement d'un village à l'autre et les limites territoriales étaient perçues, dans la cosmologie shinto, comme des frontières spirituelles hantées par les mauvais esprits (*akuryō*).

Pour protéger aussi bien les villageois que les marchands de passage, on érigea aux carrefours, près des ponts et à l'entrée des bourgs des stèles de pierre appelées **Dōsojin** (道祖神, littéralement *« divinités ancestrales des chemins »*).

![Pierres sculptées Dōsojin portant des bavoirs rouges à un carrefour japonais](/images/historia-dosojin-cruce.jpeg)

Taillés dans la pierre volcanique ou le granit brut, les Dōsojin prenaient plusieurs formes :

- **Couples divins sculptés en bas-relief :** Ils incarnaient l'harmonie conjugale, l'hospitalité envers le voyageur et la pérennité de la communauté.
- **Piliers gravés de caractères sacrés :** Ils servaient de bornes protectrices empêchant les calamités de franchir le seuil du village.
- **Offrandes de passage :** Les marchands déposaient quelques pièces, du riz enveloppé dans du papier ou des sandales de paille usées afin de demander un voyage sûr et de bonnes ventes au marché.

> « Là où deux routes se croisent naît l'échange, mais aussi l'incertitude. Le Dōsojin rappelle au voyageur qu'aucun commerce ne prospère sans la bénédiction du lieu qui l'accueille. »

Fait remarquable, de nombreux Dōsojin conservés dans les préfectures de Nagano, Gunma et Yamanashi sont encore aujourd'hui vêtus de **bavoirs en tissu rouge** — exactement le même attribut protecteur dont héritera plus tard le collier écarlate du Maneki-neko. Dans le folklore japonais, le rouge symbolise la vitalité et fait barrage à la maladie comme au mauvais sort.

## Konsei-sama : les amulettes de fertilité dans les auberges et échoppes

Tandis que les Dōsojin veillaient sur les routes extérieures, à l'intérieur des auberges (*hatago*), des maisons de thé et des premières échoppes urbaines de Kyoto, d'Osaka et de la jeune Edo (l'actuelle Tokyo) régnait un autre type de talisman : les amulettes phalliques connues sous le nom de **Konsei-sama** (金精神).

Pour le regard occidental moderne, cela peut surprendre, mais dans le shintoïsme populaire japonais antérieur à l'ère Meiji, ces objets étaient totalement dépourvus de connotation obscène ou grivoise. Dans une société agraire où la survie dépendait des récoltes et de la descendance familiale, la fertilité biologique et l'abondance économique procédaient d'une même force vitale (*musubi*).

![Autel traditionnel d'un commerce japonais avec corde shimenawa et amulettes en bois](/images/historia-konsei-shimenawa.jpeg)

Les commerçants exposaient des figurines sculptées dans le bois de cyprès, la pierre ou la terre cuite près de l'entrée de leur établissement dans trois buts très précis :

1. **Multiplier la clientèle :** Tout comme la semence multipliait le grain dans les rizières, on croyait que ces talismans attiraient un flot continu de visiteurs et d'acheteurs.
2. **Protéger la prospérité de la lignée marchande :** Garantir que le commerce se transmette de parents à enfants sans faillite ni incendie.
3. **Sceller la bonne fortune par des rituels quotidiens :** Chaque matin, avant d'ouvrir les portes coulissantes de la boutique, le maître des lieux répandait du sel purificateur (*morijio*) sur le seuil et offrait une coupe de saké devant l'amulette.

## Le décor rituel : cordes shimenawa et sel purificateur

Aucun talisman commercial n'agissait isolément. Les amulettes du XVIe siècle s'inscrivaient dans une esthétique rituelle précise qui délimitait l'espace sacré de la boutique face à l'agitation de la rue :

- **Cordes sacrées *shimenawa* :** Tressées en paille de riz fraîchement récoltée et ornées de bandes de papier blanc pliées en zigzag (*shide*), elles indiquaient que l'intérieur du commerce était purifié et placé sous protection divine.
- **Petits cônes de sel (*morijio*) :** Disposés en deux monticules blancs de part et d'autre de la porte, une tradition qui survit encore aujourd'hui devant des milliers de restaurants et boutiques au Japon.
- **Tablettes votives *ema* :** Petites plaques de bois sur lesquelles les guildes d'artisans inscrivaient leurs prières de prospérité au début de chaque saison.

## Le pont vers le XVIIe siècle : quand le chat a relevé la pierre

À mesure que le XVIIe siècle avançait et que la paix du shogunat Tokugawa favorisait l'essor des villes et d'une nouvelle bourgeoisie marchande (*chōnin*), la sensibilité esthétique des devantures commença à évoluer. Les habitants d'Edo recherchaient des symboles plus proches, narratifs et familiers, reflets de la vie quotidienne de leurs quartiers.

Les chats — appréciés jusque-là surtout pour protéger les greniers à riz et les vers à soie contre les rongeurs — devinrent les héros de récits prodigieux dans les temples et maisons de thé. De ces chroniques allait naître, à partir de **1615**, la figure appelée à recueillir l'héritage spirituel des Dōsojin et des Konsei-sama pour devenir le talisman suprême de la fortune japonaise : le **Maneki-neko**.`,

  "src/content/historia/fr/templo-gotokuji-tama.md": `---
title: "Le temple Gōtokuji et Tama : la légende samouraï qui a donné vie au Maneki-neko"
subtitle: "Un orage, un arbre foudroyé et le geste sauveur d'un humble chat blanc ont scellé la naissance de l'amulette commerciale la plus emblématique du Japon."
era: "Étape II • An 1615"
period: "Début de la période d'Edo"
location: "Quartier de Setagaya (Edo / Tokyo)"
coverImage: "/images/timeline-2-gotokuji.jpeg"
coverAlt: "Illustration du chat blanc Tama devant le temple Gōtokuji"
readingTime: "7 min de lecture"
order: 2
summary: "Découvrez comment la rencontre entre un puissant seigneur féodal et le chat du moine du temple Gōtokuji a forgé la légende originelle du Maneki-neko."
featuredFigure:
  name: "Maneki-neko Blanc de Gōtokuji"
  meaning: "Fidèle à la légende, il lève la patte droite sans tenir de pièce pour souhaiter pureté et opportunités à cultiver."
  shopUrl: "/tienda/?color=white&pata=right"
---

Nous sommes en **1615**. Le Japon vient tout juste de sortir de la période troublée des Provinces en guerre (*Sengoku Jidai*) grâce à l'unification du shogunat Tokugawa. Le siège du pouvoir militaire s'est établi à Edo — l'actuelle Tokyo —, une cité en pleine effervescence qui deviendra bientôt la ville la plus peuplée du monde.

Aux confins ruraux de cette métropole naissante, dans le district de Setagaya, languissait un modeste temple bouddhiste de l'école Sōtō Zen : le **temple Gōtokuji** (豪徳寺). Son moine principal, bien que vivant dans un extrême dénuement, partageait les maigres rations qu'il obtenait en mendiant avec son unique compagnon, un chat blanc nommé **Tama**.

La légende raconte qu'un soir d'hiver, devant les braises mourantes du brasero, le moine regarda son félin et lui murmura : *« Tama, si tu éprouves vraiment de la gratitude pour cette nourriture que je partage avec toi, je te prie d'apporter un jour la bonne fortune à notre humble temple. »*

## La chasse au faucon et l'orage d'été

Peu de temps après, une troupe de samouraïs à cheval traversait Setagaya au retour d'une chasse au faucon (*takagari*). À la tête de l'escorte chevauchait **Ii Naotaka** (1590-1659), le puissant seigneur féodal (*daimyō*) du domaine de Hikone et vassal de confiance du shōgun Tokugawa Ieyasu lui-même.

Soudain, le ciel s'assombrit et un violent orage d'été éclata. Cherchant un abri contre la pluie torrentielle, Ii Naotaka et ses hommes mirent pied à terre sous un arbre touffu près des portes délabrées du temple Gōtokuji.

Tandis que le seigneur attendait une accalmie, il aperçut un mouvement étrange près de l'entrée du sanctuaire. Là se tenait Tama, le chat blanc du moine. Loin d'être effrayé par le tonnerre ou la présence des hommes en armes, le félin fixait Ii Naotaka, se frotta le museau d'une patte puis la maintint levée, dans le geste japonais caractéristique servant à **appeler quelqu'un pour qu'il approche**.

![Illustration de style ukiyo-e de Tama le chat blanc levant la patte sous la pluie devant un samouraï](/images/historia-gotokuji-lluvia.jpeg)

Intrigué par le comportement singulier de l'animal, Ii Naotaka quitta l'abri de l'arbre et fit quelques pas sous l'averse vers les marches du temple pour observer le chat de plus près.

> À peine le samouraï s'était-il éloigné du tronc qu'un coup de tonnerre assourdissant fit trembler la terre et que la foudre frappa de plein fouet l'arbre sous lequel il s'abritait quelques instants plus tôt, le réduisant en éclats fumants.

Le geste du chat ne l'avait pas seulement invité à entrer : **il lui avait sauvé la vie**.

## La renaissance du temple Gōtokuji

Accourant aux portes après le fracas de la foudre, le moine découvrit les samouraïs et les invita à se réfugier dans l'humble salle du temple. Il leur servit du thé vert chaud et partagea avec eux des enseignements bouddhistes jusqu'au retour du beau temps.

Profondément touché par le salut que Tama lui avait offert ainsi que par la sérénité et la sagesse du vieux moine, Ii Naotaka prit une décision qui bouleversa à jamais l'histoire de Setagaya : **il fit don d'immenses terres rizicoles (*koku*)** au temple et finança sa reconstruction intégrale, l'érigeant en sanctuaire funéraire officiel du puissant clan Ii à Edo.

De masure bouddhiste en ruine, Gōtokuji devint l'un des complexes sacrés les plus riches et les plus somptueux de la capitale, rang privilégié qu'il conserva durant toute l'époque d'Edo.

## La naissance du Shōfuku-neko-ji

Lorsque Tama, le chat blanc, s'éteignit des années plus tard de vieillesse, le moine et les habitants lui offrirent une sépulture solennelle dans un cimetière pour chats aménagé au sein même du temple.

Pour honorer sa mémoire et le miracle qui avait sauvé le sanctuaire et le seigneur féodal, on fit sculpter et modeler des statuettes du chat levant la patte. Au temple Gōtokuji, ces figurines ne reçurent pas le nom commercial de Maneki-neko, mais furent baptisées **Shōfuku-neko-ji** (招福猫児), ce qui signifie *« Le chat qui invite la bonne fortune »*.

![Autel d'offrandes du temple Gōtokuji rempli de milliers de figurines de chats blancs levant la patte droite](/images/historia-gotokuji-altar.jpeg)

Cette appellation recèle une **nuance bouddhiste** subtile mais essentielle. Contrairement aux Maneki-neko qui apparaîtront un siècle plus tard dans les quartiers de plaisir d'Edo, les chats de Gōtokuji présentent trois caractéristiques immuables :

1. **Ils sont toujours blancs :** La robe originelle de Tama symbolise la pureté du cœur, la clarté spirituelle et la dévotion bouddhiste, sans taches tricolores.
2. **Ils lèvent toujours la patte droite :** Dans le shintoïsme et le bouddhisme classiques, la patte droite attire la fortune générale du foyer et la santé de la famille, tandis que la gauche est davantage associée au commerce et à la clientèle.
3. **Ils ne tiennent pas de pièce d'or (Koban) :** Alors que les Maneki-neko commerciaux arborent un grand médaillon doré sur la poitrine pour promettre une richesse matérielle rapide, les chats de Gōtokuji ne portent pas d'argent.

La raison bouddhiste de cette absence de pièce est profonde : *« Le chat qui lève la patte ne te donne pas directement l'argent ni le succès ; il t'offre seulement le lien ou l'opportunité (le "en" ou karma positif). Il appartient à l'être humain de saisir cette chance par son propre travail honnête, son effort et sa gratitude. »*

## Gōtokuji aujourd'hui

De nos jours, le temple Gōtokuji, niché au cœur des rues résidentielles paisibles de Setagaya à Tokyo, est un lieu de pèlerinage mondial. Ceux dont un vœu s'exauce ou dont un projet réussit grâce à l'« opportunité » reçue reviennent au temple déposer un nouveau chat blanc en signe de reconnaissance.

Cette tradition séculaire a donné naissance au célèbre paysage visuel qui définit Gōtokuji au XXIe siècle : des étagères, des autels et des recoins du sanctuaire peuplés de **dizaines de milliers de Shōfuku-neko-ji blancs** de toutes tailles, observant silencieusement les visiteurs la patte droite levée, perpétuant le souvenir du jour où un éclair et un félin unirent le destin d'un seigneur féodal et d'un moine.`,

  "src/content/historia/fr/ceramica-imado-usugumo.md": `---
title: "Céramique d'Imado : Usugumo, le quartier des plaisirs et la commercialisation du Maneki-neko"
subtitle: "Des temples de Setagaya aux maisons de plaisir d'Asakusa : comment le chat porte-bonheur est devenu un artisanat d'argile colorée et a conquis les commerçants d'Edo."
era: "Étape III • XVIIIe siècle"
period: "Apogée culturel d'Edo (Bunka-Bunsei)"
location: "Quartier d'Asakusa, Edo (Tokyo)"
coverImage: "/images/timeline-3-imado.jpeg"
coverAlt: "Illustration d'une figurine ancienne en céramique d'Imado représentant un chat de profil"
readingTime: "6 min de lecture"
order: 3
summary: "Découvrez la légende de la courtisane Usugumo et comment les ateliers de céramique d'Imado ont popularisé le Maneki-neko moderne."
featuredFigure:
  name: "Maneki-neko Traditionnel en Argile"
  meaning: "Le modèle originel d'Imado qui a uni la protection du foyer au commerce local."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

Si la légende du temple Gōtokuji (1615) relate la naissance spirituelle de l'amulette, le XVIIIe siècle et l'âge d'or de la capitale (*Edo*) expliquent son essor comme phénomène populaire. La pacification du Japon sous l'autorité des Tokugawa permit l'épanouissement d'une brillante culture urbaine (*ukiyo*, « le monde flottant »), animée par les marchands, les acteurs de kabuki et les courtisanes.

C'est dans les quartiers de plaisirs d'**Asakusa**, au nord-est d'Edo, que le Maneki-neko cessa d'être la relique pieuse d'un clan samouraï pour devenir le talisman d'argile peinte que s'arrachaient les tenanciers de tavernes et de boutiques. Tout commença par une autre légende dramatique : l'histoire d'**Usugumo**.

## La courtisane Usugumo et son chat gardien

Au milieu de l'époque d'Edo, le quartier de Yoshiwara (près d'Asakusa) était l'épicentre des divertissements nocturnes. Là vivait et officiait **Usugumo** (薄雲), une courtisane de haut rang (*tayū*) célèbre pour sa beauté, son raffinement poétique et sa dévotion sans bornes envers les chats.

Son favori était un grand matou qu'elle élevait dans le luxe et qui ne la quittait en aucune circonstance. Le lien entre eux était si fort que les clients et les tenanciers des maisons de thé commencèrent à murmurer. Le bruit courut bientôt qu'Usugumo avait été « ensorcelée » (*bakeneko*) par l'animal, ce qui expliquait qu'elle refusât parfois de riches visiteurs.

Un soir, alors qu'Usugumo s'apprêtait à rejoindre un riche client, le chat fut pris d'une agitation frénétique. Il s'agrippa à l'ourlet du lourd kimono de soie de la courtisane, feulant et tirant violemment sur l'étoffe pour l'empêcher de faire un pas de plus vers le salon.

![Illustration de style ukiyo-e de la courtisane Usugumo et de son chat agrippé à son kimono](/images/historia-imado-usugumo.jpeg)

Persuadé que le félin était possédé et s'apprêtait à attaquer sa courtisane la plus précieuse, le maître de la maison dégaina son sabre court et, d'un geste fulgurant, **décapita le chat**.

> Pourtant, la tête tranchée de l'animal ne tomba pas au sol. Mue par une force surnaturelle, elle bondit vers les poutres du plafond et mordit mortellement un gigantesque **serpent venimeux** tapi dans l'ombre, prêt à fondre sur Usugumo. Le chat ne cherchait nullement à l'attaquer : il tentait désespérément de l'empêcher de passer sous le reptile afin de lui sauver la vie.

Usugumo sombra dans un profond chagrin après la perte de son sauveur, refusant toute nourriture et toute visite. Pour apaiser son deuil, l'un de ses fidèles admirateurs se rendit auprès d'un habile potier des fours voisins d'Imado et lui commanda une délicate statuette d'argile à l'effigie du chat disparu. Usugumo fut bouleversée par ce présent, et son histoire émut tout le quartier de Yoshiwara au point que chacun voulut posséder une réplique de ce chat fidèle.

## Les fours d'Imado : berceau du Marushime-neko

La légende d'Usugumo fit exploser la demande dans le quartier voisin d'**Imado**, sur les rives du fleuve Sumida, réputé pour ses fours à terre cuite basse température (*Imado-yaki*). Les potiers, qui fabriquaient jusque-là des tuiles et des bols rustiques du quotidien, saisirent l'occasion commerciale et commencèrent à produire en série de petites figurines de chats en argile peintes à la main pour les pèlerins.

Ces premières figurines commerciales d'argile étaient vendues dans l'enceinte du **sanctuaire Imado Jinja** et au célèbre temple Sensō-ji d'Asakusa. On les appelait à l'origine **Marushime-neko** (丸〆猫).

![Estampe ancienne montrant des figurines en céramique d'Imado vendues aux abords d'Asakusa](/images/historia-imado-puesto.jpeg)

L'esthétique de ces premiers chats d'Imado différait nettement du Maneki-neko rond et frontal que nous connaissons aujourd'hui. Le style d'Imado au XVIIIe siècle se distinguait par :

- **Une posture de profil :** Le chat était généralement sculpté assis de côté, tournant la tête vers le spectateur.
- **Le symbole « Marushime » (㋡) :** Sur le dos du chat était peint un cercle renfermant la syllabe hiragana *« shime »*, signifiant *« rassembler la fortune de façon pleine et complète »*.
- **Une parure traditionnelle :** Ils portaient invariablement peint un large **bavoir rouge en soie (*yodarekake*) et un grelot**, luxe que les riches habitants d'Edo offraient à leurs vrais chats pour éviter qu'ils ne s'égarent.

## L'estampe d'Hiroshige et la vieille femme du rêve

Le passage des chats d'Imado du statut de simple charme local à celui d'emblème de la capitale fut attesté en 1852. Cette année-là, le maître légendaire de l'estampe (*ukiyo-e*) **Utagawa Hiroshige** publia son œuvre *« La florissante prospérité du quartier Jōruri-machi »*, où figure explicitement un étal vendant des figurines de *Marushime-neko* : c'est le **plus ancien témoignage visuel confirmé** d'un chat porte-bonheur commercialisé.

Cette même année 1852, un autre récit se répandit comme une traînée de poudre dans les ruelles d'Asakusa et consacra la renommée des fours locaux. On racontait qu'une vieille femme très pauvre, contrainte par la faim d'abandonner son chat, fondit en larmes en le laissant dans la rue. La nuit même, le chat lui apparut en rêve et lui dit : *« Grand-mère, si tu modèles mon image dans l'argile, je t'apporterai une grande fortune. »*

La femme se mit à façonner des chats avec des restes de terre d'Imado et à les vendre aux portes du temple Sensō-ji. Les statuettes connurent un tel succès qu'elles tirèrent la vieille femme de la misère en peu de temps, incitant toutes les échoppes et maisons de thé de la ville à acquérir leur propre chat d'argile. Le **Maneki-neko commercial** était définitivement né.`,

  "src/content/historia/fr/era-meiji-revolucion-comercial.md": `---
title: "L'ère Meiji et la révolution commerciale : comment une ordonnance de 1872 a couronné le Maneki-neko"
subtitle: "Avec l'ouverture du Japon au monde et la modernisation urbaine de Tokyo, les anciennes amulettes de fertilité furent interdites et le chat porte-bonheur prit leur place dans chaque boutique."
era: "Étape IV • 1868 – 1912"
period: "Restauration de Meiji"
location: "Tokyo, Osaka et ports commerciaux du Japon"
coverImage: "/images/timeline-4-meiji.jpeg"
coverAlt: "Commerce traditionnel japonais durant l'ère Meiji avec un Maneki-neko à l'entrée"
readingTime: "6 min de lecture"
order: 4
summary: "Découvrez comment les lois de modernisation de l'ère Meiji ont interdit les anciens talismans phalliques et propulsé le Maneki-neko à la pièce koban."
featuredFigure:
  name: "Maneki-neko Doré de la Prospérité"
  meaning: "Inspiré par l'essor commercial de l'ère Meiji, il allie l'appel au succès à la pièce d'or koban."
  shopUrl: "/tienda/?color=gold&pata=right"
---

En **1868**, le Japon mit fin à plus de deux siècles et demi d'isolement sous le shogunat Tokugawa et entama une transformation fulgurante connue sous le nom de **Restauration de Meiji**. En quelques décennies à peine, d'anciennes cités féodales comme Edo — rebaptisée **Tokyo** — se dotèrent de chemins de fer, de télégraphes, d'éclairage au gaz, de journaux quotidiens et d'un commerce international florissant.

Ce mouvement de modernisation (*Bunmei Kaika*, « civilisation et lumières ») ne transforma pas seulement l'architecture et l'économie du pays ; il redessina aussi l'esthétique des devantures et les croyances quotidiennes des commerçants japonais. C'est précisément à ce carrefour entre tradition et modernité que le **Maneki-neko** franchit le pas décisif d'artisanat local à emblème national du commerce.

## Les ordonnances de 1872 et l'adieu aux anciennes amulettes

Durant toute l'époque d'Edo, auberges, maisons de thé, tavernes et boutiques populaires avaient exposé près de leur entrée les traditionnels talismans de fertilité et d'abondance appelés **Konsei-sama** (金精神). Pour les marchands japonais, ils incarnaient des symboles sacrés de prospérité, de récoltes généreuses et d'affluence de clients.

Toutefois, avec l'arrivée de diplomates, d'ingénieurs et de voyageurs étrangers dans des ports comme Yokohama, Kobe et Tokyo, le nouveau gouvernement impérial tint à projeter auprès de l'Occident l'image d'une nation moderne et policée. En **1872 (cinquième année de Meiji)** furent promulguées de strictes ordonnances de moralité urbaine (*Ishiki Kaii Jōrei*) interdisant d'exposer dans l'espace public ou les vitrines commerciales tout objet à caractère phallique ou jugé inconvenant selon les critères victoriens de l'époque.

![Illustration de style ukiyo-e d'un commerçant de l'ère Meiji retirant d'anciennes amulettes en bois et plaçant un Maneki-neko à l'entrée de sa boutique](/images/historia-meiji-ordenanza.jpeg)

Du jour au lendemain, des milliers de commerçants de Tokyo et d'Osaka se retrouvèrent face à un dilemme spirituel et pratique : il leur fallait retirer leurs amulettes ancestrales de la vue du public, mais aucun marchand japonais n'était prêt à ouvrir sa boutique chaque matin sans un talisman protecteur près de la porte.

> « La loi pouvait retirer la pierre et le bois sculpté de la vitrine, mais elle ne pouvait éteindre le besoin du commerçant d'invoquer la bonne fortune au seuil de son échoppe. »

La réponse s'imposa naturellement dans les quartiers commerçants de Tokyo : le **Maneki-neko**. Il était attachant, élégant, profondément japonais et parfaitement innocent aux yeux des visiteurs étrangers, tout en conservant intacte sa charge symbolique de bienvenue et de prospérité.

## L'ajout de la pièce Koban et la nouvelle iconographie commerciale

Devenu le remplaçant officiel des anciens talismans d'abondance, le Maneki-neko connut une évolution décisive durant l'ère Meiji. Les artisans de Tokyo et de Seto le dotèrent d'attributs explicitement liés à l'argent et à la réussite commerciale :

- **La pièce d'or *Koban* :** On prit l'habitude de représenter le chat tenant contre sa poitrine une grande pièce ovale en or de l'époque d'Edo, portant généralement les caractères **« Senman Ryō »** (千万両, *« dix millions de pièces d'or »*), somme hyperbolique symbolisant une richesse inépuisable.
- **La distinction entre les pattes :** À cette époque se fixa dans l'imaginaire marchand la différence entre la **patte gauche levée** (idéale pour les restaurants, théâtres, maisons de thé et commerces cherchant à attirer un flux continu de clients) et la **patte droite** (privilégiée par les changeurs, grossistes et foyers demandant une fortune financière directe).
- **Le pelage tricolore (*Mi-ke*) :** La robe blanche tachée de noir et de roux — génétiquement très rare chez les chats mâles japonais — s'imposa comme la livrée la plus recherchée, réputée porteuse d'une chance extraordinaire.

![Illustration de style ukiyo-e d'un Maneki-neko de l'ère Meiji tenant une pièce dorée Koban sur le comptoir d'une boutique](/images/historia-meiji-koban.jpeg)

## De Tokyo à tout l'archipel grâce au rail et à la presse

L'essor du Maneki-neko sous l'ère Meiji coïncida avec l'expansion du réseau ferroviaire national et la naissance des grands magasins modernes (*hyakkaten*). Les commerçants de province qui se rendaient à Tokyo pour acheter des marchandises repartaient chez eux avec des figurines du chat porte-bonheur en guise de souvenir et de talisman pour leurs propres enseignes.

De même, les journaux illustrés (*nishiki-e shinbun*) et les affiches publicitaires de la fin du XIXe siècle adoptèrent la silhouette du chat à la patte levée comme signal visuel des promotions, inaugurations et maisons florissantes.

En moins de trois décennies, ce qui était né d'une légende pieuse à Setagaya et d'une poterie populaire à Asakusa était devenu le **symbole universel de l'entrepreneuriat et de l'hospitalité commerciale japonaise**, préparant sa production industrielle et son rayonnement mondial au XXe siècle.`,

  "src/content/historia/fr/tokoname-icono-mundial.md": `---
title: "Tokoname et la conquête du monde : la naissance du Maneki-neko moderne"
subtitle: "Dans les fours de potiers de la préfecture d'Aichi est né le modèle arrondi et coloré qui accueille aujourd'hui visiteurs et clients sur les cinq continents."
era: "Étape V • XXe siècle – Aujourd'hui"
period: "De l'ère Shōwa à nos jours"
location: "Tokoname (Aichi) et rayonnement international"
coverImage: "/images/timeline-5-tokoname.jpeg"
coverAlt: "Maneki-neko moderne en céramique de style Tokoname aux finitions brillantes"
readingTime: "6 min de lecture"
order: 5
summary: "Découvrez comment les maîtres céramistes de Tokoname ont créé le moule moderne du Maneki-neko et comment l'amulette est devenue une icône pop mondiale."
featuredFigure:
  name: "Maneki-neko Tricolore Classique"
  meaning: "Le design emblématique de Tokoname au pelage Mi-ke réunissant fortune suprême, clientèle et protection."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

Lorsque quiconque à Madrid, New York, Paris ou Bangkok imagine aujourd'hui un **Maneki-neko**, la silhouette qui vient à l'esprit possède des proportions bien précises : un corps potelé et bienveillant, une grande tête arrondie, des oreilles dressées, des yeux incurvés en un sourire serein et un émail céramique éclatant.

Ce design qui semble aujourd'hui éternel n'existait ni au XVIIIe siècle ni à l'ère Meiji. Il est né au milieu du **XXe siècle (ère Shōwa)** dans une ville côtière de la préfecture d'Aichi célèbre pour plus de mille ans de tradition potière : **Tokoname** (常滑).

## Les ateliers de Tokoname et le moule du chat moderne

Tokoname compte parmi les *Rokkoyō* — les Six Anciens Fours du Japon —, historiquement réputée pour ses théières en argile rouge (*kyūsu*) et ses grandes jarres en grès. Après la Seconde Guerre mondiale, durant la période de reconstruction économique du Japon, les artisans locaux cherchèrent de nouvelles pièces décoratives capables de stimuler le commerce et d'apporter de bons augures aux foyers et boutiques qui rouvraient leurs portes.

À la fin des années 1940 et au début des années 1950, les maîtres modeleurs de Tokoname stylisèrent les anciennes figurines élancées d'Edo et d'Imado pour créer le **style Tokoname** (*Tokoname-kei*) :

- **Des proportions *kawaii* avant l'heure :** Ils arrondirent le torse et agrandirent la tête afin de transmettre douceur, proximité et optimisme immédiat.
- **Une peinture à la main expressive :** Des artisans spécialisés traçaient au pinceau les moustaches, les sourcils arqués, le grelot doré et l'inscription de la pièce *koban* avec une netteté graphique incomparable.
- **La production en moules de plâtre (*ikomi*) :** Cette technique permit de préserver la qualité artisanale du décor peint à la main tout en répondant à la demande croissante de tout le Japon.

![Illustration de style ukiyo-e d'un maître artisan dans un atelier de Tokoname peignant à la main des figurines de Maneki-neko en céramique](/images/historia-tokoname-taller.jpeg)

En quelques décennies, Tokoname en vint à produire près de **80 % de tous les Maneki-neko en céramique traditionnelle du Japon**, méritant pleinement son titre de capitale mondiale du chat porte-bonheur.

## L'explosion des couleurs : un talisman pour chaque vœu

Jusqu'au milieu du XXe siècle, la grande majorité des Maneki-neko étaient blancs, tricolores (*Mi-ke*) ou noirs. Cependant, au fil du siècle et avec l'essor des courants d'harmonie spatiale et de symbolisme des couleurs en Asie, les ateliers de Tokoname introduisirent toute une palette d'émaux brillants où chaque teinte répondait à un souhait particulier :

1. **Doré et jaune :** Richesse financière, réussite professionnelle et stabilité économique.
2. **Rouge et rose :** Santé, vitalité, protection des enfants, amour et relations affectives.
3. **Vert et bleu :** Concentration scolaire, sagesse, sérénité mentale et sécurité en voyage.
4. **Violet :** Longévité, noblesse et inspiration artistique.

Cette diversité chromatique transforma l'amulette : cessant d'être réservée aux boutiques et restaurants, elle devint un cadeau prisé pour les remises de diplômes, mariages, emménagements et ouvertures de projets personnels.

## La conquête mondiale et Tokonyan

À partir des années 1970 et 1980, porté par la diaspora commerçante asiatique, l'essor des restaurants japonais en Occident et la culture pop nippone, le Maneki-neko franchit tous les océans. Dans les années 1990 se popularisèrent également les versions articulées alimentées par une petite cellule solaire animant la patte en continu.

![Illustration de style ukiyo-e de la promenade de Tokoname avec des sculptures en céramique de Maneki-neko et la tête géante Tokonyan](/images/historia-tokoname-paseo.jpeg)

Aujourd'hui, dans la ville même de Tokoname, les visiteurs peuvent parcourir la célèbre **Promenade du Maneki-neko** (*Maneki-neko Dōri*), un mur orné de dizaines de sculptures en céramique réalisées par des artistes locaux et dominé par **Tokonyan**, une tête monumentale de Maneki-neko de près de quatre mètres de haut qui veille sur la cité depuis les hauteurs.

Des humbles pierres *Dōsojin* aux carrefours du XVIe siècle jusqu'aux vitrines contemporaines de la planète entière, le Maneki-neko a su se réinventer à chaque époque sans jamais perdre son message essentiel : **ouvrir sa porte avec hospitalité, gratitude et espoir en la bonne fortune**.`,

  "src/content/leyendas/fr/templo-gotokuji-tama.md": `---
title: "Le miracle de Tama au temple Gōtokuji"
subtitle: "Comment un humble chat blanc sauva de la foudre le seigneur féodal Ii Naotaka en 1615 et donna naissance au Maneki-neko."
era: "An 1615 • Période d'Edo"
location: "Setagaya, Tokyo"
coverImage: "/images/leyenda-gotokuji.jpeg"
coverAlt: "Le chat blanc Tama devant le temple Gōtokuji"
readingTime: "7 min de lecture"
isOriginal: true
order: 1
summary: "La chronique fondatrice du Maneki-neko : un moine pauvre, un chat nommé Tama et un orage qui changea le destin du temple Gōtokuji."
chapters:
  - act: "Acte I • La dévotion"
    title: "L'humble moine et son unique compagnon, Tama"
    summary: "Dans un temple en ruine de Setagaya, un vieux moine partage son maigre riz quotidien avec son chat blanc."
  - act: "Acte II • L'orage"
    title: "Un orage soudain sur les chemins de Setagaya"
    summary: "Le seigneur féodal Ii Naotaka et ses samouraïs s'abritent sous un cèdre géant pendant une averse."
  - act: "Acte III • Le miracle"
    title: "Le geste qui arrêta la mort"
    summary: "Tama lève la patte droite pour appeler le samouraï quelques secondes avant que la foudre ne frappe l'arbre."
  - act: "Acte IV • L'héritage"
    title: "La renaissance du temple et l'autel de Shōfuku-neko-ji"
    summary: "Reconnaissant, Naotaka reconstruit Gōtokuji et donne naissance aux milliers de figurines blanches invitant la fortune."
featuredFigure:
  name: "Maneki-neko Blanc de Gōtokuji"
  meaning: "Lève la patte droite sans pièce koban pour attirer des opportunités pures et la bonne fortune au foyer."
  shopUrl: "/tienda/?color=white&pata=right"
---

Dans les faubourgs ruraux de l'ancienne Edo — la cité qui prendrait des siècles plus tard le nom de Tokyo —, entre rizières, bosquets de bambous et chemins de terre battue du district de Setagaya, s'élevait un petit monastère bouddhiste de l'école Sōtō Zen connu aujourd'hui sous le nom de **temple Gōtokuji** (豪徳寺).

Au début du **XVIIe siècle (vers l'an 1615)**, alors que le shogunat Tokugawa venait tout juste de pacifier le Japon après des décennies de guerres civiles, ce temple traversait un profond déclin. Ses toits de bois laissaient passer la pluie, les tatamis étaient rongés par l'humidité et les aumônes des paysans voisins suffisaient à peine à allumer une poignée de charbon durant les nuits glacées de l'hiver.

## 1. L'humble moine et son unique compagnon, Tama

Le vieil abbé du temple vivait entièrement seul, voué à la méditation et à l'entretien de l'autel, sans autre compagnie qu'un chat blanc aux yeux ambrés qu'il avait recueilli alors qu'il n'était qu'un chaton abandonné au bord du chemin. Il l'avait baptisé **Tama**.

Bien que maintes journées le prêtre ne rapportât qu'un bol de riz cuit et un peu de bouillon clair de ses tournées d'aumône, jamais il ne touchait à une bouchée sans en déposer d'abord la moitié dans une petite écuelle en bois pour son félin.

![Le vieux moine bouddhiste partageant son humble bol de riz avec le chat blanc Tama en hiver](/images/leyenda-tama-1-monje.jpeg)

La chronique orale transmise à Setagaya raconte qu'une nuit particulièrement rude, tandis que la neige tombait en silence derrière les portes coulissantes en papier (*shōji*), le moine contempla le brasero presque éteint et parla à voix haute à son chat, comme on confie un secret à un vieil ami :

> « Tama, nous savons tous deux que ce temple tient à peine debout. Jamais je ne te reprocherai notre pauvreté, car ta seule présence éclaire mes journées ; mais si tu éprouves un jour de la gratitude pour cet humble toit et le peu de riz que nous partageons, puisses-tu apporter un peu de fortune à notre sanctuaire. »

Le chat cligna lentement des yeux, inclina la tête et se blottit contre la robe rapiécée du vieillard.

## 2. Un orage soudain sur les chemins de Setagaya

Des mois plus tard, par un après-midi étouffant d'été, une escorte armée regagnait Edo après une journée de fauconnerie (*takagari*) dans les champs voisins. En tête chevauchait **Ii Naotaka** (1590–1659), le puissant seigneur féodal (*daimyō*) du domaine de Hikone et l'un des stratèges militaires les plus proches du shōgun Tokugawa Ieyasu.

Sans prévenir, le ciel de Setagaya se couvrit de nuages noirs. Un vent glacé secoua la cime des cèdres et, en quelques secondes, un violent orage éclata, transformant les sentiers en bourbiers impraticables.

![Le seigneur féodal Ii Naotaka et ses samouraïs surpris par l'orage près d'un cèdre géant devant le temple](/images/leyenda-tama-2-tormenta.jpeg)

Trempés jusqu'aux os et aveuglés par les éclairs, Ii Naotaka et ses vassaux descendirent de cheval et cherchèrent abri sous la ramure épaisse d'un cèdre centenaire gigantesque qui poussait à quelques mètres de l'entrée usée du temple Gōtokuji.

## 3. Le geste qui arrêta la mort

Tandis que les samouraïs attendaient en silence que l'averse se calme, Ii Naotaka leva les yeux vers le portail en bois du temple. Là, assis sur le seuil sous l'avant-toit, se tenait **Tama**.

Contrairement à n'importe quel animal errant qui aurait fui épouvanté devant le fracas du tonnerre et l'éclat des armures, le chat blanc gardait ses yeux ambrés rivés droit sur le seigneur féodal. Soudain, il leva sa patte droite au-dessus de son oreille et l'agita doucement d'avant en arrière, dans le geste sans équivoque par lequel on appelle quelqu'un au Japon pour l'inviter à entrer.

![Le chat blanc Tama levant la patte droite pour appeler le samouraï tandis qu'un éclair fend l'arbre derrière lui](/images/leyenda-tama-3-rayo.jpeg)

La curiosité et l'étonnement l'emportèrent sur la prudence du guerrier. *« Ce chat m'appellerait-il vers le temple ? »*, murmura Naotaka. Il quitta l'abri du cèdre et s'avança sous le rideau de pluie vers les marches de pierre où attendait Tama.

À peine le seigneur féodal eut-il fait quelques pas loin du tronc qu'une lueur aveuglante illumina toute la vallée et qu'un coup de tonnerre assourdissant fit trembler la terre : **la foudre frappa de plein fouet le cèdre géant** sous lequel ils s'étaient abrités quelques instants plus tôt, le fendant en éclats fumants.

S'il n'avait pas obéi à l'appel du chat blanc, Ii Naotaka et son escorte auraient péri foudroyés sur-le-champ.

## 4. La renaissance du temple et l'autel de Shōfuku-neko-ji

Entendant le fracas, le vieux moine accourut à l'entrée et accueillit avec sérénité et hospitalité le seigneur de Hikone, lui offrant du thé chaud et un entretien bouddhiste jusqu'à ce que le ciel s'éclaircisse à nouveau.

Profondément ému en comprenant que le chat de l'humble monastère lui avait sauvé la vie, Ii Naotaka décida de récompenser ce miracle au centuple : il fit don de vastes terres rizicoles (*koku*) pour assurer la subsistance perpétuelle des moines, finança la reconstruction complète des pavillons en bois et désigna Gōtokuji comme le **temple funéraire officiel (*bodaiji*) du clan Ii** à Edo.

![Le temple Gōtokuji reconstruit dans toute sa splendeur avec des cerisiers en fleurs et un autel garni de figurines blanches de Tama](/images/leyenda-tama-4-templo.jpeg)

Lorsque Tama mourut des années plus tard après une longue et paisible vie, le moine lui consacra une tombe honorifique dans l'enceinte sacrée et fit sculpter son effigie la patte droite levée sous le nom de **Shōfuku-neko-ji** (招福猫児, *« le chat qui invite la bonne fortune »*).

Depuis lors, les fidèles venus de tout le Japon se rendent à Gōtokuji pour emporter l'une de ces figurines blanches — qui ne tiennent jamais de pièce *koban*, car la tradition zen enseigne que le chat ouvre la porte de l'opportunité mais qu'il appartient à l'effort humain de la cultiver — et reviennent la déposer sur l'autel lorsque leurs vœux s'accomplissent, formant une mer silencieuse de milliers de chats blancs qui perpétuent la mémoire de Tama.`,

  "src/content/leyendas/fr/anciana-imado-suenos-arcilla.md": `---
title: "Usugumo et le chat gardien de Yoshiwara"
subtitle: "L'histoire tragique et prodigieuse de la courtisane d'Asakusa dont le chat tricolore donna sa vie pour la sauver et donna naissance aux figurines en céramique d'Imado."
era: "XVIIIe siècle • Période d'Edo"
location: "Yoshiwara et Asakusa, Tokyo"
coverImage: "/images/leyenda-usugumo.jpeg"
coverAlt: "Chat gardien veillant depuis les toits de Yoshiwara"
readingTime: "7 min de lecture"
isOriginal: false
order: 2
summary: "Dans la splendeur nocturne de Yoshiwara, le fidèle chat tricolore de la courtisane Usugumo la sauva d'un serpent mortel, inspirant les premières figurines commerciales d'Imado."
chapters:
  - act: "Acte I • Yoshiwara"
    title: "La courtisane de Yoshiwara et son inséparable compagnon"
    summary: "Dans l'Edo du XVIIIe siècle, la célèbre Usugumo vit unie à un grand chat tricolore aux yeux ambrés."
  - act: "Acte II • L'avertissement"
    title: "La nuit où le chat retint son kimono"
    summary: "Le félin s'agrippe avec fureur à l'ourlet de soie d'Usugumo pour l'empêcher de traverser le couloir."
  - act: "Acte III • Le sacrifice"
    title: "Le tranchant du sabre et le danger caché dans les poutres"
    summary: "Le chat bondit vers le plafond et terrasse un serpent venimeux qui guettait au-dessus de la courtisane."
  - act: "Acte IV • Imado-yaki"
    title: "Le réconfort des fours d'Imado et le temple Saihō-ji"
    summary: "Un admirateur commande une réplique en argile d'Imado qui conquiert les commerces d'Asakusa."
featuredFigure:
  name: "Maneki-neko Tricolore de Protection"
  meaning: "Héritier du courageux chat tricolore d'Usugumo, il réunit fortune suprême, protection face au danger et clientèle."
  shopUrl: "/tienda/?color=tricolor&pata=left"
---

Au milieu du **XVIIIe siècle**, lorsque Edo — l'actuelle Tokyo — bouillonnait telle une métropole de plus d'un million d'habitants, la vie culturelle et nocturne de la capitale gravitait autour du célèbre quartier de **Yoshiwara**, situé près du quartier historique d'**Asakusa**. Entre pavillons éclairés par des lanternes de papier, maisons de thé (*ageya*), maîtres de *shamisen* et poètes du « monde flottant » (*ukiyo*), brillait d'un éclat particulier une courtisane de très haut rang (*tayū*) nommée **Usugumo** (薄雲).

Réputée tant pour l'élégance de ses parures que pour sa maîtrise de la calligraphie, de la cérémonie du thé et de la poésie classique, Usugumo vouait aux chats un attachement indéfectible. Parmi tous les félins qui avaient traversé ses appartements, l'un occupait une place unique dans son cœur : un **grand chat tricolore (*mi-ke*) aux yeux ambrés** qu'elle entourait de soins attentifs et qui ne la quittait jamais.

## 1. La courtisane de Yoshiwara et son inséparable compagnon

Tandis que d'autres dames du quartier collectionnaient les peignes en écaille, les éventails peints ou les rouleaux de soie importée, Usugumo consacrait ses heures libres à brosser le pelage de son chat, à le nourrir dans des écuelles laquées et à lui parler à voix basse derrière les cloisons coulissantes de bois et de papier (*shōji*).

![Usugumo caressant son fidèle chat tricolore dans son salon de Yoshiwara](/images/leyenda-usugumo-1-salon.jpeg)

Une intimité aussi inhabituelle éveilla bientôt les commérages parmi les serviteurs et les clients de la maison de thé. Dans le folklore japonais de l'époque d'Edo existait la croyance aux *bakeneko* — des chats surnaturels capables d'envoûter les humains —, et plus d'un hôte murmurait que le félin d'Usugumo avait ensorcelé la courtisane, puisqu'elle déclinait parfois les banquets de nobles fortunés en prétextant que son chat était agité.

## 2. La nuit où le chat retint son kimono

Par une nuit humide d'été, un riche marchand réserva le grand salon de la maison de thé pour offrir un banquet privé en l'honneur d'Usugumo. Vêtue de son plus beau kimono de soie cramoisie brodé de grues dorées, la courtisane s'engagea dans le couloir de bois menant à la salle des invités.

À peine eut-elle fait quelques pas que le chat tricolore se dressa sur son chemin, le dos hérissé, poussant un miaulement déchirant. Loin de s'écarter, **il planta ses griffes dans le lourd ourlet de soie du kimono** et tira en arrière de toutes ses forces, l'empêchant d'avancer vers la porte coulissante.

![Le chat tricolore retenant fermement le kimono d'Usugumo dans le couloir éclairé par des lanternes](/images/leyenda-usugumo-2-kimono.jpeg)

Usugumo tenta de l'apaiser en lui caressant la tête, surprise par une réaction aussi violente chez un animal d'ordinaire paisible, mais le félin revenait sans cesse s'agripper à l'étoffe comme si sa vie dépendait de l'arrêter sur ce seuil précis.

## 3. Le tranchant du sabre et le danger caché dans les poutres

Alerté par le tumulte dans le couloir, le propriétaire de la maison de thé accourut. En voyant l'énorme chat retenir de force sa courtisane la plus prestigieuse devant un client important, il ajouta foi aux superstitions du quartier et crut que l'animal était possédé et s'apprêtait à l'attaquer.

Sans hésiter, l'homme dégaina son sabre court (*wakizashi*) et porta un coup fulgurant au félin.

> En cet instant prodigieux, le chat fit un bond surhumain vers les sombres poutres du plafond, juste au-dessus de la porte qu'Usugumo s'apprêtait à franchir, et **planta ses crocs dans le cou d'un gigantesque serpent venimeux** tapi dans l'ombre, prêt à fondre sur la courtisane.

![Le chat fidèle bondissant vers les poutres du plafond pour terrasser le serpent venimeux qui guettait Usugumo](/images/leyenda-usugumo-3-serpiente.jpeg)

La vipère s'abattit inerte sur le tatami aux côtés du fidèle gardien, qui venait de rendre son dernier souffle pour protéger sa maîtresse. Le maître de la maison de thé laissa tomber son sabre à terre, accablé de remords en comprenant que l'animal qu'il avait jugé ensorcelé venait de sauver la vie d'Usugumo.

## 4. Le réconfort des fours d'Imado et le temple Saihō-ji

Durant des semaines, Usugumo observa un deuil silencieux. Elle fit inhumer avec honneur son courageux compagnon au proche **temple Saihō-ji** d'Asakusa — où s'éleva pendant des générations un monument connu sous le nom de *Neko-zuka* (« la tombe du chat ») — et se retira dans ses appartements, incapable de retrouver sa joie.

Touché par sa tristesse, l'un de ses admirateurs les plus fidèles se rendit auprès des maîtres potiers du quartier voisin d'**Imado**, sur les rives du fleuve Sumida, et leur commanda une statuette en argile cuite reproduisant fidèlement les traits de ce chat tricolore, parée d'un bavoir rouge protecteur et levant une patte en geste de salut et de protection.

![Usugumo recevant avec tendresse la figurine en céramique d'Imado de son chat tricolore](/images/leyenda-usugumo-4-imado.jpeg)

Lorsque Usugumo ouvrit le coffret en bois et contempla la figurine, un sourire serein illumina enfin son visage. Le récit du sacrifice du chat de Yoshiwara se répandit rapidement dans tout Asakusa : habitants et commerçants affluèrent en masse vers les ateliers de **céramique d'Imado** et le sanctuaire **Imado Jinja** pour acquérir des répliques de ce *Marushime-neko*, convaincus qu'un chat capable de donner sa vie pour sa maîtresse constituait l'amulette la plus puissante pour protéger le foyer et attirer la bonne fortune.`,

  "src/content/leyendas/fr/cortesana-usugumo-eko-in.md": `---
title: "La vieille femme d'Imado et le rêve du Sensō-ji"
subtitle: "Contrainte par la misère de se séparer de son chat bien-aimé en 1852, une humble femme d'Asakusa reçut en songe le secret d'argile qui les tira tous deux de la pauvreté."
era: "An 1852 • Période d'Edo"
location: "Imado et Asakusa, Tokyo"
coverImage: "/images/leyenda-imado.jpeg"
coverAlt: "La vieille femme d'Imado modelant des figurines de chats en argile"
readingTime: "7 min de lecture"
isOriginal: false
order: 3
summary: "La célèbre légende de 1852 expliquant comment les humbles chats d'argile d'Imado conquirent les portes du temple Sensō-ji et devinrent l'amulette populaire d'Edo."
chapters:
  - act: "Acte I • Les adieux"
    title: "Un hiver sans riz au bord du fleuve Sumida"
    summary: "La pauvreté oblige une vieille femme bienveillante d'Imado à se séparer avec douleur de son inséparable chat."
  - act: "Acte II • La révélation"
    title: "Le message du chat en songe"
    summary: "La nuit même, le félin lui apparaît en rêve avec une promesse de prospérité façonnée dans l'argile."
  - act: "Acte III • Le métier"
    title: "Modeler la fortune avec la terre d'Imado"
    summary: "À l'aube, la femme façonne et peint à la main de petites figurines de chats à la patte levée."
  - act: "Acte IV • Le miracle"
    title: "Des foules devant les portes du Sensō-ji"
    summary: "Ses chats en terre cuite s'arrachent chaque jour à Asakusa, donnant naissance aux premiers talismans commerciaux d'Edo."
featuredFigure:
  name: "Maneki-neko Jaune de la Stabilité"
  meaning: "Inspiré par le miracle quotidien de la vieille femme d'Imado, il favorise la subsistance, l'épargne et la prospérité du foyer."
  shopUrl: "/tienda/?color=yellow&pata=left"
---

Nous sommes en **1852** (*cinquième année de l'ère Kaei*), au crépuscule de l'époque d'Edo. Sur les rives du fleuve Sumida, tout près des anciens fours de potiers d'**Imado** et de l'enceinte sacrée animée du **temple Sensō-ji** à Asakusa, vivait dans une petite cabane en bois une vieille veuve connue dans tout le voisinage pour sa douceur et sa générosité.

Pendant des années, son unique compagnon avait été un petit chat blanc aux taches tricolores et à la queue courte qu'elle avait élevé depuis qu'il n'était qu'un chaton. Bien que les temps fussent durs, la femme trouvait toujours le moyen de partager avec lui quelques miettes de poisson séché ou un peu de riz tiède à la tombée du jour.

## 1. Un hiver sans riz au bord du fleuve Sumida

Cependant, après une succession de mauvaises récoltes et une brusque flambée du prix du grain à Edo, la vieille femme tomba malade et dépensa jusqu'à sa dernière pièce de cuivre. Vint un soir où le coffre en bois dans lequel elle conservait le riz se retrouva complètement vide et où le brasero ne gardait plus que des cendres froides.

Le cœur serré, elle comprit que si son chat restait sous ce toit, il finirait par mourir de faim auprès d'elle.

![La vieille femme d'Imado caressant avec tristesse son chat près du coffre à riz vide](/images/leyenda-anciana-1-pobreza.jpeg)

Caressant doucement son dos une dernière fois, elle lui parla d'une voix brisée par les larmes :

> « Pardonne-moi, petit compagnon. Il ne me reste plus un seul grain de riz à t'offrir. Va vers les rues proches du temple, où les marchands et les pèlerins laissent toujours tomber quelque nourriture, et trouve un foyer où tu pourras vivre sans connaître la faim. »

La mort dans l'âme, elle ouvrit la porte coulissante et le laissa s'éloigner dans la pénombre du chemin, avant de regagner son tatami usé en sanglotant silencieusement.

## 2. Le message du chat en songe

La nuit même, tandis que la lumière argentée de la lune filtrait à travers le papier translucide des portes *shōji*, la vieille femme s'endormit, terrassée par la fatigue et le chagrin. Au cœur du silence nocturne, elle fit un rêve si saisissant qu'il semblait réel.

Son chat bien-aimé apparut assis près de son oreiller en bois, baigné d'une lueur chaude et sereine. Il leva sa patte droite d'un geste bienveillant et lui parla distinctement :

> « Ne pleure plus pour moi, chère grand-mère. Prends un peu d'argile des fours d'Imado, modèle mon image assise la patte levée et peins-la avec soin. Si tu portes ces figurines aux portes du temple Sensō-ji, la bonne fortune frappera bientôt à ta porte. »

![Le chat apparaissant en rêve à la vieille femme endormie pour lui montrer sa figurine d'argile](/images/leyenda-anciana-2-sueno.jpeg)

En s'éveillant aux premières lueurs de l'aube, la vieille femme ressentit une étrange sérénité dans sa poitrine. Elle se souvenait de chaque détail de la posture, du sourire incurvé des yeux et du petit bavoir rouge qu'elle avait vus en songe.

## 3. Modeler la fortune avec la terre d'Imado

Sans perdre un instant, elle se rendit aux ateliers voisins d'**Imado-yaki**, où les potiers lui offrirent de bon cœur plusieurs mottes d'argile restante ainsi qu'un peu de pigment minéral rouge, noir et doré.

Assise sur le seuil en bois de sa cabane sous le soleil du matin, la femme commença à modeler de ses propres mains de petites statuettes de chats assis, une patte dressée près de l'oreille en signe d'invitation et une expression bienveillante qui semblait sourire à quiconque les regardait.

![La vieille femme modelant et peignant à la main des figurines de chats en argile sur sa terrasse d'Imado](/images/leyenda-anciana-3-arcilla.jpeg)

Après avoir cuit les pièces dans le four communal du quartier, elle traça à l'aide d'un fin pinceau de bambou les moustaches, le grelot doré et les marques du pelage qu'elle connaissait si bien.

## 4. Des foules devant les portes du Sensō-ji

Le lendemain matin, la vieille femme étendit une natte de paille le long de l'allée menant au **temple Sensō-ji**, à Asakusa, et disposa sur un petit étal en bois sa première douzaine de chats en argile.

La grâce naturelle de ces figurines charma aussitôt les pèlerins, artisans et tenanciers de maisons de thé qui passaient par là. Avant midi, toutes étaient vendues, et le jour suivant une petite foule attendait déjà dès l'aube pour obtenir son propre chat porte-bonheur.

![La vieille femme vendant ses chats en argile devant le temple Sensō-ji entourée d'habitants d'Edo](/images/leyenda-anciana-4-sensoji.jpeg)

Grâce à cet humble savoir-faire, la vieille femme sortit non seulement à jamais de la misère et put de nouveau prendre soin de son fidèle chat, mais elle suscita l'engouement populaire pour les **chats d'argile d'Imado**, immortalisé cette même année 1852 dans les estampes *ukiyo-e* du maître Utagawa Hiroshige et consacré à jamais comme l'une des légendes fondatrices du Maneki-neko.`
};

for (const [relPath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(relPath), { recursive: true });
  fs.writeFileSync(relPath, content.trimStart(), 'utf8');
}

console.log('BLOQUE_1_COMPLETADO: Plantillas actualizadas + ' + Object.keys(files).length + ' archivos creados (EN + FR)');