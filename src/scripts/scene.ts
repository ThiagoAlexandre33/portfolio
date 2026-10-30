// Cena 3D da jornada: uma infraestrutura AWS que se monta conforme a rolagem.
// Região → VPC e sub-redes → instâncias EC2 → tráfego e monitoramento.

import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CubicBezierCurve3,
  DirectionalLight,
  EdgesGeometry,
  Fog,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';

interface Options {
  canvas: HTMLCanvasElement;
  hud: HTMLElement;
  getProgress: () => number;
  reduceMotion: boolean;
  onReady: () => void;
}

const COLORS = {
  bg: '#0a0c0f',
  line: '#2a3540',
  ice: '#bcd8ea',
  accent: '#5fe3e8',
  ok: '#7be3a4',
  white: '#e9eef3',
  slab: '#10151b',
  box: '#161d25',
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Pontos-chave da câmera ao longo da jornada (s = 0 no herói, 4 no último capítulo) */
const CAMERA_KEYS: { s: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { s: 0, pos: [4, 9.5, 21], look: [0, 4.4, 0] },
  { s: 1, pos: [16.5, 13.5, 18.5], look: [0, 0.6, 0] },
  { s: 2, pos: [14.5, 10, 16], look: [0, 1, 0] },
  { s: 3, pos: [10, 7.6, 14.5], look: [0, 1.1, 0] },
  { s: 4, pos: [-12.5, 10.5, 15.5], look: [0, 1.6, 0] },
];

function cameraAt(s: number, pos: Vector3, look: Vector3) {
  const k = CAMERA_KEYS;
  let i = 0;
  while (i < k.length - 2 && s > k[i + 1].s) i++;
  const a = k[i];
  const b = k[i + 1];
  const t = smooth(s, a.s, b.s);
  pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
  look.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
}

function glowTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new CanvasTexture(c);
}

/* Define a opacidade de um objeto e de todos os seus materiais */
function setAlpha(obj: Object3D, alpha: number) {
  obj.visible = alpha > 0.002;
  obj.traverse((o) => {
    const m = (o as Mesh).material as (Material & { userData: { base?: number } }) | undefined;
    if (!m) return;
    if (m.userData.base === undefined) m.userData.base = m.opacity;
    m.opacity = m.userData.base * alpha;
  });
}

function edges(geo: BufferGeometry, color: string, opacity = 1) {
  return new LineSegments(new EdgesGeometry(geo), new LineBasicMaterial({ color, transparent: true, opacity }));
}

export function createScene({ canvas, hud, getProgress, reduceMotion, onReady }: Options) {
  const isSmall = matchMedia('(max-width: 900px)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const lowEnd = cores <= 4 || memory <= 4;

  let dprCap = isSmall || lowEnd ? 1.5 : 2;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: !lowEnd,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));

  const scene = new Scene();
  scene.fog = new Fog(COLORS.bg, 22, 52);

  const camera = new PerspectiveCamera(34, 1, 0.1, 100);

  scene.add(new AmbientLight('#9fb6c8', 0.55));
  const sun = new DirectionalLight('#dceaf5', 1.6);
  sun.position.set(6, 14, 8);
  scene.add(sun);
  const rim = new DirectionalLight(COLORS.accent, 0.5);
  rim.position.set(-8, 4, -6);
  scene.add(rim);

  const glow = glowTexture();
  const makeGlow = (color: string, scale: number, opacity = 0.9) => {
    const s = new Sprite(
      new SpriteMaterial({ map: glow, color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false }),
    );
    s.scale.setScalar(scale);
    return s;
  };

  /* ---------- Chão em grade ---------- */
  const grid = (() => {
    const size = 40;
    const verts: number[] = [];
    for (let i = -size / 2; i <= size / 2; i += 1) {
      verts.push(i, 0, -size / 2, i, 0, size / 2, -size / 2, 0, i, size / 2, 0, i);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3));
    const lines = new LineSegments(g, new LineBasicMaterial({ color: COLORS.line, transparent: true, opacity: 0.55 }));
    lines.position.y = -0.2;
    return lines;
  })();
  scene.add(grid);

  /* ---------- Região: a base ---------- */
  const region = new Group();
  {
    const geo = new BoxGeometry(12, 0.3, 9);
    const slab = new Mesh(
      geo,
      new MeshStandardMaterial({ color: COLORS.slab, roughness: 0.85, metalness: 0.1, transparent: true, opacity: 1 }),
    );
    region.add(slab, edges(geo, COLORS.ice, 0.55));
  }
  scene.add(region);

  /* ---------- VPC: perímetro tracejado ---------- */
  const vpc = (() => {
    const geo = new EdgesGeometry(new BoxGeometry(10.6, 3.4, 7.6));
    const line = new LineSegments(
      geo,
      new LineDashedMaterial({ color: COLORS.ice, dashSize: 0.28, gapSize: 0.22, transparent: true, opacity: 0.75 }),
    );
    line.computeLineDistances();
    line.position.y = 1.85;
    return line;
  })();
  scene.add(vpc);

  /* ---------- Sub-redes pública e privada ---------- */
  const makeSubnet = (x: number, color: string, fill: string) => {
    const g = new Group();
    const geo = new BoxGeometry(4.7, 0.16, 6.4);
    const slab = new Mesh(
      geo,
      new MeshStandardMaterial({
        color: fill,
        emissive: color,
        emissiveIntensity: 0.06,
        roughness: 0.7,
        transparent: true,
        opacity: 1,
      }),
    );
    g.add(slab, edges(geo, color, 0.9));
    g.position.set(x, 0.32, 0);
    return g;
  };
  const publicNet = makeSubnet(-2.75, COLORS.accent, '#0f1c20');
  const privateNet = makeSubnet(2.75, COLORS.ice, '#121820');
  scene.add(publicNet, privateNet);

  /* ---------- Internet Gateway ---------- */
  const igwPos = new Vector3(-2.75, 1.55, 3.9);
  const igw = new Group();
  {
    const ring = new Mesh(
      new TorusGeometry(0.55, 0.055, 12, 48),
      new MeshBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 1 }),
    );
    const core = new Mesh(
      new SphereGeometry(0.14, 16, 12),
      new MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 1 }),
    );
    igw.add(ring, core, makeGlow(COLORS.accent, 2.2, 0.55));
    igw.position.copy(igwPos);
  }
  scene.add(igw);

  /* ---------- Instâncias EC2 ---------- */
  const ec2Slots = [
    new Vector3(-3.7, 0.9, -1.2),
    new Vector3(-1.8, 0.9, 1.4),
    new Vector3(1.8, 0.9, -1.2),
    new Vector3(3.7, 0.9, 1.4),
  ];
  const ec2s = ec2Slots.map((slot, i) => {
    const g = new Group();
    const geo = new BoxGeometry(1, 1, 1);
    const body = new Mesh(
      geo,
      new MeshStandardMaterial({ color: COLORS.box, roughness: 0.5, metalness: 0.35, transparent: true, opacity: 1 }),
    );
    // Faixas de "rack" na frente da instância
    const rack = new Group();
    for (let k = 0; k < 3; k++) {
      const bar = new Mesh(
        new BoxGeometry(0.62, 0.05, 0.02),
        new MeshBasicMaterial({ color: k === 0 ? COLORS.ok : COLORS.line, transparent: true, opacity: 1 }),
      );
      bar.position.set(0, 0.22 - k * 0.16, 0.51);
      rack.add(bar);
    }
    const led = makeGlow(i < 2 ? COLORS.accent : COLORS.ice, 0.9, 0.8);
    led.position.set(0, 0.7, 0);
    g.add(body, edges(geo, COLORS.white, 0.85), rack, led);
    g.position.copy(slot);
    return g;
  });
  ec2s.forEach((e) => scene.add(e));

  /* ---------- A nuvem ---------- */
  const cloud = new Group();
  {
    const mat = new MeshStandardMaterial({
      color: '#cfdde8',
      roughness: 0.95,
      flatShading: true,
      emissive: '#22323d',
      transparent: true,
      opacity: 1,
    });
    const puffs: [number, number, number, number][] = [
      [0, 0, 0, 1.55],
      [-1.55, -0.35, 0.2, 1.1],
      [1.5, -0.3, -0.1, 1.2],
      [-0.6, 0.55, -0.6, 1.05],
      [0.75, 0.4, 0.55, 0.95],
      [2.6, -0.55, 0.2, 0.7],
      [-2.6, -0.6, -0.1, 0.65],
    ];
    for (const [x, y, z, r] of puffs) {
      const geo = new IcosahedronGeometry(r, 1);
      const m = new Mesh(geo, mat);
      m.position.set(x, y, z);
      const e = edges(geo, COLORS.ice, 0.22);
      e.position.copy(m.position);
      cloud.add(m, e);
    }
    cloud.position.set(0, 6.6, 0);
  }
  scene.add(cloud);

  /* ---------- Conexões e pacotes de dados ---------- */
  const cloudBase = new Vector3(0, 5.3, 0.6);
  const curves = [
    new CubicBezierCurve3(cloudBase, new Vector3(-0.5, 4.4, 2.8), new Vector3(-2.75, 3.2, 4.2), igwPos),
    new CubicBezierCurve3(igwPos, new Vector3(-3.3, 1.9, 2.5), new Vector3(-3.7, 1.9, 0.2), ec2Slots[0]),
    new CubicBezierCurve3(igwPos, new Vector3(-2.3, 1.9, 3.2), new Vector3(-1.8, 1.9, 2.6), ec2Slots[1]),
    new CubicBezierCurve3(ec2Slots[1], new Vector3(-0.4, 1.7, 1.2), new Vector3(0.6, 1.7, -0.9), ec2Slots[2]),
    new CubicBezierCurve3(ec2Slots[1], new Vector3(0.2, 1.8, 2.2), new Vector3(2.4, 1.8, 2.2), ec2Slots[3]),
  ];
  const SEG = 64;
  const links = curves.map((c, i) => {
    const g = new BufferGeometry().setFromPoints(c.getPoints(SEG));
    const line = new Line(
      g,
      new LineBasicMaterial({ color: i === 0 ? COLORS.white : COLORS.accent, transparent: true, opacity: 0.7 }),
    );
    scene.add(line);
    return line;
  });

  const packetGeo = new SphereGeometry(0.07, 10, 8);
  const packets = curves.flatMap((curve, ci) =>
    [0, 0.5].map((offset) => {
      const g = new Group();
      g.add(
        new Mesh(packetGeo, new MeshBasicMaterial({ color: COLORS.white, transparent: true, opacity: 1 })),
        makeGlow(COLORS.accent, 0.7, 0.9),
      );
      scene.add(g);
      return { g, curve, offset: offset + ci * 0.17, speed: 0.22 + (ci % 2) * 0.06 };
    }),
  );

  /* ---------- Monitoramento: pulsos e métrica de CPU ---------- */
  const pulses = [ec2Slots[2], ec2Slots[3]].map((p, i) => {
    const ring = new Mesh(
      new RingGeometry(0.8, 0.86, 48),
      new MeshBasicMaterial({ color: COLORS.ok, transparent: true, opacity: 0.8, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(p.x, 0.42, p.z);
    scene.add(ring);
    return { ring, phase: i * 0.5 };
  });

  const metric = new Group();
  const metricBars = Array.from({ length: 10 }, (_, i) => {
    const bar = new Mesh(
      new BoxGeometry(0.32, 1, 0.32),
      new MeshStandardMaterial({
        color: i === 9 ? COLORS.ice : COLORS.accent,
        emissive: i === 9 ? COLORS.ice : COLORS.accent,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.9,
      }),
    );
    bar.position.set(-3.6 + i * 0.8, 0, 0);
    metric.add(bar);
    return bar;
  });
  const threshold = new Line(
    new BufferGeometry().setFromPoints([new Vector3(-4.1, 1.9, 0), new Vector3(4.1, 1.9, 0)]),
    new LineDashedMaterial({ color: COLORS.ok, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.8 }),
  );
  threshold.computeLineDistances();
  metric.add(threshold);
  metric.position.set(0, 0.2, -5.3);
  scene.add(metric);

  /* ---------- Partículas em suspensão ---------- */
  const dust = (() => {
    const count = isSmall || lowEnd ? 260 : 700;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = Math.random() * 16 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    return new Points(
      g,
      new PointsMaterial({
        color: COLORS.ice,
        size: 0.06,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
  })();
  scene.add(dust);

  /* ---------- Etiquetas técnicas (HUD) ---------- */
  type Label = { el: HTMLElement; text: string; anchor: Vector3; from: number; to: number; shown: boolean; desktop?: boolean };
  const labelDefs: Omit<Label, 'el' | 'shown'>[] = [
    { text: 'cloud · online', anchor: new Vector3(1.6, 7.6, 0.4), from: -1, to: 0.65, desktop: true },
    { text: 'region · sa-east-1', anchor: new Vector3(5.6, 0.15, 4.3), from: 0.7, to: 1.75 },
    { text: 'vpc · 10.0.0.0/16', anchor: new Vector3(5.3, 3.55, 3.8), from: 1.45, to: 2.6 },
    { text: 'public · 10.0.1.0/24', anchor: new Vector3(-4.8, 0.4, 3.1), from: 1.75, to: 2.75, desktop: true },
    { text: 'private · 10.0.2.0/24', anchor: new Vector3(4.9, 0.4, -3.1), from: 1.75, to: 2.75, desktop: true },
    { text: 'igw · 0.0.0.0/0', anchor: igwPos.clone().add(new Vector3(0.5, 0.5, 0)), from: 1.95, to: 2.9 },
    { text: 'ec2 · apache · running', anchor: ec2Slots[1].clone().add(new Vector3(0.5, 0.6, 0)), from: 2.6, to: 3.55 },
    { text: 'ssh · 22/tcp  http · 80/tcp', anchor: ec2Slots[0].clone().add(new Vector3(0, 0.6, 0)), from: 2.8, to: 3.55, desktop: true },
    { text: 'cloudwatch · CPUUtilization', anchor: new Vector3(3.8, 2.6, -5.3), from: 3.35, to: 9 },
    { text: 'alarm · OK', anchor: ec2Slots[3].clone().add(new Vector3(0.5, 0.6, 0)), from: 3.5, to: 9 },
  ];
  const labels: Label[] = reduceMotion
    ? []
    : labelDefs
        .filter((d) => !(d.desktop && isSmall))
        .map((d) => {
          const el = document.createElement('div');
          el.className = 'hud-label';
          el.innerHTML = '<i class="hud-label__dot"></i><i class="hud-label__line"></i><span class="hud-label__text"></span>';
          el.querySelector('.hud-label__text')!.textContent = d.text;
          hud.appendChild(el);
          return { ...d, el, shown: false };
        });

  const GLYPHS = '01<>/_-:.#ABCDEF';
  function scramble(el: HTMLElement, text: string) {
    const start = performance.now();
    const dur = 520;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const keep = Math.floor(text.length * t);
      let out = text.slice(0, keep);
      for (let i = keep; i < text.length; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Tamanho e enquadramento ---------- */
  let width = 0;
  let height = 0;
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // No desktop a cena fica à direita do texto; no celular, sobe para o topo
    const small = width < 900;
    camera.setViewOffset(width, height, small ? 0 : -width * 0.22, small ? height * 0.14 : 0, width, height);
    camera.fov = small ? 46 : 34;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- Movimento do ponteiro (só desktop) ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true },
    );
  }

  /* ---------- Atualização por quadro ---------- */
  const camPos = new Vector3();
  const camLook = new Vector3();
  const tmp = new Vector3();
  let s = reduceMotion ? 4 : getProgress() * 4;
  let time = 0;
  let last = performance.now();

  function update(dt: number) {
    const target = reduceMotion ? 4 : getProgress() * 4;
    s += (target - s) * Math.min(1, dt * 3.2);
    if (!reduceMotion) time += dt;

    // Montagem da infraestrutura
    setAlpha(grid, 0.35 + 0.65 * smooth(s, 0.1, 0.9));
    const aRegion = smooth(s, 0.25, 1.0);
    setAlpha(region, aRegion);
    region.scale.set(lerp(0.85, 1, aRegion), Math.max(0.001, aRegion), lerp(0.85, 1, aRegion));

    const aVpc = smooth(s, 1.15, 1.75);
    setAlpha(vpc, aVpc);
    vpc.scale.setScalar(lerp(1.12, 1, aVpc));

    const aNet = smooth(s, 1.35, 2.0);
    setAlpha(publicNet, aNet);
    setAlpha(privateNet, smooth(s, 1.5, 2.1));
    publicNet.position.y = lerp(-0.6, 0.32, aNet);
    privateNet.position.y = lerp(-0.6, 0.32, smooth(s, 1.5, 2.1));

    const aIgw = smooth(s, 1.7, 2.2);
    setAlpha(igw, aIgw);
    igw.scale.setScalar(Math.max(0.001, aIgw));
    igw.rotation.y = time * 0.6;

    ec2s.forEach((g, i) => {
      const t = clamp01((s - (2.15 + i * 0.13)) / 0.55);
      setAlpha(g, Math.min(1, t * 3));
      g.position.y = ec2Slots[i].y + (1 - easeOutBack(t)) * 5;
      g.rotation.y = (1 - t) * 0.8;
    });

    const aLinks = smooth(s, 2.75, 3.35);
    links.forEach((l, i) => {
      const local = clamp01(aLinks * 1.6 - i * 0.15);
      l.geometry.setDrawRange(0, Math.floor((SEG + 1) * local));
      l.visible = local > 0;
    });

    const aPackets = smooth(s, 3.15, 3.55);
    packets.forEach((p) => {
      setAlpha(p.g, aPackets);
      if (aPackets > 0) p.g.position.copy(p.curve.getPointAt((time * p.speed + p.offset) % 1));
    });

    const aObserve = smooth(s, 3.3, 3.9);
    pulses.forEach((p) => {
      const k = (time * 0.6 + p.phase) % 1;
      p.ring.scale.setScalar(1 + k * 2.2);
      setAlpha(p.ring, aObserve * (1 - k));
    });
    setAlpha(metric, aObserve);
    metricBars.forEach((b, i) => {
      const h = 0.4 + 1.2 * (0.5 + 0.5 * Math.sin(time * 1.4 + i * 0.7)) * (0.55 + i * 0.05);
      b.scale.y = Math.max(0.01, h * aObserve);
      b.position.y = (h * aObserve) / 2;
    });

    // Nuvem sempre presente, flutuando. No celular ela fica atrás do título, então começa mais apagada
    if (isSmall) setAlpha(cloud, lerp(0.3, 1, smooth(s, 0.3, 1)));
    cloud.position.y = 6.6 + Math.sin(time * 0.6) * 0.18;
    cloud.rotation.y = time * 0.05;
    dust.rotation.y = time * 0.012;
    dust.position.y = Math.sin(time * 0.2) * 0.3;

    // Câmera
    cameraAt(s, camPos, camLook);
    if (!reduceMotion) {
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 2);
      camPos.x += pointer.x * 0.9 + Math.sin(time * 0.15) * 0.4;
      camPos.y += -pointer.y * 0.5;
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    // Etiquetas presas aos objetos
    for (const l of labels) {
      const fadeIn = smooth(s, l.from, l.from + 0.15);
      const fadeOut = 1 - smooth(s, l.to - 0.15, l.to);
      const a = Math.min(fadeIn, fadeOut);
      tmp.copy(l.anchor).project(camera);
      const behind = tmp.z > 1;
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      const visible = a > 0.02 && !behind;
      l.el.style.opacity = visible ? String(a) : '0';
      if (visible) {
        l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        // Perto da borda direita, a etiqueta abre para a esquerda
        l.el.classList.toggle('is-flip', x > width - 260);
      }
      if (a > 0.5 && !l.shown) {
        l.shown = true;
        scramble(l.el.querySelector('.hud-label__text')!, l.text);
      } else if (a < 0.05) {
        l.shown = false;
      }
    }
  }

  /* ---------- Laço de renderização, pausado fora da tela ---------- */
  let running = false;
  let inView = true;
  let raf = 0;
  let frames = 0;
  let slowFrames = 0;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    renderer.render(scene, camera);

    // Ajuste automático de qualidade se o aparelho não acompanhar
    if (frames < 120) {
      frames++;
      if (dt > 0.03) slowFrames++;
      if (frames === 120 && slowFrames > 40 && dprCap > 1) {
        dprCap = 1;
        renderer.setPixelRatio(1);
        resize();
      }
    }

    if (running) raf = requestAnimationFrame(frame);
  }

  function setRunning(on: boolean) {
    if (on === running) return;
    running = on;
    if (on) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
    }
  }

  const stage = canvas.parentElement!;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    setRunning(inView && !document.hidden && !reduceMotion);
    if (reduceMotion && inView) frame(performance.now());
  }).observe(stage);

  document.addEventListener('visibilitychange', () => setRunning(inView && !document.hidden && !reduceMotion));

  if (reduceMotion) {
    // Sem movimento: a infraestrutura aparece montada, numa única imagem
    window.addEventListener('resize', () => frame(performance.now()));
  }

  frame(performance.now());
  setRunning(!reduceMotion);
  requestAnimationFrame(() => onReady());
}
