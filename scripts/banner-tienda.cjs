'use strict';
const fs = require('fs');

// Archivos posibles donde está la cabecera de la tienda / catálogo
const archivosTienda = [
  { ruta: 'src/components/TiendaPage.astro', rutaImport: './FengShuiHomeBanner.astro', idioma: 'lang' },
  { ruta: 'src/pages/tienda/index.astro', rutaImport: '../../components/FengShuiHomeBanner.astro', idioma: '"es"' },
  { ruta: 'src/pages/[lang]/tienda/index.astro', rutaImport: '../../../components/FengShuiHomeBanner.astro', idioma: 'lang' },
];

let modificado = false;

for (const archivo of archivosTienda) {
  if (!fs.existsSync(archivo.ruta)) continue;

  let contenido = fs.readFileSync(archivo.ruta, 'utf8');

  // Si este archivo no contiene la cabecera con ondas (bg-seigaiha), pasamos al siguiente
  if (!contenido.includes('bg-seigaiha')) continue;

  if (contenido.includes('FengShuiHomeBanner')) {
    console.log('El banner ya estaba colocado en:', archivo.ruta);
    modificado = true;
    continue;
  }

  // 1. Añadimos la importación del banner al principio del archivo
  contenido = contenido.replace(
    /^---\r?\n/,
    `---\nimport FengShuiHomeBanner from '${archivo.rutaImport}';\n`
  );

  // 2. Insertamos el banner justo al final de la cabecera de "Figuras Tradicionales"
  contenido = contenido.replace(
    /(bg-seigaiha[\s\S]*?)(\r?\n[ \t]*<\/div>\r?\n[ \t]*<\/section>)/,
    `$1\n\n    <FengShuiHomeBanner lang={${archivo.idioma}} />$2`
  );

  fs.writeFileSync(archivo.ruta, contenido, 'utf8');
  console.log('Banner añadido correctamente en:', archivo.ruta);
  modificado = true;
}

if (!modificado) {
  console.log('No se encontró la cabecera del catálogo. Avísame para revisar la ruta.');
}