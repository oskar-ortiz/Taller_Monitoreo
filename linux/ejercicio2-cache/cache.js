#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const cache = new Map();
const archivo = process.argv[2] || path.join(__dirname, 'archivo-prueba.bin');

function leerConMap(ruta) {
  if (cache.has(ruta)) {
    console.log('Origen: Map de Node.js (memoria administrada por el proceso)');
    return cache.get(ruta);
  }
  console.log('Origen: fs.readFileSync (primera lectura lógica desde archivo)');
  const contenido = fs.readFileSync(ruta);
  cache.set(ruta, contenido);
  return contenido;
}

if (!fs.existsSync(archivo)) {
  console.error(`No existe ${archivo}. Créalo con: dd if=/dev/urandom of=archivo-prueba.bin bs=1M count=200 status=progress`);
  process.exit(1);
}
for (let i = 1; i <= 3; i += 1) {
  console.time(`lectura-${i}`);
  const contenido = leerConMap(archivo);
  console.timeEnd(`lectura-${i}`);
  console.log(`Lectura ${i}: ${contenido.length} bytes; entradas en Map: ${cache.size}`);
}
console.log('\nMap: caché explícita del programa, con referencias al contenido leído.');
console.log('Page cache: caché implícita del kernel Linux para bloques de archivos; puede beneficiar incluso lecturas que no usan este Map. Son mecanismos distintos.');
