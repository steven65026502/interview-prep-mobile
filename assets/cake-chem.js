(() => {
  'use strict';
  const data = window.CHEM_GUIDE;
  const key = 'cake-20260912-chem-notes-v1';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state = {companies:{}, checks:{}};
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved.companies === 'object' && typeof saved.checks === 'object') state = saved;
  } catch { /* A blocked store must not stop the guide from rendering. */ }
  let feedbackTimer;
  function feedback(message) { $('feedback').textContent = message; clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => $('feedback').textContent = '', 3500); }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { feedback('瀏覽器無法保存；請先匯出紀錄。'); } }
  const record = booth => state.companies[booth] || {};
  const link = (url, label) => /^https:\/\//.test(url || '') ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>` : '';

  function jobRow(job) {
    const title = job['連結'] ? `<a href="${escape(job['連結'])}" target="_blank" rel="noopener noreferrer">${escape(job['職稱'])}</a>` : escape(job['職稱']);
    const flags = [];
    if (job['輪班']) flags.push('JD 寫輪班');
    if (job['無塵室']) flags.push('JD 寫無塵室／黃光');
    if (job['已下架']) flags.push('9/11 覆查已下架');
    const warn = flags.length ? ` · <b class="warn">${escape(flags.join('、'))}</b>` : '';
    const tags = [job['年資'], job['型態'], job['地點']].filter(Boolean).join(' · ');
    return `<li class="${job['已下架'] ? 'gone' : flags.length ? 'warn' : 'ok'}">${title}<span class="jobtags">${escape(tags)}${warn}</span></li>`;
  }

  function card(c) {
    const booth = c['攤位'], saved = record(booth);
    const jobs = $('only-day').checked ? c['職缺'].filter(j => !j['輪班'] && !j['無塵室'] && !j['已下架']) : c['職缺'];
    const counts = `${c['職缺'].length} 筆相關職缺` + (c['職缺'].some(j => j['輪班'] || j['無塵室']) ? ` · 其中 ${c['職缺'].filter(j => j['輪班'] || j['無塵室']).length} 筆寫了輪班或無塵室` : '');
    return `<details class="company" data-company="${escape(booth)}">
      <summary><span class="booth">${escape(booth)}</span><span>
        <span class="meta">${escape(c['分級'])}${saved.visited ? ' · 已交流' : ''}</span>
        <h3>${escape(c['公司'])}</h3>
        <span class="jobcount">${escape(counts)}</span></span></summary>
      <div class="detail">
        <h3>為什麼要去這攤</h3><p class="business">${escape(c['為什麼去'])}</p>
        <h3>開場就這樣問 <button type="button" class="copy" data-copy-booth="${escape(booth)}">複製</button></h3>
        <div class="questions asks">${c['要問'].map(q => `<p>${escape(q)}</p>`).join('')}</div>
        <h3>相關職缺 <small>${escape(counts)}</small></h3>
        ${jobs.length ? `<ul class="jobs">${jobs.map(jobRow).join('')}</ul>` : '<p class="muted">這家的相關職缺全部寫了輪班或無塵室；取消上面的勾選可以看到。</p>'}
        ${c['做什麼'] ? `<details class="about"><summary>公司自述（雇主刊載）</summary><p>${escape(c['做什麼'])}</p>${c['地址'] ? `<p class="muted">登記地址：${escape(c['地址'])}</p>` : ''}</details>` : ''}
        <div class="sources">${link(c['來源'], '公司職缺頁')}</div>
        <label class="visited"><input type="checkbox" data-visited="${escape(booth)}" ${saved.visited ? 'checked' : ''}>已交流</label>
        <label class="note">HR 怎麼回答<textarea data-note="${escape(booth)}" placeholder="班別／要不要進無塵室、廠區在哪、帶人方式、固定月薪與保證月份、聯絡人與投遞期限">${escape(saved.note || '')}</textarea></label>
      </div></details>`;
  }

  function updateProgress() { $('progress').textContent = `已交流 ${data.companies.filter(c => record(c['攤位']).visited).length} / ${data.companies.length} 攤`; }
  function render() { $('results').innerHTML = data.companies.map(card).join(''); updateProgress(); }

  $('only-day').addEventListener('change', render);
  $('results').addEventListener('input', event => {
    const booth = event.target.dataset.note;
    if (!booth) return;
    state.companies[booth] = {...record(booth), note:event.target.value}; save();
  });
  $('results').addEventListener('change', event => {
    const booth = event.target.dataset.visited;
    if (!booth) return;
    state.companies[booth] = {...record(booth), visited:event.target.checked}; save(); updateProgress();
    const c = data.companies.find(item => item['攤位'] === booth);
    event.target.closest('details').querySelector('.meta').textContent = `${c['分級']}${event.target.checked ? ' · 已交流' : ''}`;
  });
  $('results').addEventListener('click', async event => {
    const booth = event.target.closest('[data-copy-booth]')?.dataset.copyBooth;
    if (!booth) return;
    event.preventDefault();
    const c = data.companies.find(item => item['攤位'] === booth);
    try { await navigator.clipboard.writeText(c['要問'].join('\n')); feedback('已複製提問'); }
    catch { feedback('無法自動複製；請長按選取文字。'); }
  });
  document.querySelectorAll('[data-check]').forEach(input => {
    input.checked = !!state.checks[input.dataset.check];
    input.addEventListener('change', () => { state.checks[input.dataset.check] = input.checked; save(); });
  });
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($(button.dataset.copy).innerText); feedback('已複製'); }
    catch { feedback('無法自動複製；請長按選取文字。'); }
  }));
  $('export').addEventListener('click', () => {
    const result = {event:'Cake 2026-09-12 · 化學碩士版', exportedAt:new Date().toISOString(), checks:state.checks,
      records:data.companies.filter(c => state.companies[c['攤位']]).map(c => ({booth:c['攤位'], company:c['公司'], ...record(c['攤位'])}))};
    const url = URL.createObjectURL(new Blob([JSON.stringify(result,null,2)], {type:'application/json;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'Cake_20260912_化學版_交流紀錄.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000); feedback('交流紀錄已匯出');
  });
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
