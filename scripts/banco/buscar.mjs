// Localiza en el texto extraído las páginas de cada tema, para leer solo esas.
//
//   node scripts/banco/buscar.mjs <documento> indice              páginas con índice o sumario
//   node scripts/banco/buscar.mjs <documento> <tema>              páginas con palabras clave del tema, ordenadas por coincidencias
//   node scripts/banco/buscar.mjs <documento> paginas 30-32 [40]  texto de esas páginas
//   node scripts/banco/buscar.mjs <documento> buscar "<texto>"    páginas donde aparece un texto (sin distinguir mayúsculas)
//
// <documento> es 2023-pp, 2023-psoe, 2023-vox, 2023-sumar, 2023-erc, 2023-junts, 2023-pnv,
// 2023-bildu, 2023-bng o 2023-cc. Solo lee datos/banco/textos/.

import { join } from 'node:path';
import { TEXTOS, leerJson } from './comun.mjs';

// Palabras clave en castellano, catalán y gallego (raíces, sin distinguir mayúsculas ni tildes).
export const CLAVES = {
  vivienda: ['vivienda', 'habitatge', 'vivenda', 'alquiler', 'lloguer', 'aluguer', 'arrendamiento', 'hipoteca', 'desahucio', 'desnonament', 'despexo', 'okupa', 'ocupacion ilegal', 'ocupacio', 'suelo', 'pisos turistic', 'vivendas baleiras', 'habitatges buits', 'viviendas vacias', 'parque publico', 'parc public', 'zonas tensionadas', 'emancipacion'],
  impuestos: ['irpf', 'impuesto', 'impost', 'imposto', 'tributa', 'fiscal', 'iva', 'sociedades', 'societats', 'sociedades', 'patrimonio', 'patrimoni', 'sucesiones', 'successions', 'sucesions', 'donaciones', 'herencia', 'fraude', 'frau', 'evasion', 'elusion', 'deduccion', 'deduccio', 'deducion', 'renta', 'renda', 'tipo marginal', 'progresiv'],
  inmigracion: ['inmigra', 'immigra', 'migra', 'frontera', 'extranjer', 'estranger', 'estranxeir', 'irregular', 'regulariza', 'regularitza', 'asilo', 'asil', 'refugi', 'refuxi', 'menores no acompa', 'menors no acompa', 'mena', 'cie', 'arraigo', 'arrelament', 'ceuta', 'melilla', 'pateras', 'devoluci', 'expulsi', 'integraci'],
  empleo: ['salario minimo', 'smi', 'salari minim', 'salario minimo', 'salario', 'salari', 'jornada', 'contrato', 'contracte', 'contrato', 'despido', 'acomiadament', 'despedimento', 'desempleo', 'atur', 'paro', 'autonomo', 'autonom', 'reforma laboral', 'convenio', 'conveni', 'trabajador', 'treballador', 'traballador', 'empleo', 'ocupacio', 'emprego', 'cuota', 'quota', '37,5', '32 horas', 'cuatro dias', 'semana laboral'],
  pensiones: ['pension', 'pensio', 'jubila', 'retiro', 'ipc', 'revaloriza', 'revaloritza', 'seguridad social', 'seguretat social', 'seguridade social', 'cotiza', 'cotitza', 'cotiza', 'edad de jubilacion', 'pacto de toledo', 'pacte de toledo', 'viudedad', 'viduitat', 'viuvez', 'no contributiva'],
  sanidad: ['sanidad', 'sanitat', 'sanidade', 'sanitari', 'salud', 'salut', 'saude', 'listas de espera', 'llistes d\'espera', 'listas de espera', 'atencion primaria', 'atencio primaria', 'atencion primaria', 'centros de salud', 'cap ', 'salud mental', 'salut mental', 'saude mental', 'medico', 'metge', 'medic', 'enfermer', 'infermer', 'hospital', 'mir', 'privatiza', 'concierto', 'concert', 'copago', 'dental'],
};

const sinTildes = (t) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function contar(texto, claves) {
  const t = sinTildes(texto);
  let n = 0;
  const vistas = [];
  for (const c of claves) {
    const k = sinTildes(c);
    const veces = t.split(k).length - 1;
    if (veces) { n += veces; vistas.push(`${c}×${veces}`); }
  }
  return { n, vistas };
}

function rango(arg) {
  const [a, b] = arg.split('-').map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => a + i);
}

async function main() {
  const [doc, orden, ...resto] = process.argv.slice(2);
  if (!doc || !orden) {
    console.error('Uso: node scripts/banco/buscar.mjs <documento> indice | <tema> | paginas <a-b> … | buscar "<texto>"');
    process.exit(1);
  }
  const paginas = await leerJson(join(TEXTOS, `${doc}.json`));

  if (orden === 'paginas') {
    for (const n of resto.flatMap(rango)) {
      const p = paginas[n - 1];
      if (p) console.log(`\n===== ${doc} · página ${n} =====\n${p.texto}`);
    }
    return;
  }
  if (orden === 'buscar') {
    const q = sinTildes(resto.join(' '));
    for (const p of paginas) {
      const t = sinTildes(p.texto);
      const i = t.indexOf(q);
      if (i >= 0) console.log(`p.${p.pagina}: …${p.texto.slice(Math.max(0, i - 80), i + 160).replace(/\s+/g, ' ')}…`);
    }
    return;
  }
  if (orden === 'indice') {
    const marcas = ['indice', 'index', 'sumario', 'sumari', 'contenido'];
    const encontradas = paginas.filter(p => marcas.some(m => sinTildes(p.texto).includes(m))).slice(0, 8).map(p => p.pagina);
    console.log(`Páginas con índice o sumario: ${encontradas.join(', ') || 'ninguna'}`);
    return;
  }
  const claves = CLAVES[orden];
  if (!claves) throw new Error(`Tema desconocido: ${orden}. Temas: ${Object.keys(CLAVES).join(', ')}`);
  const filas = paginas.map(p => ({ pagina: p.pagina, ...contar(p.texto, claves) })).filter(f => f.n > 0).sort((a, b) => b.n - a.n);
  console.log(`${doc} · ${orden}: ${filas.length} páginas con alguna palabra clave`);
  for (const f of filas.slice(0, 40)) console.log(`p.${f.pagina}\t${f.n}\t${f.vistas.join(', ')}`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
