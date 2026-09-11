(() => {
  'use strict';
  const data = window.CAKE_GUIDE;
  const key = 'cake-20260912-field-notes-v1';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state = {companies:{}, checks:{}};
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved.companies === 'object' && typeof saved.checks === 'object') state = saved;
  } catch { /* A blocked or cleared store must not block the guide. */ }
  let feedbackTimer;
  function feedback(message) { $('feedback').textContent = message; clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => $('feedback').textContent = '', 3500); }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { feedback('瀏覽器無法保存；請先匯出紀錄。'); } }
  const profiles = new Map(data.profiles.map(p => [p['攤位'], p]));
  const briefData = window.CAKE_BRIEFS || {};
  const briefs = briefData.briefs || {};
  const sourceFixes = briefData['來源修正'] || {};
  const unchecked = new Set(briefData['未能覆查'] || []);
  const entries = data.companies.map(c => ({...c, profile:profiles.get(c['最新攤位']), brief:briefs[String(c['編號'])]}));
  const record = id => state.companies[id] || {};
  const link = (url, label) => /^https:\/\//.test(url || '') ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>` : '';
  const field = (title, value) => value ? `<dt>${escape(title)}</dt><dd>${escape(value)}</dd>` : '';
  function jobRow(job) {
    const tags = [job['年資'], job['型態'], job['地點']].filter(Boolean).join(' · ');
    const title = job['連結'] ? `<a href="${escape(job['連結'])}" target="_blank" rel="noopener noreferrer">${escape(job['職稱'])}</a>` : escape(job['職稱']);
    const mark = job['已下架'] ? ' · <b class="gone">9/11 覆查已下架</b>' : job['新人可投'] ? ' · <b>新人可投</b>' : '';
    return `<li class="${job['已下架'] ? 'gone' : job['新人可投'] ? 'fresh' : ''}">${title}<span class="jobtags">${escape(tags)}${mark}</span></li>`;
  }
  function briefBlock(c) {
    const b = c.brief;
    if (!b) return '';
    const asks = b['開場問句'] || [];
    const jobs = b['職缺'] || [];
    const counts = `公開清單 ${b['職缺總數'] || 0} 筆 · 年資 1 年內 ${b['新人可投'] || 0} 筆` + (b['已下架'] ? ` · 9/11 覆查 ${b['已下架']} 筆已下架` : '');
    const business = b['做什麼'] ? `<h3>他們在做什麼</h3><p class="business">${escape(b['做什麼'])}</p>` : '';
    const ask = asks.length ? `<h3>開場就這樣問 <button type="button" class="copy" data-copy-company="${c['編號']}">複製</button></h3><div class="questions asks">${asks.map(q => `<p>${escape(q)}</p>`).join('')}</div>` : '';
    const list = jobs.length
      ? `<h3>公開職缺 <small>${escape(counts)}</small></h3><ul class="jobs">${jobs.map(jobRow).join('')}</ul>` +
        (b['職缺總數'] > jobs.length ? `<p class="muted">只列與我背景較近的 ${jobs.length} 筆，其餘見公司職缺頁。</p>` : '')
      : '<p class="muted">9/9 公開清單沒抓到職缺，現場直接問他們開了哪些職位。</p>';
    return business + ask + list;
  }
  function card(c) {
    const p = c.profile, id = c['編號'], saved = record(id);
    const rank = p ? `交流順位 ${p['順序']} · ` : '';
    const booth = /[A-G]\d\d/.exec(c['最新攤位'])?.[0] || '待核';
    const role = p?.['要問職務'] || c['目標'];
    const salary = p?.['薪資口徑'] || c['待遇判斷'];
    const urls = p?.['重點JD網址']?.match(/https:\/\/[^\s；]+/g) || [];
    return `<details class="company" data-company="${id}"><summary><span class="booth">${escape(booth)}</span><span><span class="meta">${escape(rank + c['分級'])}${saved.visited ? ' · 已交流' : ''}</span><h3>${escape(c['企業或項目'])}</h3><span class="lead">${escape(role)}</span><span class="salary">${escape(salary)}</span>${c.brief ? `<span class="jobcount">${c.brief['新人可投'] ? `新人可投 ${c.brief['新人可投']} 筆` : c.brief['職缺總數'] ? '公開職缺皆要年資' : '未取得職缺清單'}${c.brief['職缺總數'] ? ` · 共 ${c.brief['職缺總數']} 筆` : ''}</span>` : ''}</span></summary><div class="detail">${briefBlock(c)}<dl>${field('9/9 篩選判斷', c['判斷及排除原因'])}${p ? field('為何值得交流 · 建議', p['為何值得聊']) + field('門檻與風險', p['門檻與風險']) + field('福利 · 雇主刊載，非契約保證', p['福利資料及限制']) : field('資料狀態', c['資料狀態'])}</dl>${p ? `<h3>深入追問（9/9 詳析）</h3><p class="questions">${escape(p['專屬提問'])}</p>` : '<p class="questions">先確認有無正式新鮮人職缺，再索取工作內容、薪資與工作地點；沒有合適職缺便不用久留。</p>'}<div class="sources">${link(c['來源'], '公司／原始來源')}${urls.map((u,i) => link(u, `查核職缺 ${i+1}`)).join('')}</div><p class="muted">職缺链接包含對照與排除案例，不代表每份都推薦或仍開放。</p><label class="visited"><input type="checkbox" data-visited="${id}" ${saved.visited ? 'checked' : ''}>已交流</label><label class="note">HR 回覆與待辦<textarea data-note="${id}" placeholder="固定月薪／保證月份、實際廠址、帶領人、面試題型、聯絡方式與投遞期限">${escape(saved.note || '')}</textarea></label></div></details>`;
  }
  function updateProgress() { $('progress').textContent = `已交流 ${entries.filter(c => record(c['編號']).visited).length} 家`; }
  function render() {
    const query = $('search').value.trim().toLocaleLowerCase(), tier = $('tier').value, zone = $('zone').value;
    const selected = entries.filter(c => {
      const p = c.profile, level = c['分級'][0];
      const matchTier = tier === 'all' || tier === 'top' && p && p['順序'] <= 12 || tier === 'profiles' && p || level === tier;
      const text = JSON.stringify(c).toLocaleLowerCase();
      return matchTier && (!query || text.includes(query)) && (!zone || new RegExp(zone + '\\d\\d').test(c['最新攤位'])) && (!$('only-pending').checked || !record(c['編號']).visited)
        && (!$('only-fresh').checked || (c.brief?.['新人可投'] || 0) > 0);
    }).sort((a,b) => (a.profile?.['順序'] || 1000) - (b.profile?.['順序'] || 1000) || a['編號'] - b['編號']);
    $('results').innerHTML = selected.length ? selected.map(card).join('') : '<p class="notice">此篩選沒有結果。可改選「全部 152 項」或清除關鍵字與展區。</p>';
    $('count').textContent = `${selected.length} 項符合 · 基礎名單 152 項／其中 31 家詳析`;
    updateProgress();
  }
  ['search','tier','zone','only-pending','only-fresh'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('results').addEventListener('input', event => {
    const id = event.target.dataset.note;
    if (!id) return;
    state.companies[id] = {...record(id), note:event.target.value}; save();
  });
  $('results').addEventListener('click', async event => {
    const id = event.target.closest('[data-copy-company]')?.dataset.copyCompany;
    if (!id) return;
    const text = (briefs[id]?.['開場問句'] || []).join('\n');
    event.preventDefault();
    try { await navigator.clipboard.writeText(text); feedback('已複製提問'); }
    catch { feedback('無法自動複製；請長按選取文字。'); }
  });
  $('results').addEventListener('change', event => {
    const id = event.target.dataset.visited;
    if (!id) return;
    state.companies[id] = {...record(id), visited:event.target.checked}; save(); updateProgress();
    const details = event.target.closest('details');
    const c = entries.find(item => String(item['編號']) === id);
    details.querySelector('.meta').textContent = `${c.profile ? `交流順位 ${c.profile['順序']} · ` : ''}${c['分級']}${event.target.checked ? ' · 已交流' : ''}`;
    if ($('only-pending').checked) render();
  });
  document.querySelectorAll('[data-check]').forEach(input => {
    input.checked = !!state.checks[input.dataset.check];
    input.addEventListener('change', () => { state.checks[input.dataset.check] = input.checked; save(); });
  });
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($(button.dataset.copy).innerText); feedback('已複製'); }
    catch { const range = document.createRange(); range.selectNodeContents($(button.dataset.copy)); const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); feedback('無法自動複製；已選取文字。'); }
  }));
  $('export').addEventListener('click', () => {
    const result = {event:'Cake 2026-09-12', exportedAt:new Date().toISOString(), checks:state.checks, records:entries.filter(c => state.companies[c['編號']]).map(c => ({company:c['企業或項目'], booth:c['最新攤位'], ...record(c['編號'])}))};
    const url = URL.createObjectURL(new Blob([JSON.stringify(result,null,2)], {type:'application/json;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'Cake_20260912_交流紀錄.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); feedback('交流紀錄已匯出');
  });
  $('extras').innerHTML = data.extras.map(c => `<article><h3>${escape(c['攤位'])} · ${escape(c['項目'])}</h3><p>${escape(c['判斷'])}</p><p>${escape(c['原因'])}</p>${link(c['來源'], '資料來源')}</article>`).join('');
  $('risks').innerHTML = data.risks.map(r => {
    const fix = sourceFixes[r['來源']];
    const source = fix
      ? `<p class="notice">原始連結已失效：${escape(fix['說明'])}</p><div class="sources">${(fix['替代'] || []).map(([label, url]) => link(url, label)).join('')}</div>`
      : `<div class="sources">${link(r['來源'], '原始來源')}</div>` +
        (unchecked.has(r['來源']) ? '<p class="muted">9/11 覆查時這個站台沒有回應（可能擋外部檢查），連結未必失效，開不起來就當沒有這條線索。</p>' : '');
    return `<details><summary>${escape(r['公司'])} · ${escape(r['證據類型'])}</summary><p class="muted">${escape(r['資料日期'])} · 整理於 9/9</p><p>${escape(r['結論與限制'])}</p><p><strong>待確認：</strong>${escape(r['現場追問'])}</p>${source}</details>`;
  }).join('');
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
