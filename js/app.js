// 治療家の3分ニュース ─ e-life PWA
// データは data/news.json を読み込んで描画する（毎日ここを差し替えれば配信）

const PODCAST_URL = "https://open.spotify.com/"; // TODO: ハリーラジオの実URLに差し替え

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function load() {
  try {
    const res = await fetch("data/news.json?v=" + Date.now());
    if (!res.ok) throw new Error("news.json " + res.status);
    const data = await res.json();
    render(data);
  } catch (e) {
    document.getElementById("newsList").innerHTML =
      `<p style="padding:24px;color:#54605b">ニュースを読み込めませんでした。<br>${esc(e.message)}</p>`;
  }
}

function render(data) {
  const tagEl = document.getElementById("tagline");
  if (data.tagline && tagEl) tagEl.textContent = data.tagline;
  document.getElementById("edition").textContent = data.edition_label || data.edition || "";
  document.getElementById("podcastLink").href = PODCAST_URL;

  // Today's 3
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

  // Weekly
  const w = data.weekly;
  const wEl = document.getElementById("weekly");
  if (w) {
    wEl.innerHTML = `
      <div class="weekly-tag">WEEKLY 特集</div>
      <h2 class="weekly-title">${esc(w.title)}</h2>
      <p class="weekly-lead">${esc(w.lead)}</p>
      <ul class="weekly-points">${(w.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`;
  } else {
    wEl.innerHTML = `<p style="color:#54605b">今週の特集は準備中です。</p>`;
  }
}

// Tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("view-" + tab.dataset.view).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

load();
