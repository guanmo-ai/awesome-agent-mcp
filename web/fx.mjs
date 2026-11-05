// 交互动效（设计：Claude）。只负责视觉反馈，不改变任何业务状态；
// 「减少动态效果」开启时全部跳过，脚本失败时页面照常可用。
import { motionReduced, onMotionChange } from './motion.mjs';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const EASE = 'cubic-bezier(0.1, 0.9, 0.2, 1)';
const canVT = () => !!document.startViewTransition && !motionReduced();
let transition;

export function initFx() {
  const root = document.documentElement;
  watchModals(root);
  let started = false;
  const sync = () => {
    root.classList.toggle('fx', !motionReduced());
    if (motionReduced()) {
      transition?.skipTransition();
      $$('.fx-reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    if (started) return;
    started = true;
    reveal();
    chipIndicator();
    parallax();
  };
  onMotionChange(sync);
  sync();
}

// 切换深浅色：新主题从按钮位置以圆形展开。
export function themeTransition(button, apply) {
  if (!canVT() || !button) { apply(); return; }
  const r = button.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const root = document.documentElement;
  root.classList.add('vt-theme');
  const vt = transition = document.startViewTransition(apply);
  vt.ready.then(() => !motionReduced() && root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 520, easing: EASE, pseudoElement: '::view-transition-new(root)' },
  )).catch(() => {});
  vt.finished.finally(() => { if (transition === vt) transition = undefined; root.classList.remove('vt-theme'); });
}

// 打开详情：卡片上的图标飞进弹窗标题位置。
export function morphFromCard(card, open) {
  const from = card?.querySelector('.logo');
  if (!canVT() || !from) { open(); return; }
  from.style.viewTransitionName = 'svc-logo';
  const vt = transition = document.startViewTransition(() => {
    from.style.viewTransitionName = '';
    open();
    const to = $('dialog[open] .s-id .logo');
    if (to) to.style.viewTransitionName = 'svc-logo';
  });
  vt.finished.finally(() => {
    if (transition === vt) transition = undefined;
    from.style.viewTransitionName = '';
    const to = $('dialog .s-id .logo');
    if (to) to.style.viewTransitionName = '';
  });
}

// 有弹窗时暂停背景里的循环动画，减轻渲染负担。
function watchModals(root) {
  const sync = () => root.classList.toggle('modal-open', !!$('dialog[open]'));
  const mo = new MutationObserver(sync);
  $$('dialog').forEach((d) => mo.observe(d, { attributes: true, attributeFilter: ['open'] }));
  sync();
}

// 滚动到视口时，各板块依次浮现；分类中的卡片逐张进入。
function reveal() {
  const blocks = [...$$('.demo .sec-head, .for-ai .sec-head, .directory .sec-head, .demo-in, .cta-in, .svc-related, .foot-top, .wordmark')];
  $$('.bento-card').forEach((el, i) => { el.style.setProperty('--d', i); blocks.push(el); });
  const groups = $$('.group');
  groups.forEach((g) => $$('.card', g).forEach((c, i) => c.style.setProperty('--d', Math.min(i, 8))));
  const all = [...blocks, ...groups];
  all.forEach((el) => el.classList.add('fx-reveal'));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  all.forEach((el) => io.observe(el));
  // 开始筛选或通过链接跳转时直接全部显示，交给结果动画处理。
  const showAll = () => all.forEach((el) => { el.classList.add('in'); io.unobserve(el); });
  for (const s of ['#q', '#chips', '#type-filter', '#risk-filter', '#verified-only']) {
    const el = $(s);
    el?.addEventListener('input', showAll, { once: true });
    el?.addEventListener('click', showAll, { once: true });
  }
  if (location.hash) showAll();
}

// 分类按钮：选中底色滑动到新分类。
function chipIndicator() {
  const chips = $('#chips');
  if (!chips) return;
  const ind = document.createElement('span');
  ind.className = 'chip-ind';
  ind.setAttribute('aria-hidden', 'true');
  let first = true;
  const place = () => {
    if (!ind.isConnected) chips.prepend(ind);
    const on = $('.chip[aria-pressed="true"]', chips);
    if (!on) { ind.style.opacity = '0'; return; }
    if (first) ind.style.transition = 'none';
    Object.assign(ind.style, { opacity: '1', width: `${on.offsetWidth}px`, height: `${on.offsetHeight}px`, transform: `translate(${on.offsetLeft}px, ${on.offsetTop}px)` });
    if (first) { void ind.offsetWidth; ind.style.transition = ''; first = false; }
  };
  new MutationObserver(place).observe(chips, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-pressed'] });
  addEventListener('resize', place, { passive: true });
  chips.classList.add('has-ind');
  place();
}

// 首页：轨道与光斑随鼠标轻微反向移动，形成景深。仅限精确指针。
function parallax() {
  const hero = $('.hero');
  if (!hero || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let raf = 0, x = 0, y = 0;
  const set = () => { raf = 0; hero.style.setProperty('--px', x.toFixed(3)); hero.style.setProperty('--py', y.toFixed(3)); };
  hero.addEventListener('pointermove', (e) => {
    if (motionReduced()) return;
    const r = hero.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width - 0.5;
    y = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(set);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { x = 0; y = 0; if (!raf) raf = requestAnimationFrame(set); });
}
