'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Skins ─────────────────────────────────────────────────────────────────────
const SKINS = {
  classic: { hull: '#ffffff', fill: 'rgba(255, 255, 255, 0.08)', thrust: '#ff8200', scale: 1, scoreMultiplier: 1 },
  plasma: { hull: '#63f3ff', fill: 'rgba(0, 220, 255, 0.12)', thrust: '#d85cff', scale: 1, scoreMultiplier: 1 },
  solar:  { hull: '#ffd166', fill: 'rgba(255, 166, 0, 0.12)', thrust: '#ff4d4d', scale: 1, scoreMultiplier: 1 },
  purple: { hull: '#c05cff', fill: 'rgba(160, 60, 255, 0.14)', thrust: '#ff8cff', scale: 2, scoreMultiplier: 2 },
};
const SKIN_STORAGE_KEY = 'asteroids-skin';
let selectedSkin = loadSkin();
let ship = null;

function loadSkin() {
  try {
    const saved = localStorage.getItem(SKIN_STORAGE_KEY);
    return SKINS[saved] ? saved : 'classic';
  } catch {
    return 'classic';
  }
}

function selectSkin(id) {
  if (!SKINS[id]) return;
  selectedSkin = id;
  if (ship) ship.radius = 12 * SKINS[selectedSkin].scale;
  try { localStorage.setItem(SKIN_STORAGE_KEY, id); } catch { /* almacenamiento opcional */ }
  document.querySelectorAll('[data-skin]').forEach(button => {
    const active = button.dataset.skin === selectedSkin;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active);
  });
}

document.querySelectorAll('[data-skin]').forEach(button => {
  button.style.setProperty('--skin-color', SKINS[button.dataset.skin].hull);
  button.addEventListener('click', () => selectSkin(button.dataset.skin));
});
selectSkin(selectedSkin);

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Power-Up: Velocidad ───────────────────────────────────────────────────────
class SpeedPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.dead = false;
    this.ttl = 15;
    const angle = rand(0, Math.PI * 2);
    const speed = 20;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.pulse = 0;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    this.pulse += dt * 6;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = 0.6 + 0.4 * Math.sin(this.pulse);
    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const r = this.radius;
    ctx.moveTo(r, 0);
    ctx.lineTo(r * 0.3, -r * 0.5);
    ctx.lineTo(-r * 0.3, -r * 0.5);
    ctx.lineTo(-r, 0);
    ctx.lineTo(-r * 0.3, r * 0.5);
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
    ctx.fill();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 0, 3);
    ctx.restore();
  }
}

// ── Power-Up: Escudo ──────────────────────────────────────────────────────────
class ShieldPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.dead = false;
    this.ttl = 15;
    const angle = rand(0, Math.PI * 2);
    const speed = 20;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.pulse = 0;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    this.pulse += dt * 6;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = 0.6 + 0.4 * Math.sin(this.pulse);
    ctx.strokeStyle = `rgba(80, 150, 255, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(80, 150, 255, ${alpha * 0.25})`;
    ctx.fill();
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = `rgba(150, 200, 255, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.fillText('S', 0, 4);
    ctx.restore();
  }
}

// ── Power-Up: Triple disparo ───────────────────────────────────────────────────
class TripleShotPowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.dead = false;
    this.ttl = 15;
    const angle = rand(0, Math.PI * 2);
    const speed = 20;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.pulse = 0;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    this.pulse += dt * 6;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = 0.6 + 0.4 * Math.sin(this.pulse);
    ctx.strokeStyle = `rgba(255, 80, 180, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const r = this.radius;
    ctx.moveTo(r, 0);
    ctx.lineTo(r * 0.3, -r * 0.5);
    ctx.lineTo(-r * 0.3, -r * 0.5);
    ctx.lineTo(-r, 0);
    ctx.lineTo(-r * 0.3, r * 0.5);
    ctx.lineTo(r * 0.3, r * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 80, 180, ${alpha * 0.3})`;
    ctx.fill();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = `rgba(255, 80, 180, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.fillText('3', 0, 3);
    ctx.restore();
  }
}

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Asteroide especial: estrella fugaz ───────────────────────────────────────
class ShootingStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 1);
    this.radius = 12;
    this.points = 150;
    this.ttl = 8;

    const angle = rand(0, Math.PI * 2);
    const speed = rand(190, 250);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rot = angle;
    this.rotSpeed = 0;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() {
    return [];
  }

  draw() {
    const angle = Math.atan2(this.vy, this.vx);
    const alpha = Math.min(1, this.ttl);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);

    ctx.strokeStyle = `rgba(255, 190, 60, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-42, 0);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 245, 180, ${alpha})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(3, 4);
    ctx.lineTo(0, 13);
    ctx.lineTo(-3, 4);
    ctx.lineTo(-13, 0);
    ctx.lineTo(-3, -4);
    ctx.lineTo(0, -13);
    ctx.lineTo(3, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12 * SKINS[selectedSkin].scale;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.dead          = false;
    this.speedBoost    = 0;
    this.shield        = 0;
    this.tripleShot    = 0;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedBoost    > 0) this.speedBoost    -= dt;
    if (this.shield        > 0) this.shield        -= dt;
    if (this.tripleShot    > 0) this.tripleShot    -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      const thrustMult = this.speedBoost > 0 ? 2 : 1;
      this.vx += Math.cos(this.angle) * THRUST * thrustMult * dt;
      this.vy += Math.sin(this.angle) * THRUST * thrustMult * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21 * SKINS[selectedSkin].scale;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    if (this.tripleShot <= 0) return [new Bullet(ox, oy, this.angle)];

    const SIDE = 7 * SKINS[selectedSkin].scale;
    const sideX = -Math.sin(this.angle) * SIDE;
    const sideY = Math.cos(this.angle) * SIDE;
    return [
      new Bullet(ox - sideX, oy - sideY, this.angle),
      new Bullet(ox, oy, this.angle),
      new Bullet(ox + sideX, oy + sideY, this.angle),
    ];
  }

  activateSpeedBoost() {
    this.speedBoost = 5;
  }

  activateShield() {
    this.shield = 5;
  }

  activateTripleShot() {
    this.tripleShot = 5;
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const skin = SKINS[selectedSkin];
    ctx.scale(skin.scale, skin.scale);

    if (this.shield > 0) {
      const pulse = 25 + Math.sin(this.shield * 8) * 2;
      ctx.strokeStyle = 'rgba(80, 150, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = skin.hull;
    ctx.fillStyle   = skin.fill;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    // Silueta clásica: triángulo con muesca trasera
    ctx.beginPath();
    ctx.moveTo( 20,  0);   // nariz
    ctx.lineTo(-12, -9);   // ala izquierda
    ctx.lineTo( -7,  0);   // muesca trasera
    ctx.lineTo(-12,  9);   // ala derecha
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = skin.thrust;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let bullets, asteroids, particles, powerUps;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let shootingStarTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    const asteroid = Math.random() < 0.15
      ? new ShootingStar(x, y)
      : new Asteroid(x, y, 3);
    asteroids.push(asteroid);
  }
}

function spawnShootingStar() {
  const SAFE_DIST = 150;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - ship.x, y - ship.y) < SAFE_DIST);
  asteroids.push(new ShootingStar(x, y));
}

function updateShootingStarTimer(dt) {
  shootingStarTimer -= dt;
  if (shootingStarTimer > 0) return;

  const active = asteroids.some(a => a instanceof ShootingStar);
  if (!active) spawnShootingStar();
  shootingStarTimer = rand(8, 14);
}

function maybeSpawnPowerUp() {
  if (Math.random() < 0.003) {
    const SAFE_DIST = 150;
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (ship && Math.hypot(x - ship.x, y - ship.y) < SAFE_DIST);
    const PowerUp = [SpeedPowerUp, ShieldPowerUp, TripleShotPowerUp][randInt(0, 2)];
    powerUps.push(new PowerUp(x, y));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerUps  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  shootingStarTimer = rand(5, 10);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerUps  = [];
  ship.reset();
  shootingStarTimer = rand(5, 10);
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

function pointsFor(asteroid) {
  const basePoints = asteroid.points ?? POINTS[asteroid.size];
  return basePoints * SKINS[selectedSkin].scoreMultiplier;
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  updateShootingStarTimer(dt);
  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerUps.forEach(p => p.update(dt));

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerUps  = powerUps.filter(p => !p.dead);

  // Power-up vs nave
  for (const p of powerUps) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p instanceof ShieldPowerUp) ship.activateShield();
      if (p instanceof SpeedPowerUp) ship.activateSpeedBoost();
      if (p instanceof TripleShotPowerUp) ship.activateTripleShot();
    }
  }

  maybeSpawnPowerUp();

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += pointsFor(a);
        explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shield > 0) {
          a.dead = true;
          score += pointsFor(a);
          explode(a.x, a.y, a.size * 5);
        } else {
          killShip();
        }
        break;
      }
    }
  }

  asteroids = asteroids.filter(a => !a.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = SKINS[selectedSkin].hull;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

  if (ship.speedBoost > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0ff';
    ctx.fillText(`⚡ VELOCIDAD  ${ship.speedBoost.toFixed(1)}s`, W - 14, 50);
  }

  if (ship.shield > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#5796ff';
    ctx.fillText(`S ESCUDO  ${ship.shield.toFixed(1)}s`, W - 14,
      ship.speedBoost > 0 ? 70 : 50);
  }

  if (ship.tripleShot > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff50b4';
    const offset = ship.speedBoost > 0 ? 20 : 0;
    ctx.fillText(`3 TRIPLE SHOT  ${ship.tripleShot.toFixed(1)}s`, W - 14,
      50 + offset + (ship.shield > 0 ? 20 : 0));
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerUps.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
