# Funcionamiento del proyecto

Este proyecto es un clon sencillo de **Asteroids** hecho con HTML5 Canvas y JavaScript puro, sin dependencias ni compilacion.

- `index.html` define la pagina y un canvas fijo de `800x600`; carga `game.js` directamente.
- `game.js` contiene toda la aplicacion: entrada de teclado, entidades, estado, fisicas, colisiones, renderizado y el loop de animacion.
- El juego se actualiza mediante `requestAnimationFrame`. Cada frame calcula `dt`, actualiza el estado y dibuja la escena.
- La nave rota con flechas, acelera con `ArrowUp` y dispara con `Espacio`.
- Las entidades principales son `Ship`, `Asteroid`, `ShootingStar`, `Bullet`, `Particle` y `SpeedPowerUp`.
- Las coordenadas se envuelven con `wrap()`: salir por un borde reaparece en el opuesto.
- Los asteroides grandes se dividen en dos mas pequenos; eliminarlos suma puntos segun su tamano.
- La partida maneja los estados `playing`, `dead` y `gameover`, con tres vidas, reaparicion con invencibilidad temporal y reinicio con espacio.
- Las colisiones se resuelven con distancia entre centros: bala-asteroide, nave-asteroide y nave-power-up.
- La **estrella fugaz** aparece con una probabilidad del 15% al generar asteroides y vuelve a aparecer cada 8-14 segundos si no hay otra activa. Se mueve a 190-250 px/s, otorga 150 puntos, no se divide y desaparece tras 8 segundos.
- Power-up **Velocidad** (⚡): aparece aleatoriamente; al recogerlo duplica la aceleración de propulsión 5 segundos, renovando el temporizador si se recoge otro.
- Power-up **Triple shot** (3): aparece aleatoriamente; al recogerlo dispara tres proyectiles paralelos durante 5 segundos, renovando el temporizador si se recoge otro.
- Para ejecutarlo basta abrir `index.html` o usar `npx serve .` y visitar `http://localhost:3000`.

No hay tests, bundler ni framework: los cambios de jugabilidad se verifican manualmente en el navegador.
