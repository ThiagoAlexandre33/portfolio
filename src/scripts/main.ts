import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ---------- Cabeçalho ---------- */

const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobile ---------- */

const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');

function setMenu(open: boolean) {
  if (!menuBtn || !menu) return;
  menuBtn.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menu.querySelector<HTMLElement>('a')?.focus();
}

menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuBtn.focus();
  }
});
matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* ---------- Link ativo na navegação ---------- */

const navLinks = new Map<string, HTMLElement>();
document.querySelectorAll<HTMLElement>('[data-nav-link]').forEach((a) => navLinks.set(a.dataset.navLink!, a));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach((a, id) =>
        id === entry.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'),
      );
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
navLinks.forEach((_, id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

/* ---------- Progresso da jornada (cena 3D + indicador lateral) ---------- */

const journey = document.querySelector<HTMLElement>('[data-journey]');
const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
const dots = [...document.querySelectorAll<HTMLElement>('[data-progress] li')];
const progressList = document.querySelector<HTMLElement>('[data-progress]');

// 0 no topo da página, 1 quando o último capítulo termina
export let journeyProgress = 0;

function updateJourney() {
  if (!journey) return;
  const rect = journey.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  journeyProgress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));

  const mid = window.innerHeight / 2;
  let active = -1;
  chapters.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    if (r.top < mid && r.bottom > mid) active = i;
  });
  dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
  progressList?.classList.toggle('is-visible', active >= 0);
}

updateJourney();
window.addEventListener('scroll', updateJourney, { passive: true });
window.addEventListener('resize', updateJourney);

/* ---------- Animações de entrada ---------- */

if (!reduceMotion) {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });

  // Painel de status: contadores, anéis e barras ganham vida ao entrar na tela
  const panel = document.querySelector<HTMLElement>('[data-status-panel]');
  if (panel) {
    const counters = panel.querySelectorAll<HTMLElement>('[data-count]');
    const rings = panel.querySelectorAll<SVGCircleElement>('[data-ring]');
    const bars = panel.querySelectorAll<HTMLElement>('[data-bar]');

    counters.forEach((el) => (el.firstChild!.textContent = '0'));
    rings.forEach((r) => (r.style.strokeDashoffset = r.dataset.ringLen!));
    gsap.set(bars, { scaleY: 0 });

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        counters.forEach((el) => {
          const target = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate: () => {
              el.firstChild!.textContent = String(Math.round(obj.v));
            },
          });
        });
        rings.forEach((r) =>
          gsap.to(r, { strokeDashoffset: Number(r.dataset.ring), duration: 1.8, ease: 'power3.out' }),
        );
        gsap.to(bars, { scaleY: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06 });
      },
    });
  }
}

/* ---------- Cena 3D: carregada só depois da página pronta ---------- */

function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
const canvas = document.querySelector<HTMLCanvasElement>('[data-scene-canvas]');
const hud = document.querySelector<HTMLElement>('[data-hud]');

if (canvas && hud && canUseWebGL() && !connection?.saveData) {
  const start = () =>
    import('./scene').then(({ createScene }) => {
      createScene({
        canvas,
        hud,
        getProgress: () => journeyProgress,
        reduceMotion,
        onReady: () => root.classList.add('scene-ready'),
      });
    });

  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 300);

  if (document.readyState === 'complete') idle(start);
  else window.addEventListener('load', () => idle(start), { once: true });
}

/* ---------- Som ambiente: só carrega quando a pessoa liga ---------- */

const soundBtn = document.querySelector<HTMLButtonElement>('[data-sound-toggle]');
const soundLabel = document.querySelector<HTMLElement>('[data-sound-label]');
let ambient: { toggle: () => boolean } | null = null;

soundBtn?.addEventListener('click', async () => {
  if (!ambient) {
    const { createAmbient } = await import('./sound');
    ambient = createAmbient();
  }
  const on = ambient.toggle();
  soundBtn.setAttribute('aria-pressed', String(on));
  if (soundLabel) soundLabel.textContent = on ? soundBtn.dataset.labelOn! : soundBtn.dataset.labelOff!;
});
