// Shared by the static build and progressive enhancement on the home page.
import { esc, cardHtml } from './render.mjs';

const CAT_ICON = {
  life: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.3"/>',
  office: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18"/>',
  notes: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15Z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M8.5 11h5"/>',
  design: '<path d="M12 3l2.2 5.3L20 10.5l-5.8 2.2L12 18l-2.2-5.3L4 10.5l5.8-2.2L12 3Z"/><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"/>',
  finance: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10.5h18M16.5 15h.01"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9a4.75 4.75 0 0 1 0 9.5H7Z"/>',
};
const catIcon = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true">${CAT_ICON[id] ?? '<circle cx="12" cy="12" r="4"/>'}</svg>`;

export function directoryHtml(db) {
  return db.categories.map((c) => {
    const items = db.services.filter((s) => s.category === c.id && s.status !== 'rejected');
    if (!items.length) return '';
    return `<section class="group" id="cat-${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
      <div class="group-head"><span class="group-icon">${catIcon(c.id)}</span><h3 id="h-${esc(c.id)}">${esc(c.name)}</h3><span class="en">${esc(c.nameEn ?? '')}</span><span class="n">${items.length}</span></div>
      <div class="grid">${items.map((s) => cardHtml(s, db.labels, { href: `./s/${encodeURIComponent(s.id)}/`, id: s.id, heading: 'h4' })).join('')}</div>
    </section>`;
  }).join('');
}

export function chipsHtml(db) {
  const chip = (id, name, n, icon = '') => `<button class="chip" type="button" data-cat="${esc(id)}" aria-pressed="${id === 'all'}">${icon}${esc(name)}<b>${n}</b></button>`;
  const live = db.services.filter((s) => s.status !== 'rejected');
  return chip('all', '全部', live.length) + db.categories.map((c) => chip(c.id, c.name, live.filter((s) => s.category === c.id).length, catIcon(c.id))).join('');
}
