/*
  SALE-EU v2 frontend
  Set API_BASE_URL to your deployed Worker URL.
*/
const API_BASE_URL = "https://YOUR-WORKER.workers.dev";

const productsEl = document.querySelector("#products");
const emptyEl = document.querySelector("#emptyState");
const titleEl = document.querySelector("#productsTitle");
const searchInput = document.querySelector("#searchInput");
const toast = document.querySelector("#toast");
let products = [];
let activeCategory = "all";
let activeFilter = "all";
const favorites = new Set();

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2200);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {"Accept":"application/json", ...(options.headers || {})}
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function productCard(p){
  return `
    <article class="product">
      <div class="product-media">
        <button class="heart" data-fav="${p.id}" aria-label="Pievienot favorītiem">${favorites.has(p.id)?"♥":"♡"}</button>
        <span class="sale">-${p.discount_percent || 0}%</span>
        <span>${p.emoji || "🛍️"}</span>
      </div>
      <div class="product-body">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="rating">★ ${Number(p.rating || 0).toFixed(1)} <span>(${Number(p.review_count || 0).toLocaleString("lv-LV")})</span></div>
        <div><span class="price">€${Number(p.price).toFixed(2)}</span>${p.old_price ? `<span class="old">€${Number(p.old_price).toFixed(2)}</span>` : ""}</div>
        <div class="platform-label">${p.platform==="amazon"?"amazon":"AliExpress"} · 🇪🇺</div>
        <button class="product-action" data-product="${p.id}">Apskatīt preci →</button>
      </div>
    </article>`;
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function render(){
  const q = searchInput.value.trim().toLowerCase();
  let list = products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category_slug === activeCategory;
    const haystack = `${p.name} ${p.category_name} ${p.platform}`.toLowerCase();
    const matchesQuery = !q || haystack.includes(q);
    const matchesFilter = activeFilter==="deals" ? p.is_deal : activeFilter==="popular" ? p.is_popular : true;
    return matchesCategory && matchesQuery && matchesFilter;
  });

  titleEl.textContent = activeCategory!=="all" ? `📂 ${list[0]?.category_name || "Kategorija"}` :
    activeFilter==="deals" ? "🔥 Dienas piedāvājumi" :
    activeFilter==="popular" ? "★ Populārākās preces" : "🔥 Ieteiktie piedāvājumi";

  productsEl.innerHTML = list.map(productCard).join("");
  emptyEl.hidden = list.length > 0;
  productsEl.hidden = list.length === 0;
}

async function loadProducts(){
  try {
    products = await api("/api/products?limit=100");
    render();
  } catch (err) {
    console.error(err);
    productsEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.querySelector("h3").textContent = "Neizdevās ielādēt katalogu";
    emptyEl.querySelector("p").textContent = "Pārbaudi API_BASE_URL un Cloudflare Worker konfigurāciju.";
  }
}

document.addEventListener("click", async e => {
  const cat = e.target.closest(".category");
  if(cat){
    activeCategory = cat.dataset.category;
    activeFilter = "all";
    document.querySelectorAll(".category").forEach(x=>x.classList.toggle("selected",x===cat));
    document.querySelector("#productsSection").scrollIntoView({behavior:"smooth"});
    render();
    return;
  }

  const nav = e.target.closest(".nav-item");
  if(nav){
    const f = nav.dataset.filter;
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
    nav.classList.add("active");
    if(f==="how"){ document.querySelector("#howSection").scrollIntoView({behavior:"smooth"}); return; }
    if(f==="about"){ showToast("SALE-EU ir neatkarīgs piedāvājumu katalogs."); return; }
    activeCategory = "all";
    activeFilter = f;
    render();
    document.querySelector("#productsSection").scrollIntoView({behavior:"smooth"});
    return;
  }

  const fav = e.target.closest("[data-fav]");
  if(fav){
    const id = Number(fav.dataset.fav);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    render();
    showToast(favorites.has(id) ? "Pievienots favorītiem" : "Noņemts no favorītiem");
    return;
  }

  const prod = e.target.closest("[data-product]");
  if(prod){
    const id = Number(prod.dataset.product);
    // Worker records the click and redirects to the stored affiliate URL.
    window.open(`${API_BASE_URL}/go/${id}`, "_blank", "noopener,noreferrer");
  }
});

searchInput.addEventListener("input",()=>{activeCategory="all";render()});
document.querySelector("#searchForm").addEventListener("submit",e=>e.preventDefault());
document.querySelector("#resetFilters").addEventListener("click",()=>{
  activeCategory="all"; activeFilter="all"; searchInput.value="";
  document.querySelectorAll(".category").forEach(x=>x.classList.remove("selected"));
  render();
});
document.querySelector("#heroDeals").addEventListener("click",()=>{
  activeFilter="all"; activeCategory="all";
  document.querySelector("#productsSection").scrollIntoView({behavior:"smooth"}); render();
});
document.querySelector("#heroDaily").addEventListener("click",()=>{
  activeFilter="deals"; activeCategory="all";
  document.querySelector("#productsSection").scrollIntoView({behavior:"smooth"}); render();
});
document.querySelector("#favoritesBtn").addEventListener("click",()=>{
  showToast(favorites.size ? `Tev ir ${favorites.size} favorīts/-i.` : "Pagaidām nav saglabātu favorītu.");
});
document.querySelector("#themeBtn").addEventListener("click",()=>{
  document.body.classList.toggle("dark");
  document.querySelector("#themeBtn").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
});
document.querySelector("#newsletter").addEventListener("submit",e=>{
  e.preventDefault();
  showToast("Paldies! Newsletter servisu pievienosim nākamajā etapā.");
  e.target.reset();
});

loadProducts();
