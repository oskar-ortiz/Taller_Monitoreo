# Taller SO

Taller de Sistemas Operativos, 6.º semestre.

## Versión Linux (WSL2 Ubuntu)

La implementación Linux usa Node.js y las interfaces del kernel (`/proc`, `free`, `vmstat`, `nice` y `taskset`). No reemplaza ni modifica una eventual versión Windows.

### Ejercicio 1: vigilante de RAM y CPU

`linux/ejercicio1-vigilante/vigilante.js` lee `MemTotal` y `MemAvailable` desde `/proc/meminfo`, calcula RAM usada y obtiene CPU mediante diferencias consecutivas de `/proc/stat`. Ejecutar `node vigilante.js 30` (umbral opcional; por defecto 80%). Las alertas se agregan a `alerta_ram.txt` con fecha ISO. Se detiene con Ctrl+C.

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap3-ejercicio1-normal.png]**

### Ejercicio 2: caché del programa y page cache

`linux/ejercicio2-cache/cache.js` usa un `Map`: la primera lectura usa `fs.readFileSync` y las siguientes recuperan el mismo contenido desde el Map, midiendo tiempos. El Map pertenece al proceso Node; la page cache la administra el kernel para bloques de archivos, por lo que son cachés distintas. El archivo de 200 MB es temporal y está ignorado.

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap7-ejercicio2-map.png]**

### Ejercicio 3: memoria y swap

`linux/ejercicio3-estres/estres.js` agrega strings hasta un máximo de objetos o hasta un porcentaje seguro de RAM+swap usados. Muestra `MemAvailable`, `SwapTotal` y `SwapFree`, y libera el array al terminar. `vmstat` permite observar `si` (swap in) y `so` (swap out), pero WSL2 no necesariamente usará swap.

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap11-ejercicio3-estres.png]**

### Ejercicio 4: prioridad y scheduling

`linux/ejercicio4-prioridad/prioridad.js` ejecuta un cálculo CPU-bound por tiempo limitado, mide duración y solicita un nice entre -20 y 19 mediante `os.setPriority()`. `taskset -c 0` permite hacer competir dos instancias en un núcleo. Nice es un ajuste del scheduler normal/CFS; `chrt -f 99` usa SCHED_FIFO, una política de tiempo real distinta y normalmente privilegiada. El resultado depende del entorno y no es una garantía universal.

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap16-ejercicio4-scheduling.png]**

### Comandos y evidencias

Los pasos reproducibles para ejecutar pruebas y tomar capturas están en [`linux/COMANDOS_CAPTURAS.md`](linux/COMANDOS_CAPTURAS.md). También se solicitan evidencias de `uname -a`, `/etc/os-release`, `/proc/meminfo`, `free -h`, `vmstat 1`, `htop` y `swapon --show`.

## Conceptos teóricos relacionados

- **Gestor de memoria:** componente del sistema operativo que asigna, protege, recupera y contabiliza memoria para procesos; el vigilante observa parte de ese estado mediante `/proc`.
- **MMU y protección:** la MMU traduce direcciones virtuales a físicas usando tablas de páginas y separa espacios de procesos, evitando accesos no autorizados. Un proceso Node no lee memoria física arbitraria por usar `/proc`.
- **Asignación contigua:** reserva un bloque físicamente adyacente. Simplifica ciertas traducciones, pero se vuelve difícil cuando quedan huecos.
- **Fragmentación interna:** espacio desperdiciado dentro de un bloque asignado por redondeo o tamaño fijo.
- **Fragmentación externa:** memoria libre repartida en huecos separados; puede impedir una reserva grande aunque el total libre sea suficiente.
- **First Fit, Best Fit y Worst Fit:** estrategias para elegir huecos: el primero suficiente, el más pequeño suficiente o el más grande disponible, respectivamente. Los sistemas modernos suelen combinar paginación y asignadores más especializados, así que estos algoritmos sirven aquí como modelo conceptual.
- **Paginación:** divide memoria virtual y física en páginas y marcos de tamaño fijo, reduciendo fragmentación externa y permitiendo mover páginas.
- **Tablas de páginas:** estructuras que relacionan páginas virtuales con marcos físicos y contienen permisos y bits de estado.
- **Memoria virtual:** abstracción que da a cada proceso un espacio de direcciones aislado y puede respaldar páginas en RAM o almacenamiento.
- **Swap:** respaldo en disco para páginas que no caben o no se necesitan en RAM. Es mucho más lento y su presencia/uso en WSL2 depende de la configuración.

En conjunto, el ejercicio 1 observa contabilidad de memoria y CPU; el 2 contrasta caché de aplicación y del kernel; el 3 relaciona asignación, memoria virtual y swap bajo límites seguros; y el 4 muestra que la planificación afecta el tiempo de CPU, sin convertir una medición puntual en una ley general. En Windows, el proceso/servicio **System** representa trabajo del sistema y del kernel (incluido soporte de memoria y controladores), pero no es un equivalente directo de `/proc`: `/proc` es una interfaz virtual con muchos archivos de observación del kernel Linux.

## Comparación Windows y Linux

| Aspecto | Windows | Linux |
|---|---|---|
| Monitorización | Administrador de tareas y contadores de rendimiento | `top`/`htop`, `/proc`, `free`, `vmstat` |
| Paginación | pagefile.sys | swap, partición o archivo |
| Prioridad | prioridades y clases de Windows | `nice`, `chrt` y políticas de scheduling |
| Rendimiento | contadores de rendimiento | `/proc`, `vmstat`, `free` y herramientas de procesos |

## Evidencias

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap1-sistema-linux.png]**

> **[CAPTURA PENDIENTE: evidencias/linux/linux-cap2-proc-meminfo.png]**

Las capturas Linux todavía deben tomarse desde una sesión real de WSL2 Ubuntu; las pruebas disponibles en este entorno fueron ejecutadas en Amazon Linux y no se presentan como evidencia WSL2. Cuando cada archivo exista, estas referencias relativas funcionarán directamente:

- `linux-cap1-sistema-linux.png` — `uname -a` y `cat /etc/os-release`.
- `linux-cap2-proc-meminfo.png` — `cat /proc/meminfo`.
- `linux-cap3-ejercicio1-normal.png` — ejecución normal de `vigilante.js`.
- `linux-cap4-ejercicio1-alerta.png` — alerta y contenido de `alerta_ram.txt`.
- `linux-cap5-ejercicio2-free-antes.png` — `free -h` antes de la prueba.
- `linux-cap6-ejercicio2-generacion.png` — generación temporal con `dd` (opcional).
- `linux-cap7-ejercicio2-map.png` — lecturas `fs` y `Map` con tiempos.
- `linux-cap8-ejercicio2-free-despues.png` — `free -h` después.
- `linux-cap9-ejercicio2-drop-caches.png` — limpieza de page cache y `free -h`.
- `linux-cap10-ejercicio3-free.png` — observación con `watch -n1 free -h`.
- `linux-cap11-ejercicio3-estres.png` — ejecución controlada de `estres.js`.
- `linux-cap12-ejercicio3-vmstat.png` — columnas `si` y `so` de `vmstat 1`.
- `linux-cap13-ejercicio3-swap.png` — salida de `swapon --show`.
- `linux-cap14-ejercicio3-htop.png` — proceso Node observado en `htop`.
- `linux-cap15-ejercicio4-nice19.png` — ejecución con `nice 19`.
- `linux-cap16-ejercicio4-scheduling.png` — `ps`, `top` o `htop` durante la comparación.

## Abrir desde VS Code en WSL2

Desde Ubuntu/WSL2, no desde PowerShell, abre la carpeta del proyecto y ejecuta:

```bash
cd "RUTA_DEL_PROYECTO"
code .
```

Instala únicamente la extensión Remote - WSL si tu instalación de VS Code la necesita. No se requieren extensiones adicionales para ejecutar los scripts.

## Estado de verificación

- Código Linux: disponible en `linux/`.
- Pruebas locales: realizadas en Amazon Linux con Node.js; no equivalen a una prueba WSL2 Ubuntu.
- Evidencias reales WSL2: pendientes de tomar por el usuario.
- Archivo temporal de 200 MB: eliminado después de la prueba.
- Git: esta carpeta no tiene un repositorio configurado actualmente; no se ejecutaron comandos de inicialización ni publicación.

> Para conocer el comando exacto y qué debe aparecer en cada captura, consulta `linux/COMANDOS_CAPTURAS.md`.

> **[CAPTURAS PENDIENTES: evidencias/linux/]**
