#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const umbral = Number(process.argv[2] ?? 80);
if (!Number.isFinite(umbral) || umbral < 0 || umbral > 100) {
  console.error('Uso: node vigilante.js [umbral-porcentaje]');
  process.exit(1);
}

const alertaPath = path.join(__dirname, 'alerta_ram.txt');
let lecturaCpuAnterior;
let detenido = false;

function leerMemoria() {
  const datos = Object.fromEntries(fs.readFileSync('/proc/meminfo', 'utf8').split('\n').filter(Boolean).map((linea) => {
    const [clave, valor] = linea.split(/:\s+/);
    return [clave, Number.parseInt(valor, 10)];
  }));
  const total = datos.MemTotal;
  const disponible = datos.MemAvailable;
  const usada = total - disponible;
  return { total, disponible, usada, porcentaje: (usada / total) * 100 };
}

function leerCpu() {
  const linea = fs.readFileSync('/proc/stat', 'utf8').split('\n').find((item) => item.startsWith('cpu '));
  const valores = linea.trim().split(/\s+/).slice(1).map(Number);
  const idle = valores[3] + (valores[4] || 0);
  const total = valores.reduce((suma, valor) => suma + valor, 0);
  const actual = { idle, total };
  let uso = 0;
  if (lecturaCpuAnterior) {
    const deltaTotal = actual.total - lecturaCpuAnterior.total;
    const deltaIdle = actual.idle - lecturaCpuAnterior.idle;
    uso = deltaTotal > 0 ? ((deltaTotal - deltaIdle) / deltaTotal) * 100 : 0;
  }
  lecturaCpuAnterior = actual;
  return uso;
}

function mostrar() {
  const memoria = leerMemoria();
  const cpu = leerCpu();
  const ahora = new Date().toISOString();
  console.log(`${ahora} | RAM: ${memoria.porcentaje.toFixed(2)}% (${(memoria.usada / 1024).toFixed(0)} MiB usados) | CPU: ${cpu.toFixed(2)}%`);
  if (memoria.porcentaje >= umbral) {
    fs.appendFileSync(alertaPath, `${ahora} | RAM sobre umbral (${memoria.porcentaje.toFixed(2)}% >= ${umbral}%)\n`);
    console.warn(`ALERTA: RAM sobre ${umbral}%. Registro escrito en alerta_ram.txt`);
  }
}

function salir() {
  if (detenido) return;
  detenido = true;
  console.log('\nVigilante detenido limpiamente.');
  process.exit(0);
}

process.on('SIGINT', salir);
console.log(`Vigilante Linux iniciado. Umbral RAM: ${umbral}%. Ctrl+C para terminar.`);
mostrar();
const intervalo = setInterval(mostrar, 1000);
process.on('exit', () => clearInterval(intervalo));

// La función queda activa hasta Ctrl+C para observar cambios reales en /proc.
setInterval(() => {}, 2 ** 30);

module.exports = { leerMemoria, leerCpu };

