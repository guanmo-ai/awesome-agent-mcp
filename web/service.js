import { initChrome, toast } from './ui.mjs';

let db;
initChrome({
  getData: () => db, prefix: '../../',
  onChoose: (id) => { location.href = `../../s/${encodeURIComponent(id)}/`; },
});
// The page's service, metadata and configuration are already static HTML.
// Only the cross-service command palette needs the catalog.
fetch('../../services.json').then((response) => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}).then((data) => { db = data; }).catch((error) => {
  console.error('服务搜索载入失败', error);
  toast('搜索暂时不可用，服务内容可照常阅读。');
});
