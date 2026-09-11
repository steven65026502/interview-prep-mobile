(() => {
  'use strict';
  // Grouping is an advisory screen of the event list, not confirmed hiring eligibility.
  const companies = [
    ['帆宣系統科技','先談','PLC／HMI 有具體方向，先確認新人培訓、工作地與現場比例。'],
    ['台灣矽科宏晟科技','先談','控制程式與儀電整合值得談；確認是否能媒合北部職與安全培訓。'],
    ['高信工程','補問','先分清控制軟體與水電、空調施工管理；索取精確 JD。'],
    ['士林電機','補問','問是否可轉介資訊或控制職，機構研發與電力業務不是軟體職。'],
    ['漢唐集成','補問','活動主打資深工程；先問監控／自控新人名額，不預設符合。'],
    ['光洋應用材料科技','補問','儀控可能有交集，需釐清電力維修、證照及班制；非台灣應用材料。'],
    ['兆聯實業','條件式','工程專案可能偏水處理與現場；有資料／監控實作和帶領再談。'],
    ['信紘科技','條件式','先問是否有控制或設備資料職，不將化學供應工程 PM 當軟體 PM。'],
    ['和淞科技','條件式','駐廠與配管方向較遠；若可做設備控制、測試整合再索取 JD。'],
    ['洋基工程','條件式','機電工程須確認是否包含圖控開發，不能只看工程師名稱。'],
    ['太丞','條件式','維保與監造不是現成的程式入口，先問控制系統及培訓。'],
    ['安葆國際實業','條件式','確認有無監控／控制軟體，否則以現場工程職取捨。'],
    ['新應材','條件式','化學製程不是資工直接對應；只問有無內部資訊或自動化名額。'],
    ['李長榮化學工業','條件式','活動主力不是初階軟體；若無資訊／資料職就不久留。'],
    ['勝一化工','不優先','不要因助理工程師可入門就跨到未具備基礎的化工職。'],
    ['台灣紙業','不優先','先分清化學、氣體與資訊系統；沒有後者就不是本次主力。'],
    ['弘潔科技','不優先','洗淨與表面處理方向較遠，需另有具體開發職才調整順位。'],
    ['晨碩系統科技','不優先','名稱有系統不代表軟體，監工與工安職不直接對應目前作品。'],
    ['茂迅系統工程','不優先','工程管理需先釐清施工責任，不視為技術型產品 PM。'],
    ['達欣工程','不優先','營建、品管與安衛方向不同，除非另有資訊自動化入口。'],
    ['根基營造','不優先','現場施工和職安不是目前主攻；有資訊職再另外評估。'],
    ['大三億營造','不優先','營造助理不等於軟體助理，需確認工作內容而非只看新人資格。'],
    ['麗明營造','不優先','建築營建和資料工程能力不同，不因承接半導體案就優先。'],
    ['互助營造','不優先','土建機電主線較遠；沒有控制或資訊缺就保留時間給前段公司。'],
    ['田鼎營造','不優先','施工專業與目前背景不同；先問有無資訊職再決定是否遞履歷。']
  ];
  const result = document.getElementById('company-results');
  const search = document.getElementById('company-search');
  const tier = document.getElementById('company-tier');
  function render() {
    const matches = companies.filter(c => (tier.value === 'all' || tier.value === c[1]) && c.join(' ').toLowerCase().includes(search.value.trim().toLowerCase()));
    result.replaceChildren();
    matches.forEach(c => {
      const article = document.createElement('article');
      article.className = 'brief';
      const heading = document.createElement('h3'); heading.textContent = c[0] + ' · ' + c[1];
      const note = document.createElement('p'); note.textContent = c[2];
      article.append(heading,note); result.append(article);
    });
    document.getElementById('company-count').textContent = matches.length + ' / 25 家 · 分組為適配建議，不是入職評分';
    if (!matches.length) { const p = document.createElement('p'); p.textContent = '沒有符合項目，請清除搜尋或改選全部。'; result.append(p); }
  }
  search.addEventListener('input',render); tier.addEventListener('change',render); render();
})();
