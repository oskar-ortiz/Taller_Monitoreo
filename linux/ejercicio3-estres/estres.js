#!/usr/bin/env node
'use strict';
const fs = require('fs');

const maxObjetos = Number(process.argv[2] || 500000);
const limiteUso = Number(process.argv[3] || 70);
if (!Number.isSafeInteger(maxObjetos) || maxObjetos < 1 || !Number.isFinite(limiteUso) || limiteUso <= 0 || limiteUso > 100) {
  console.error('Uso: node estres.js [max-objetos] [limite-memoria+swap-%]');
  process.exit(1);
}
function memoria() {
  const datos = Object.fromEntries(fs.readFileSync('/proc/meminfo', 'utf8').split('\n').filter(Boolean).map((linea) => {
    const [clave, valor] = linea.split(/:\s+/); return [clave, Number.parseInt(valor, 10)];
  }));
  const total = datos.MemTotal + datos.SwapTotal;
  const disponible = datos.MemAvailable + datos.SwapFree;
  return { ...datos, porcentaje: ((total - disponible) / total) * 100 };
}
const objetos = [];
let detenido = false;
function liberar() { objetos.length = 0; }
function salir(mensaje) { if (!detenido) { detenido = true; liberar(); console.log(`\n${mensaje} Memoria liberada; objetos: ${objetos.length}.`); } }
process.on('SIGINT', () => { salir('Interrumpido con Ctrl+C.'); process.exit(0); });
try {
  while (objetos.length < maxObjetos) {
    for (let i = 0; i < 10000 && objetos.length < maxObjetos; i += 1) objetos.push(`objeto-de-prueba-${objetos.length}-${'x'.repeat(80)}`);
    const m = memoria();
    console.log(`Objetos: ${objetos.length}/${maxObjetos} | uso RAM+swap: ${m.porcentaje.toFixed(2)}% | MemAvailable: ${(m.MemAvailable / 1024).toFixed(0)} MiB | SwapTotal: ${(m.SwapTotal / 1024).toFixed(0)} MiB | SwapFree: ${(m.SwapFree / 1024).toFixed(0)} MiB`);
    if (m.porcentaje >= limiteUso) { salir(`Límite de seguridad alcanzado (${limiteUso}%).`); break; }
  }
  if (!detenido) salir('Límite de objetos alcanzado.');
} finally { liberar(); }
