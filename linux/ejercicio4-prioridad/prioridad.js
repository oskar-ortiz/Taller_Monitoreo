#!/usr/bin/env node
'use strict';
const os = require('os');
const prioridad = Number(process.argv[2] ?? 0);
const segundos = Number(process.argv[3] ?? 8);
if (!Number.isInteger(prioridad) || prioridad < -20 || prioridad > 19 || !Number.isFinite(segundos) || segundos <= 0 || segundos > 60) {
  console.error('Uso: node prioridad.js [nice -20..19] [segundos 1..60]'); process.exit(1);
}
try { os.setPriority(process.pid, prioridad); } catch (error) { console.warn(`No se pudo aplicar nice ${prioridad}: ${error.message}`); }
console.log(`PID ${process.pid}; prioridad solicitada ${prioridad}; duración ${segundos}s.`);
const inicio = process.hrtime.bigint();
let operaciones = 0;
while (Number(process.hrtime.bigint() - inicio) / 1e9 < segundos) {
  for (let i = 1; i < 20000; i += 1) operaciones += Math.sqrt(i) * Math.sin(i) ** 2;
}
const transcurrido = Number(process.hrtime.bigint() - inicio) / 1e9;
console.log(`PID ${process.pid} terminó: ${transcurrido.toFixed(3)}s, operaciones=${operaciones.toFixed(0)}.`);
