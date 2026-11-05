import { initChrome, toast, loadCatalog } from './ui.mjs';

let db;
const restoreSearch = initChrome({
  getData: () => db, prefix: '../../',
  onChoose: (id) => { location.href = `../../s/${encodeURIComponent(id)}/`; },
});
// The page's service, metadata and configuration are already static HTML.
// Only the cross-service command palette needs the catalog.
loadCatalog().then((data) => { db = data; restoreSearch(); }).catch((error) => {
  console.error('服务搜索载入失败', error);
  toast('搜索暂时不可用，服务内容可照常阅读。');
});
