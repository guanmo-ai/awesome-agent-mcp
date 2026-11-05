import { initChrome, toast, loadCatalog } from './ui.mjs';
import { initFx } from './fx.mjs';

let db;
const fetchCatalog = async () => { db = await loadCatalog(); restoreSearch(); };
const restoreSearch = initChrome({
  getData: () => db, prefix: '../../',
  loadData: fetchCatalog,
  onChoose: (id) => { location.href = `../../s/${encodeURIComponent(id)}/`; },
});
// The page's service, metadata and configuration are already static HTML.
// Only the cross-service command palette needs the catalog.
fetchCatalog().catch((error) => {
  console.error('服务搜索载入失败', error);
  toast('搜索暂时不可用，请联网后点击搜索重试。服务内容可照常阅读。');
});
initFx();
