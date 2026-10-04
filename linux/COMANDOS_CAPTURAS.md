# Comandos para capturas Linux (Amazon Linux 2023)

No ejecutar Git ni subir archivos. Las capturas deben guardarse en `evidencias/linux/` con los nombres indicados. Use una terminal para el programa y otra para observación; deje visible el título/comando y la salida solicitada.

1. **Sistema Linux (Terminal A):** `uname -a` y luego `cat /etc/os-release`. Captura: `evidencias/linux/linux-cap1-sistema-linux.png`.
2. **Memoria del kernel (Terminal A):** `cat /proc/meminfo`. Captura: `evidencias/linux/linux-cap2-proc-meminfo.png`.
3. **Ejercicio 1, ejecución (Terminal A):** `cd linux/ejercicio1-vigilante && node vigilante.js 80`; deje varias líneas RAM/CPU visibles y detenga con Ctrl+C. Captura: `evidencias/linux/linux-cap3-ejercicio1-normal.png`.
4. **Ejercicio 1, alerta (Terminal A):** `cd linux/ejercicio1-vigilante && node vigilante.js 30`; deje visible `ALERTA` y en otra terminal ejecute `cat linux/ejercicio1-vigilante/alerta_ram.txt`. Captura: `evidencias/linux/linux-cap4-ejercicio1-alerta.png`.
5. **Ejercicio 2, antes (Terminal B):** `cd linux/ejercicio2-cache && free -h`. Captura: `evidencias/linux/linux-cap5-ejercicio2-free-antes.png`.
6. **Ejercicio 2, archivo temporal (Terminal B):** `cd linux/ejercicio2-cache && dd if=/dev/urandom of=archivo-prueba.bin bs=1M count=200 status=progress`. Captura opcional: `evidencias/linux/linux-cap6-ejercicio2-generacion.png`.
7. **Ejercicio 2, Map (Terminal A):** `cd linux/ejercicio2-cache && node cache.js`; deje visibles los tiempos y los orígenes Map/fs. Captura: `evidencias/linux/linux-cap7-ejercicio2-map.png`.
8. **Ejercicio 2, después (Terminal B):** `free -h`. Captura: `evidencias/linux/linux-cap8-ejercicio2-free-despues.png`.
9. **Ejercicio 2, page cache (Terminal B, requiere sudo):** `sync; echo 3 | sudo tee /proc/sys/vm/drop_caches`, confirme que entiende que limpia cachés del kernel y repita `free -h`. Captura: `evidencias/linux/linux-cap9-ejercicio2-drop-caches.png`. No confundir esta page cache con el Map.
10. **Limpieza ejercicio 2 (Terminal B):** `rm -f linux/ejercicio2-cache/archivo-prueba.bin`.
11. **Ejercicio 3, observación (Terminal B):** `watch -n1 free -h`. Captura: `evidencias/linux/linux-cap10-ejercicio3-free.png`.
12. **Ejercicio 3, programa (Terminal A):** `cd linux/ejercicio3-estres && node estres.js 150000 60`; use límites seguros y detenga con Ctrl+C si el sistema se degrada. Captura: `evidencias/linux/linux-cap11-ejercicio3-estres.png`.
13. **Ejercicio 3, vmstat (Terminal B):** `vmstat 1`; observe `si` (swap in) y `so` (swap out). Captura: `evidencias/linux/linux-cap12-ejercicio3-vmstat.png`.
14. **Ejercicio 3, swap (Terminal B):** `swapon --show`. Captura: `evidencias/linux/linux-cap13-ejercicio3-swap.png`.
15. **Ejercicio 3, procesos (Terminal B):** `htop`; busque el proceso Node y salga con F10. Captura: `evidencias/linux/linux-cap14-ejercicio3-htop.png`.
16. **Ejercicio 4, baja prioridad (Terminal A):** `cd linux/ejercicio4-prioridad && taskset -c 0 node prioridad.js 19 10`. Captura: `evidencias/linux/linux-cap15-ejercicio4-nice19.png`.
17. **Ejercicio 4, comparación (Terminal A):** en dos terminales ejecute simultáneamente `taskset -c 0 node prioridad.js 19 10` y `taskset -c 0 node prioridad.js -5 10`. El nice negativo puede requerir permisos y fallar de forma controlada; alternativa limitada: `sudo timeout 10s taskset -c 0 chrt -f 99 node prioridad.js 0 8`. SCHED_FIFO requiere privilegios y tiene semántica distinta; no deje procesos activos.
18. **Ejercicio 4, inspección (Terminal B):** mientras corren, `ps -eo pid,ni,pri,cls,comm`, `top` o `htop`. Captura: `evidencias/linux/linux-cap16-ejercicio4-scheduling.png`.
19. **Limpieza final:** compruebe `pgrep -af 'vigilante|cache.js|estres.js|prioridad.js'`; si queda algún proceso de prueba identificado, use `kill PID` y verifique de nuevo.

## Lista final de capturas pendientes

- cap1 sistema Linux
- cap2 `/proc/meminfo`
- cap3–4 ejercicio 1
- cap5–9 ejercicio 2
- cap10–14 ejercicio 3
- cap15–16 ejercicio 4

El swap no está garantizado: depende de la memoria disponible y de la configuración de WSL2. `nice` ajusta prioridad en el scheduler normal/CFS; `chrt` cambia a una política de tiempo real y puede afectar más al sistema, por eso la duración es limitada.
