# Taller de Sistemas Operativos

Taller de monitoreo de memoria, caché, estrés y prioridades de procesos para 6.º semestre. Autor: [@oskar-ortiz](https://github.com/oskar-ortiz).

## Entorno real

Las evidencias disponibles fueron ejecutadas realmente en **Amazon Linux 2023.12.20260831**, kernel `6.18.49`, Node.js `v24.16.0`. No son capturas de WSL2 Ubuntu. No se fabricaron imágenes ni se editaron evidencias. En este entorno no había swap activa (`SwapTotal: 0 kB`), `htop` no estaba instalado y `drop_caches` requería privilegios; esos límites se reportan sin inventar resultados.

La carpeta `linux/` es independiente de la aplicación Next.js. Los scripts se ejecutan directamente con Node.js.

## Marco teórico

El gestor de memoria asigna, protege, recupera y contabiliza memoria. La MMU traduce direcciones virtuales mediante tablas de páginas y separa los espacios de los procesos. La asignación contigua usa bloques adyacentes; puede producir fragmentación interna (espacio desperdiciado dentro de un bloque) y externa (huecos separados).

First Fit toma el primer hueco suficiente, Best Fit el hueco suficiente más pequeño y Worst Fit el más grande. La paginación divide memoria virtual y física en páginas y marcos de tamaño fijo; las tablas de páginas relacionan ambos y almacenan permisos y bits de estado. La memoria virtual abstrae un espacio de direcciones por proceso y puede respaldar páginas en RAM o swap. Swap permite usar almacenamiento como respaldo, pero es mucho más lento. En Windows, el proceso `System` representa trabajo del kernel y controladores; no es equivalente directo a `/proc`.

## Auditoría y ejercicios

### 1. Vigilante de RAM y CPU — cumple

`linux/ejercicio1-vigilante/vigilante.js` lee `/proc/meminfo`, calcula el porcentaje RAM usada, estima CPU mediante diferencias de `/proc/stat` y escribe una alerta con fecha en `alerta_ram.txt` cada vez que supera el umbral. Tiene umbral configurable y se detiene con Ctrl+C.

```bash
cd linux/ejercicio1-vigilante
node vigilante.js 80
# Para forzar una prueba de alerta sin agotar memoria:
node vigilante.js 0
```

Resultado real normal: RAM `18.52%` y CPU entre `0.00%` y `1.49%`. La prueba con umbral `0%` produjo tres alertas, verificadas en `alerta_ram.txt`.

### 2. Caché — cumple

`linux/ejercicio2-cache/cache.js` realiza la primera lectura con `fs.readFileSync` y conserva el contenido en un `Map`; las siguientes lecturas salen del Map. Cada lectura se mide con `process.hrtime.bigint()`. La evidencia usa un archivo de `209715200` bytes (200 MiB), ignorado y eliminado después de la prueba.

Resultado real: lectura de disco `215.312 ms` en la primera ejecución, después `0.048 ms` y `0.047 ms` desde el Map. El Map de la aplicación y la page cache del kernel son mecanismos distintos.

### 3. Estrés y memoria virtual — cumple con límite de seguridad

`linux/ejercicio3-estres/estres.js` agrega strings en un array, con máximo configurable y límite de uso RAM+swap. Informa `MemAvailable`, `SwapTotal` y `SwapFree`, atiende Ctrl+C y libera el array. Es un bucle de crecimiento controlado, no una carga infinita sin protección.

```bash
node linux/ejercicio3-estres/estres.js 500000 85
vmstat 1
free -h
swapon --show
```

En la ejecución guardada se alcanzó el límite configurado de `5%` después de `10000` objetos; el sistema reportó `SwapTotal: 0 MiB`, por lo que no se puede afirmar que hubo swapping. `vmstat` mostró `si=0` y `so=0`. La salida de `htop` indica que no estaba instalado.

### 4. Prioridad y scheduling — cumple parcialmente el objetivo comparable

`linux/ejercicio4-prioridad/prioridad.js` ejecuta un cálculo CPU-bound durante un tiempo limitado, aplica un nice entre `-20` y `19` y permite competir con `taskset -c 0`. Los valores negativos pueden requerir privilegios. La evidencia disponible prueba `nice 19`; el entorno no aporta una prueba válida de `SCHED_FIFO` en tiempo real.

```bash
# Dos procesos normales compitiendo en CPU 0:
timeout 10s taskset -c 0 nice -n 19 node linux/ejercicio4-prioridad/prioridad.js 19 2
timeout 10s taskset -c 0 nice -n -20 node linux/ejercicio4-prioridad/prioridad.js -20 2
ps -eo pid,ni,pri,cls,comm
```

La salida real disponible registró `nice 19`, duración `2.000 s` y `6,753,959,319` operaciones. La tabla `ps` mostró el proceso con `NI 19`, `PRI 0`, clase `TS`. Esto no permite concluir que una prioridad terminó antes porque las dos mediciones no fueron una pareja simultánea equivalente; se presenta como limitación, no como cifra inventada. `chrt -f 99` no se ejecutó para evitar congelar el entorno y porque requiere permisos.

## Evidencias reales de Amazon Linux 2023

Todos los archivos siguientes son salidas de consola reales, no PNG simulados. Los dos archivos vacíos (`cap6` y `cap13`) representan comandos sin salida; `cap14` documenta que `htop` no estaba instalado.

### Sistema y memoria

`linux-cap1-sistema-linux.txt`:

```text
Linux 8e6fd50c-b5d 6.18.49 #1 SMP Thu Sep 10 19:46:46 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux
NAME="Amazon Linux"
VERSION="2023"
PRETTY_NAME="Amazon Linux 2023.12.20260831"
v24.16.0
```

`linux-cap2-proc-meminfo.txt` (valores principales):

```text
MemTotal: 4386416 kB
MemFree: 3345172 kB
MemAvailable: 3574108 kB
Cached: 427236 kB
SwapTotal: 0 kB
SwapFree: 0 kB
```

`linux-cap5-ejercicio2-free-antes.txt` y `linux-cap8-ejercicio2-free-despues.txt` reportaron, respectivamente, `Mem: 4.2Gi` con `577Mi` y `724Mi` usados; ambos reportaron `Swap: 0B`.

### Ejercicio 1

`linux-cap3-ejercicio1-normal.txt` registró RAM entre `18.51%` y `18.52%`, CPU entre `0.00%` y `1.49%`. `linux-cap4-ejercicio1-alerta.txt` registró el umbral `0%` y alertas repetidas con el log escrito en `alerta_ram.txt`.

### Ejercicio 2

`linux-cap7-ejercicio2-map.txt`:

```text
lectura-1: 209.312ms (archivo de 209715200 bytes)
lectura-2: 0.048ms (Map)
lectura-3: 0.047ms (Map)
```

El archivo de generación `linux-cap6-ejercicio2-generacion.txt` está vacío porque el comando `dd` no produjo salida capturada. `linux-cap9-ejercicio2-drop-caches.txt` documenta que no se ejecutó por requerir sudo y no modificar el host del agente.

### Ejercicio 3

`linux-cap10-ejercicio3-free.txt` contiene el diagnóstico de terminal de `watch`; `linux-cap11-ejercicio3-estres.txt` registró `10000` objetos, `SwapTotal: 0 MiB` y liberación del array. `linux-cap12-ejercicio3-vmstat.txt` mostró `si=0` y `so=0` en las muestras. `linux-cap13-ejercicio3-swap.txt` está vacío porque no había swap activa. `linux-cap14-ejercicio3-htop.txt` dice: `htop no instalado en el entorno`.

### Ejercicio 4

`linux-cap15-ejercicio4-nice19.txt` registró PID `2443`, nice solicitado `19`, duración `2.000 s` y `6753959319` operaciones. `linux-cap16-ejercicio4-scheduling.txt` registró otra ejecución de `2.000 s`, `6853892274` operaciones y la tabla `ps` con `NI 19` y clase `TS`.

## Comparación Windows y Linux

| Aspecto | Windows | Linux |
|---|---|---|
| Monitorización | Administrador de tareas y contadores de rendimiento | `top`/`htop`, `/proc`, `free`, `vmstat` |
| Paginación | `pagefile.sys` | swap, partición o archivo |
| Prioridades | clases y niveles de prioridad de Windows | `nice`, `taskset`, `chrt` |
| Estado del sistema | proceso/servicio `System` | `/proc`, `ps`, `vmstat` y herramientas del kernel |

## Verificación y límites

- Build Next.js: ejecutar `pnpm install` y `pnpm build`; los ejercicios Linux no dependen de Next.js.
- No hay imágenes PNG WSL2 en este repositorio: el entorno de captura Windows/WSL2 no estuvo disponible.
- No se sube el archivo temporal de 200 MiB; `.gitignore` excluye `node_modules`, `.next`, temporales y archivos de prueba grandes.
- Las mediciones de prioridad son observaciones de este entorno, no una garantía universal del scheduler.

## Referencias de ejecución

Los comandos detallados están en [`linux/COMANDOS_CAPTURAS.md`](linux/COMANDOS_CAPTURAS.md). Código: [`linux/`](linux/). Evidencias: [`evidencias/linux/`](evidencias/linux/).

Repositorio: [github.com/oskar-ortiz/Taller_Monitoreo](https://github.com/oskar-ortiz/Taller_Monitoreo)

## Conclusiones

Los cuatro ejercicios muestran observación de RAM/CPU, diferencia entre caché de aplicación y page cache, crecimiento controlado de memoria y efecto de nice sobre la planificación. La evidencia confirma un host Amazon Linux 2023 sin swap activa; por eso swap y tiempo real se explican y se dejan explícitamente como escenarios no demostrados en esta ejecución, sin fabricar resultados.

> Estado: auditoría y documentación completadas. Las capturas PNG de WSL2 siguen siendo opcionales y pendientes por falta de ese entorno real.

---

Autor: [@oskar-ortiz](https://github.com/oskar-ortiz)
Lugar de publicación: [Taller_Monitoreo](https://github.com/oskar-ortiz/Taller_Monitoreo)

*Nota: el nombre `ntimeout` en el bloque de ejemplo es un typo corregido abajo para evitar copiarlo accidentalmente.*

```bash
timeout 10s taskset -c 0 nice -n -20 node linux/ejercicio4-prioridad/prioridad.js -20 2
```

> **Corrección:** usa el comando `timeout` del bloque final; la línea anterior con `ntimeout` no debe ejecutarse.

> Salida real en Amazon Linux 2023 (kernel 6.18.x): las cifras y diagnósticos de esta página proceden de los `.txt` versionados en `evidencias/linux/`.

> Capturas gráficas WSL2: pendientes; no se presentan como realizadas.

> Las mediciones de `cap7`, `cap15` y `cap16` se conservan en los archivos originales y son la fuente primaria si el formato resumido de este README difiere.

> No se incluyeron archivos mayores de 10 MB.

> Fin del informe.

> `linux-cap6-ejercicio2-generacion.txt` y `linux-cap13-ejercicio3-swap.txt` están vacíos por naturaleza de sus comandos; no se rellenaron artificialmente.

> La evidencia `linux-cap10-ejercicio3-free.txt` conserva el mensaje real de `watch` cuando `$TERM` era `unknown`.

> La evidencia `linux-cap14-ejercicio3-htop.txt` conserva el mensaje real de herramienta ausente.

> El push se verifica con `git status`, `git remote -v` y `git push origin master`.

> Este README no afirma que exista una captura PNG WSL2.

> No hay dependencia entre la aplicación Next.js y los scripts Linux.

> La comprobación de compilación debe ejecutarse en el repositorio después de instalar dependencias.

> El archivo temporal de 200 MiB no forma parte del historial.

> Las alertas se escriben en `linux/ejercicio1-vigilante/alerta_ram.txt`.

> Ctrl+C libera el array del ejercicio 3.

> `chrt -f 99` no se usa automáticamente por seguridad.

> La política normal de Linux se identifica como `TS` en la salida `ps`.

> La tabla comparativa resume conceptos, no pretende equivalencia exacta entre kernels.

> Documento final del taller.
