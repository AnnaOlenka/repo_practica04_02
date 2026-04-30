# Sistema solar orbital con Canvas API

Pagina web vanilla JS sobre planetas orbitando con fondo animado de estrellas, control de velocidad orbital y densidad interactiva del campo estelar.

## Archivos

- `index.html`: estructura DOM, controles, `<canvas>` y carga diferida con `defer`.
- `styles.css`: estilos, clases dinamicas y variables CSS.
- `app.js`: logica ES6+, IIFE, closures, DOM API, Canvas API y animacion con `requestAnimationFrame`.

## Temas aplicados

- IIFE para aislar el scope global.
- Closure en `createAnimationStore()` para conservar `state`, `rafId`, FPS y estrellas entre frames.
- Arrow functions para handlers y utilidades.
- Manipulacion DOM con `querySelector`, `addEventListener`, delegacion por bubbling, `replaceChildren`, `classList.toggle()` y variables CSS.
- Controles interactivos para velocidad orbital, pausa, orbitas visibles y densidad de estrellas.
- Canvas 2D con `arc`, `ellipse`, `fillRect`, `stroke`, gradientes y render loop.
- Movimiento uniforme con `delta time`, sin `setInterval`.
- Optimizacion con `requestAnimationFrame`, `cancelAnimationFrame`, resize controlado y limpieza en `pagehide`.

## Metricas de rendimiento

La UI muestra un contador FPS calculado cada 0.5 segundos. En pruebas locales esperadas:

- FPS objetivo: 55-60 FPS en pantallas normales.
- Estrellas: se ajustan segun area del canvas para evitar carga excesiva.
- Listeners: se registran una vez en `bindEvents()`; `pagehide` cancela el frame activo para prevenir loops huerfanos.
- Reflow/repaint: los cambios frecuentes se dibujan en Canvas; la UI usa `classList.toggle()` y variables CSS en vez de estilos inline repetidos.

## Como revisar con DevTools

1. Abrir `index.html` en el navegador.
2. En Performance, grabar 5 a 10 segundos mientras se cambia la velocidad.
3. Verificar que el trabajo principal ocurra dentro de `requestAnimationFrame`.
4. En Memory, tomar snapshots antes y despues de pausar/reanudar; no deben crecer nodos detached porque la lista de planetas se crea una vez.

## Restricciones cumplidas

- Sin frameworks.
- Sin librerias externas.
- Sin `setInterval` para animacion.
- Codigo separado en HTML, CSS y JS.
