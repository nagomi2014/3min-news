// 3分ニュース ─ e-life PWA
// data/index.json（号の一覧）→ data/editions/<date>.json（各号）を読み込む。
// 最新号をデフォルト表示し、バックナンバーから過去号も読める。

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const getJSON = async (path) => {
  const res = await fetch(path + "?v=" + Date.now());
  if (!res.ok) throw new Error(path + " " + res.status);
  return res.json();
};

let EDITIONS = []; // [{date, label}] newest first
let LATEST = null;

async function init() {
  try {
    const idx = await getJSON("data/index.json");
    EDITIONS = idx.editions || [];
    if (!EDITIONS.length) throw new Error("配信された号がまだありません");
    LATEST = EDITIONS[0].date;
    await showEdition(LATEST);
    renderBackNumbers();
  } catch (e) {
    document.getElementById("newsList").innerHTML =
      `<p style="padding:24px;color:#54605b">ニュースを読み込めませんでした。<br>${esc(e.message)}</p>`;
  }
}

async function showEdition(date) {
  const data = await getJSON("data/editions/" + date + ".json");
  renderEdition(data, date);
}

function renderEdition(data, date) {
  const tagEl = document.getElementById("tagline");
  if (data.tagline && tagEl) tagEl.textContent = data.tagline;
  document.getElementById("edition").textContent = data.edition_label || data.edition || "";

  // 最新でなければ「バックナンバー表示中」バナー
  const banner = document.getElementById("backBanner");
  if (date && date !== LATEST) {
    banner.style.display = "block";
  } else {
    banner.style.display = "none";
  }

  // 今日の3本
  const list = document.getElementById("newsList");
  list.innerHTML = (data.items || []).map((item, i) => `
    <article class="card">
      <div class="card-head">
        <div class="card-no"><b>${i + 1}</b><span class="card-cat">${esc(item.category)}</span></div>
      </div>
      <h2 class="card-title">${esc(item.title)}</h2>
      <p class="card-summary">${esc(item.summary)}</p>
      ${item.source_url ? `<p class="card-source"><a href="${esc(item.source_url)}" target="_blank" rel="noopener">${esc(item.source || "出典")}</a></p>` : ""}
      ${item.harry_take ? `
      <div class="harry">
        <div class="harry-label">🦔 ハリーの視点</div>
        <div class="harry-text">${esc(item.harry_take)}</div>
      </div>` : ""}
    </article>
  `).join("");

  // 今週の特集
  const w = data.weekly;
  const wEl = document.getElementById("weekly");
  if (w) {
    wEl.innerHTML = `
      <div class="weekly-tag">WEEKLY 特集</div>
      <h2 class="weekly-title">${esc(w.title)}</h2>
      <p class="weekly-lead">${esc(w.lead)}</p>
      <ul class="weekly-points">${(w.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;
  } else {
    wEl.innerHTML = `<p style="color:#54605b">この号の特集はありません。</p>`;
  }
}

function renderBackNumbers() {
  const el = document.getElementById("backList");
  el.innerHTML = EDITIONS.map((ed, i) => `
    <button class="back-item" data-date="${esc(ed.date)}">
      <span class="back-date">${esc(ed.label || ed.date)}</span>
      ${i === 0 ? '<span class="back-latest">最新</span>' : ""}
    </button>
  `).join("");
  el.querySelectorAll(".back-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await showEdition(btn.dataset.date);
      switchView("today");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function switchView(view) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");
}

// Tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchView(tab.dataset.view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// 最新へ戻る
document.getElementById("backToLatest").addEventListener("click", async (e) => {
  e.preventDefault();
  await showEdition(LATEST);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

init();
