import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LABELS, readJson } from '../scripts/lib.mjs';
import { searchScore, tokens } from '../web/render.mjs';

const data = readJson('data/services.json');
const db = { ...data, labels: LABELS, services: data.services.filter(s => s.status !== 'rejected') };
const rank = q => db.services.map(s => ({ id: s.id, score: searchScore(s, tokens(q), db) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.id);

// 前两轮约定：机票、股票各有四个不同目标，需全部保留在前四。
const rounds = [
  ['订机票', ['fliggy','tuniu','ctrip-business','variflight'], 4], ['打车',['didi']], ['股票',['ifind','iwencai','guosen','eastmoney-miaoxiang'],4], ['点咖啡',['luckin']], ['发邮件',['qq-mail']], ['查天气',['amap','caiyun-weather']], ['飞书文档',['feishu']],
  ['网约车',['didi']], ['高铁',['tuniu']], ['开会',['tencent-meeting']], ['画图',['hunyuan-image']], ['识别发票',['textin']], ['PDF转Markdown',['mineru','textin']], ['查公司',['qcc','tianyancha']], ['发通知',['feishu','wecom']], ['推送',['wecom']], ['导航',['amap','baidu-map','tencent-map']], ['听歌',['netease-music']], ['代码托管',['gitee','jihulab']], ['买东西',['taobao']], ['网购',['taobao']], ['Git',['gitee','jihulab']], ['网盘',['quark-drive','weiyun','baidu-netdisk']], ['设计稿',['modao']], ['做视频',['kling']], ['日程',['feishu','dingtalk']],
  ['叫个车',['didi']], ['坐地铁怎么走',['amap']], ['寄个快递',['kuaidi100']], ['物流到哪了',['kuaidi100']], ['老板是谁',['qcc']], ['写周报',['dingtalk']], ['存照片',['baidu-netdisk']], ['备份文件',['quark-drive']], ['搜新闻',['baidu-search']], ['做海报',['hunyuan-image']], ['画流程图',['antv']], ['上线网站',['edgeone-makers']], ['写SQL',['tidb']], ['慢查询',['tencent-postgresql']], ['查企业',['qcc','tianyancha']], ['剪视频',['volcengine-vod']], ['收钱',['alipay']], ['炒股',['iwencai']], ['退款',['meituan']], ['MySQL',['aliyun-dms']], ['拿铁',['luckin']],
];

test('三轮复测查询命中已收录的目标，未收录词保持零结果', () => {
  for (const [query, expected, limit = 3] of rounds) {
    const ids = rank(query);
    for (const id of expected) assert.ok(ids.slice(0, limit).includes(id), `${query}: ${id} 不在前 ${limit}；实际 ${ids.join(', ')}`);
  }
  assert.ok(rank('慢查询').length <= 10);
  for (const query of ['专利','京东','小红书','拼多多','12306','B站','饿了么','微博']) assert.deepEqual(rank(query), [], query);
});

test('算法修改前存档的 50 条日常说法至少九成命中前三', (t) => {
  const cases = JSON.parse(readFileSync(new URL('./search-blind-2026-11-05.json', import.meta.url), 'utf8'));
  assert.equal(cases.length, 50);
  const misses = cases.filter(([query, id]) => !rank(query).slice(0, 3).includes(id));
  t.diagnostic(`盲测 ${cases.length - misses.length}/${cases.length}；未命中：${misses.map(([q,id]) => `${q} → ${id}`).join('、') || '无'}`);
  assert.ok(misses.length <= 5);
});
