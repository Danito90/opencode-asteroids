# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Incluye power-ups especiales y tipos de asteroides únicos como la estrella fugaz.

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |

## Power-ups

| Power-up   | Efecto                              | Duración |
| ---------- | ----------------------------------- | -------- |
| ⚡ Velocidad | Duplica la aceleración de propulsión | 5 seg    |
| S Escudo | Protege la nave de colisiones con asteroides | 5 seg |

Los power-ups aparecen aleatoriamente en el campo de juego. Tócalos con la nave para activarlos.

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 150 |

La **estrella fugaz** aparece en el 15% de las posiciones iniciales de asteroides y vuelve a aparecer periódicamente cada 8-14 segundos. Se mueve más rápido que los asteroides normales, deja una estela y desaparece después de 8 segundos. No se divide en fragmentos.

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up **Velocidad**: duplica el empuje de la nave durante 5 segundos al recogerlo
- Power-up **Escudo**: protege la nave de colisiones con asteroides durante 5 segundos; el asteroide impactado es destruido
- Asteroide especial **Estrella fugaz**: enemigo rápido con duración limitada y estela visual
