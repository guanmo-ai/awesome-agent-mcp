import test from 'node:test';
import assert from 'node:assert/strict';
import * as render from '../web/render.mjs';

test('轨道标签避开中心圆与当前图标，并留在轨道横向边界内', () => {
  for (const width of [320, 400, 480, 600]) for (const labelWidth of [140, 240, 300]) for (const radius of [0.29, 0.445]) for (let deg = 0; deg < 360; deg += 2) {
    const c = width / 2, size = width < 440 ? 40 : 52, labelHeight = 34;
    const x = c + radius * width * Math.cos(deg * Math.PI / 180), y = c + radius * width * Math.sin(deg * Math.PI / 180);
    const p = render.orbitLabelPosition({ x, y, size, width, labelWidth, labelHeight });
    const left = p.x - labelWidth / 2, right = p.x + labelWidth / 2, top = p.y, bottom = p.y + labelHeight;
    assert.ok(left >= 3.9 && right <= width - 3.9, `边界 ${JSON.stringify({width,deg,p})}`);
    const dx = Math.max(left - c, 0, c - right), dy = Math.max(top - c, 0, c - bottom);
    assert.ok(Math.hypot(dx, dy) >= 68, `中心 ${JSON.stringify({width,deg,p})}`);
    assert.ok(right <= x - size / 2 || left >= x + size / 2 || bottom <= y - size / 2 || top >= y + size / 2, `图标 ${JSON.stringify({width,deg,p})}`);
  }
});

test('三个安全候选中优先避开相邻图标，均被遮挡时保留原位置', () => {
  const base = { x: 450, y: 300, size: 52, width: 600, labelWidth: 140, labelHeight: 34 };
  const above = render.orbitLabelPosition(base);
  const first = { x: 450, y: above.y + 17, size: 52 };
  const below = render.orbitLabelPosition({ ...base, nodes: [first] });
  assert.notDeepEqual(below, above);
  assert.ok(below.y > 300);
  const second = { x: 450, y: below.y + 17, size: 52 };
  const side = render.orbitLabelPosition({ ...base, nodes: [first, second] });
  assert.notDeepEqual(side, below);
  const third = { x: side.x, y: side.y + 17, size: 52 };
  assert.deepEqual(render.orbitLabelPosition({ ...base, nodes: [first, second, third] }), above);
});
