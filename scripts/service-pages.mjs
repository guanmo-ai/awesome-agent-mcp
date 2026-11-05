import { agentPrompt, esc, safeUrl, brandColor, serviceUrl, logoHtml, host, badge, cardHtml, renderDetails, disclaimerHtml } from '../web/render.mjs';

export function renderServicePage(service, db, config, template, version) {
  const category = db.categories.find((c) => c.id === service.category);
  const details = renderDetails(service, db, { detailPage: true });
  const types = service.types.map((type) => ({ mcp: 'MCP', skill: 'Skill', cli: 'CLI' })[type]).join(' / ');
  const verified = service.status === 'verified';
  const prompt = agentPrompt(`${db.homepage}llms.txt`, `帮我查${service.name}的官方接入方式`);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: service.name,
    description: service.summary, url: serviceUrl(db.homepage, service.id),
    applicationCategory: category?.name ?? 'DeveloperApplication',
    publisher: { '@type': 'Organization', name: service.name, url: safeUrl(service.homepage || service.url) },
  }).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
  const fields = {
    ...Object.fromEntries(Object.entries({
      ...service, title: config.title, siteUrl: config.siteUrl, repo: config.repo,
      maintainerName: config.maintainer.name, x: config.maintainer.x, v: version,
      pageTitle: `${service.name} ${verified ? '官方 ' : ''}${types} ${verified ? '接入' : '接入线索'} · ${config.title}`,
      metaDescription: `${service.name}：${service.summary} 查看${verified ? '官方接入方式' : '接入线索'}、权限与核验依据。`,
      categoryId: service.category, categoryName: category?.name ?? '', domain: host(service.url),
      color: brandColor(service), prompt,
    }).map(([k, v]) => [k, esc(v)])),
    ...details,
    disclaimer: disclaimerHtml(db),
    logo: logoHtml(service, 'lg', '../../'), badge: badge(service), jsonLd,
    // Retain attribution in the same verification section without changing the template's layout.
    verify: details.verify + (details.sources ? `<h3>来源</h3>${details.sources}` : ''),
    related: db.services.filter((s) => s.status !== 'rejected' && s.category === service.category && s.id !== service.id).slice(0, 6)
      .map((s, index) => cardHtml(s, db.labels, { index, prefix: '../../', href: `../${encodeURIComponent(s.id)}/` })).join(''),
  };
  // One pass: inserted user data is never interpreted again as a template token.
  return template.replace(/<!--\s*服务独立页模板[\s\S]*?-->/, '').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in fields)) throw new Error(`未知服务页占位符：${key}`);
    return fields[key];
  });
}

export function sitemap(db) {
  const urls = [db.homepage, ...db.services.filter((s) => s.status !== 'rejected').map((s) => serviceUrl(db.homepage, s.id))];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${esc(url)}</loc><lastmod>${esc(db.updatedAt)}</lastmod></url>`).join('\n')}\n</urlset>\n`;
}
