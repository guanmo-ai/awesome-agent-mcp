import test from 'node:test';
import assert from 'node:assert/strict';
import { LABELS, readJson, validate } from '../scripts/lib.mjs';
import * as render from '../web/render.mjs';
const data = readJson('data/services.json');
const db = { ...data, labels: LABELS, services: data.services.filter(s => s.status !== 'rejected') };
const rank = q => db.services.map(s => ({ s, score: render.searchScore(s, render.tokens(q), db) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.s.id);

test('自然语言查询找到对应服务，多个候选完整保留', () => {
  const cases = { 订机票: ['fliggy', 'tuniu', 'ctrip-business', 'variflight'], 打车: ['didi'], 股票: ['ifind', 'iwencai', 'guosen', 'eastmoney-miaoxiang'], 点咖啡: ['luckin'], 发邮件: ['qq-mail'], 查天气: ['amap', 'caiyun-weather'], 飞书文档: ['feishu'] };
  for (const [q, ids] of Object.entries(cases)) {
    const found = rank(q);
    for (const id of ids) assert.ok(found.slice(0, Math.max(3, ids.length)).includes(id), `${q}: ${id} in ${found}`);
  }
});

test('原整串及空格多词命中不减少，名称完全相同仍第一', () => {
  const queries = [...db.services.map(s => s.name), '腾讯', '机票', 'MCP key', '地图 路线', '免费'];
  for (const q of queries) {
    const toks = render.tokens(q);
    const oldText = s => [s.name, s.summary, ...Object.values(db.categories.find(c => c.id === s.category) ?? {}), ...s.types.map(t => LABELS.types[t]), LABELS.risk[s.risk], ...s.access.map(a => LABELS.access[a])].join(' ').toLowerCase();
    for (const s of db.services.filter(s => toks.every(t => oldText(s).includes(t)))) assert.ok(rank(q).includes(s.id), `${q}: ${s.id}`);
  }
  for (const s of db.services) assert.equal(rank(s.name)[0], s.id);
  assert.deepEqual(rank('完全不存在的服务xyz'), []);
});

test('keywords 限制为最多六个非空且不重复的短语', () => {
  for (const keywords of [null, '股票', [''], ['a', 'a'], Array.from({ length: 7 }, (_, i) => String(i))]) {
    const copy = structuredClone(data); copy.services[0].keywords = keywords;
    assert.match(validate(copy).join('\n'), /keywords/);
  }
});

test('日常能力查询、中英混写与排序不受网址和分类干扰', () => {
  const cases = {
    网约车: ['didi'], 高铁: ['tuniu'], 开会: ['tencent-meeting'], 画图: ['hunyuan-image'], 识别发票: ['textin'],
    PDF转Markdown: ['mineru', 'textin'], 查公司: ['qcc', 'tianyancha'], 发通知: ['feishu', 'wecom'], 推送: ['wecom'],
    导航: ['amap', 'baidu-map', 'tencent-map'], 听歌: ['netease-music'], 代码托管: ['gitee', 'jihulab'],
    买东西: ['taobao'], 网购: ['taobao'], Git: ['gitee', 'jihulab'], 网盘: ['quark-drive', 'weiyun', 'baidu-netdisk'],
    设计稿: ['modao'], 做视频: ['kling'], 日程: ['feishu', 'dingtalk'],
    安排会议: ['tencent-meeting'], 看物流: ['kuaidi100'], 查违约风险: ['qcc'], 提取表格: ['textin'],
  };
  for (const [q, ids] of Object.entries(cases)) for (const id of ids) assert.ok(rank(q).slice(0, 3).includes(id), `${q}: ${id} in ${rank(q)}`);
  assert.deepEqual(render.tokens('PDF转Markdown'), ['pdf', '转', 'markdown']);
  for (const q of ['京东', '小红书', '拼多多', '12306', 'github.com']) assert.deepEqual(rank(q), [], q);
  assert.ok(!rank('专利').includes('patsnap'), '不恢复已按收录范围排除的条目');
});

test('名称、关键词、摘要、分类依次排序，网址不会产生命中', () => {
  const mock = { categories: [{ id: 'a', name: '测试' }], labels: LABELS };
  const service = { name: '', nameEn: '', summary: '', types: [], access: [], category: 'a', url: 'https://test.example' };
  const variants = [{ ...service, name: '测试' }, { ...service, keywords: ['测试'] }, { ...service, summary: '测试' }, service];
  const scores = variants.map(s => render.searchScore(s, render.tokens('测试'), mock));
  for (let i = 1; i < scores.length; i++) assert.ok(scores[i-1] > scores[i]);
  assert.equal(render.searchScore(service, render.tokens('test.example'), mock), 0);
  for (const s of db.services) assert.ok(s.keywords?.length > 0 && s.keywords.length <= 6, s.id);
});

test('口语填充词和单字母前缀不妨碍搜索', () => {
  const cases = { 叫个车: 'didi', 寄个快递: 'kuaidi100', 物流到哪了: 'kuaidi100', 老板是谁: 'qcc', 查企业: 'qcc', 收钱: 'alipay', 炒股: 'iwencai', 拿铁: 'luckin' };
  for (const [q, id] of Object.entries(cases)) assert.ok(rank(q).slice(0, 3).includes(id), `${q}: ${id} in ${rank(q)}`);
  assert.ok(rank('慢查询').length <= 10);
  for (const q of ['京东', '小红书', '拼多多', '12306', 'B站', '饿了么', '微博']) assert.deepEqual(rank(q), [], q);
});

test('口语查询覆盖已证实的服务能力', () => {
  const cases = { 坐地铁怎么走:'amap', 写周报:'dingtalk', 存照片:'baidu-netdisk', 备份文件:'quark-drive', 搜新闻:'baidu-search', 做海报:'hunyuan-image', 画流程图:'antv', 上线网站:'edgeone-makers', 写SQL:'tidb', 慢查询:'tencent-postgresql', 退款:'meituan', MySQL:'aliyun-dms' };
  for (const [q,id] of Object.entries(cases)) assert.ok(rank(q).slice(0,3).includes(id), `${q}: ${id} in ${rank(q)}`);
});

test('不能只因视频等通用词把不相关服务排进剪视频结果', () => {
  assert.ok(rank('剪视频').slice(0, 3).includes('volcengine-vod'));
  assert.ok(!rank('剪视频').includes('douyin-open'));
  assert.ok(!rank('慢查询').includes('alipay'));
});
