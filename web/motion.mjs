// Motion timing adapted from Microsoft Fluent UI (MIT). See licenses/fluentui.txt.
// All animation behavior below is authored for this site; no framework runtime.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
export const motionReduced = () => preference.matches;
export const onMotionChange = (fn) => preference.addEventListener('change', fn);
const easing = 'cubic-bezier(0.1, 0.9, 0.2, 1)';
const animations = new WeakMap();

export function openDialog(dialog) {
  animations.get(dialog)?.cancel();
  animations.delete(dialog);
  if (dialog.open) return;
  dialog.showModal(); // The action takes effect immediately, before any animation.
  if (motionReduced() || !dialog.animate) return;
  const a = dialog.animate([
    { opacity: 0, transform: 'translateY(-8px) scale(.985)' },
    { opacity: 1, transform: 'none' },
  ], { duration: 200, easing });
  animations.set(dialog, a);
  a.finished.then(() => { if (animations.get(dialog) === a) animations.delete(dialog); }, () => {});
}

export function closeDialog(dialog) {
  if (!dialog.open) return;
  animations.get(dialog)?.cancel();
  if (motionReduced() || document.hidden || !dialog.animate) { dialog.close(); return; }
  const a = dialog.animate([
    { opacity: 1, transform: 'none' },
    { opacity: 0, transform: 'translateY(-6px) scale(.99)' },
  ], { duration: 150, easing: 'cubic-bezier(0.33, 0, 0.67, 1)', fill: 'forwards' });
  animations.set(dialog, a);
  a.finished.then(() => {
    if (animations.get(dialog) !== a) return;
    animations.delete(dialog);
    dialog.close();
    a.cancel();
  }, () => {});
}

export function wireDialog(dialog) {
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('close', () => { animations.get(dialog)?.cancel(); animations.delete(dialog); });
}

// Only animate newly visible results near the viewport; typing never waits for it.
export function revealResults(elements) {
  if (motionReduced() || document.hidden) return;
  const visible = elements.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight + 100;
  }).slice(0, 12);
  visible.forEach((el, i) => {
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 200, delay: Math.min(i * 12, 72), easing });
  });
}
