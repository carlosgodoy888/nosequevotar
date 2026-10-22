// Plantilla base: metadatos, cabecera con menú, contenido y pie.
import { esc } from './util.mjs';
import { cabecera, pie } from './parciales.mjs';

// pagina: { ruta, titulo, descripcion, contenido, miga?, indexar?, canonico?, csp?, sinMedicion?, estilos?, modulos?, pieNota? }
// - csp: meta Content-Security-Policy con default-src 'self' (los juegos no cargan nada de otros dominios).
// - sinMedicion: <body data-sin-medicion>; registrarEvento() no hace nada en esa página.
// - estilos y modulos: hojas de estilo y módulos JavaScript propios de la página.
// - pieNota: una línea más en el pie.
// miga: [{ texto, ruta }] desde Inicio hasta la página actual (incluida).
export function base(sitio, pagina) {
  const url = sitio.url + pagina.ruta;
  const indexar = pagina.indexar !== false;
  const canonico = pagina.canonico !== false;
  const tituloCompleto = pagina.ruta === '/' ? pagina.titulo : `${pagina.titulo} · ${sitio.nombre}`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
${pagina.csp ? `<meta http-equiv="Content-Security-Policy" content="default-src 'self'">\n` : ''}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(pagina.descripcion)}">
${canonico ? `<link rel="canonical" href="${url}">\n` : ''}${indexar ? '' : '<meta name="robots" content="noindex">\n'}<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(sitio.nombre)}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(pagina.titulo)}">
<meta property="og:description" content="${esc(pagina.descripcion)}">
<meta property="og:locale" content="es_ES">
${indexar ? imagenCompartir(sitio) : ''}<meta name="theme-color" content="#EFE3C8">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icono-180.png">
<link rel="preload" href="/fuentes/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fuentes/source-serif-4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/estilo.css?v=${sitio.version}">
${(pagina.estilos || []).map(e => `<link rel="stylesheet" href="${e}?v=${sitio.version}">\n`).join('')}${indexar && pagina.miga ? migaEstructurada(sitio, pagina.miga) : ''}<script src="/sitio.js?v=${sitio.version}" defer></script>
${(pagina.modulos || []).map(m => `<script type="module" src="${m}?v=${sitio.version}"></script>\n`).join('')}</head>
<body${pagina.sinMedicion ? ' data-sin-medicion' : ''}>
<a class="saltar" href="#contenido">Saltar al contenido</a>
${cabecera(sitio, pagina.ruta)}
<main id="contenido" tabindex="-1">
${pagina.contenido}
</main>
${pie(sitio, pagina.pieNota)}
</body>
</html>
`;
}

// Imagen para compartir (src/estatico/og.png), solo en las páginas reales.
function imagenCompartir(sitio) {
  return `<meta property="og:image" content="${sitio.url}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="No sé qué votar: todo lo que necesitas para votar, sin siglas.">
<meta name="twitter:card" content="summary_large_image">
`;
}

// Datos estructurados BreadcrumbList.
function migaEstructurada(sitio, miga) {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: miga.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.texto,
      item: sitio.url + m.ruta,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(datos).replace(/</g, '\\u003c')}</script>\n`;
}
