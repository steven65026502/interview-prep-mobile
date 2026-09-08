(() => {
  'use strict';
  const key = document.body.dataset.storageKey;
  const notes = document.querySelector('#notes-text');
  const checks = [...document.querySelectorAll('.check input')];
  const status = document.querySelector('#save-status');
  if (key) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (notes && typeof saved.notes === 'string') notes.value = saved.notes;
      checks.forEach(input => { input.checked = saved.checks?.[input.id] === true; });
    } catch { status.textContent = '無法讀取先前筆記；目前仍可練習。'; }
    const save = () => {
      try {
        localStorage.setItem(key, JSON.stringify({notes: notes?.value || '', checks: Object.fromEntries(checks.map(input => [input.id, input.checked]))}));
        status.textContent = '已儲存在這個瀏覽器。';
      } catch { status.textContent = '目前無法儲存，請自行保留筆記。'; }
    };
    notes?.addEventListener('input', save);
    checks.forEach(input => input.addEventListener('change', save));
  }
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const output = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).innerText);
      output.textContent = '已複製。';
    } catch { output.textContent = '瀏覽器不允許複製，請長按文字選取。'; }
  }));
  const duration = document.querySelector('#duration');
  if (duration) {
    const display = document.querySelector('#timer');
    const start = document.querySelector('#timer-start');
    const pause = document.querySelector('#timer-pause');
    let remaining = Number(duration.value) * 1000;
    let deadline = 0;
    let interval;
    const render = () => {
      const seconds = Math.ceil(remaining / 1000);
      display.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    };
    const stop = () => { clearInterval(interval); interval = undefined; start.disabled = remaining <= 0; pause.disabled = true; };
    const tick = () => { remaining = Math.max(0, deadline - Date.now()); render(); if (!remaining) stop(); };
    start.addEventListener('click', () => {
      if (interval || remaining <= 0) return;
      deadline = Date.now() + remaining;
      interval = setInterval(tick, 150);
      start.disabled = true;
      pause.disabled = false;
    });
    pause.addEventListener('click', () => { tick(); stop(); });
    const reset = () => { remaining = Number(duration.value) * 1000; stop(); render(); };
    duration.addEventListener('change', reset);
    document.querySelector('#timer-reset').addEventListener('click', reset);
    reset();
  }
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
