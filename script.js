const regions = [
  { id: "abai", name: "Абайская", snp: 146, built: 95, plan: 62, status: "ahead", x: 675, y: 242, w: 120, h: 86, cx: 755, cy: 330 },
  { id: "akmola", name: "Акмолинская", snp: 226, built: 145, plan: 65, status: "ontrack", x: 365, y: 120, w: 140, h: 92, cx: 470, cy: 235 },
  { id: "aktobe", name: "Актюбинская", snp: 184, built: 96, plan: 61, status: "behind", x: 145, y: 222, w: 148, h: 112, cx: 250, cy: 330 },
  { id: "almaty", name: "Алматинская", snp: 211, built: 144, plan: 64, status: "ahead", x: 588, y: 388, w: 142, h: 82, cx: 690, cy: 455 },
  { id: "atyrau", name: "Атырауская", snp: 94, built: 67, plan: 61, status: "ahead", x: 28, y: 326, w: 115, h: 84, cx: 135, cy: 370 },
  { id: "west", name: "ЗКО", snp: 127, built: 71, plan: 57, status: "ontrack", x: 18, y: 214, w: 116, h: 94, cx: 125, cy: 285 },
  { id: "zhambyl", name: "Жамбылская", snp: 168, built: 101, plan: 62, status: "ontrack", x: 470, y: 432, w: 110, h: 74, cx: 585, cy: 470 },
  { id: "zhetysu", name: "Жетысу", snp: 147, built: 80, plan: 59, status: "behind", x: 728, y: 350, w: 100, h: 86, cx: 785, cy: 435 },
  { id: "karaganda", name: "Карагандинская", snp: 232, built: 161, plan: 66, status: "ahead", x: 418, y: 235, w: 172, h: 135, cx: 540, cy: 345 },
  { id: "kostanay", name: "Костанайская", snp: 201, built: 123, plan: 61, status: "ontrack", x: 222, y: 92, w: 132, h: 106, cx: 330, cy: 205 },
  { id: "kyzylorda", name: "Кызылординская", snp: 133, built: 65, plan: 60, status: "behind", x: 264, y: 390, w: 165, h: 78, cx: 395, cy: 430 },
  { id: "mangystau", name: "Мангистауская", snp: 80, built: 54, plan: 58, status: "ahead", x: 70, y: 420, w: 120, h: 80, cx: 185, cy: 455 },
  { id: "pavlodar", name: "Павлодарская", snp: 158, built: 106, plan: 63, status: "ahead", x: 550, y: 104, w: 120, h: 88, cx: 645, cy: 220 },
  { id: "north", name: "СКО", snp: 179, built: 102, plan: 59, status: "ontrack", x: 365, y: 25, w: 132, h: 78, cx: 455, cy: 120 },
  { id: "turkistan", name: "Туркестанская", snp: 342, built: 149, plan: 60, status: "behind", x: 365, y: 474, w: 118, h: 82, cx: 490, cy: 505 },
  { id: "ulytau", name: "Ұлытау", snp: 104, built: 62, plan: 57, status: "ontrack", x: 320, y: 302, w: 98, h: 82, cx: 395, cy: 345 },
  { id: "east", name: "ВКО", snp: 178, built: 117, plan: 62, status: "ahead", x: 804, y: 205, w: 116, h: 108, cx: 850, cy: 320 },
  { id: "shymkent", name: "Шымкент", snp: 49, built: 32, plan: 65, status: "ontrack", x: 500, y: 520, w: 80, h: 48, cx: 595, cy: 530 },
  { id: "astana", name: "Астана", snp: 41, built: 29, plan: 66, status: "ahead", x: 515, y: 184, w: 72, h: 48, cx: 575, cy: 270 },
  { id: "almaty-city", name: "Алматы", snp: 18, built: 15, plan: 82, status: "ontrack", x: 700, y: 475, w: 70, h: 46, cx: 760, cy: 515 }
];

const technologies = [
  { name: "ВОЛС", value: 1268, color: "#16865d" },
  { name: "Wifi-public", value: 362, color: "#2876ba" },
  { name: "Спутник", value: 184, color: "#d69d22" }
];

const stages = [
  { name: "Подготовительные работы", done: 82, plannedDays: 7, actualDays: 6.4 },
  { name: "Прокладка оптического кабеля", done: 64, plannedDays: 18, actualDays: 19.8 },
  { name: "Монтажные и сварочные работы", done: 57, plannedDays: 9, actualDays: 9.1 },
  { name: "Измерения и паспортизация", done: 46, plannedDays: 5, actualDays: 5.8 },
  { name: "Сдача объекта в эксплуатацию", done: 39, plannedDays: 4, actualDays: 4.3 }
];

const statusText = {
  ahead: "Опережаем",
  ontrack: "По графику",
  behind: "Отстаем"
};

const statusColor = {
  ahead: "#16865d",
  ontrack: "#2876ba",
  behind: "#c45137"
};

const REGION_RADIUS = 44;
const mapLabels = {
  abai: "Абай",
  akmola: "Акмола",
  aktobe: "Актобе",
  almaty: "Алматы обл.",
  atyrau: "Атырау",
  zhambyl: "Жамбыл",
  karaganda: "Караганда",
  kostanay: "Костанай",
  kyzylorda: "Кызылорда",
  mangystau: "Мангистау",
  pavlodar: "Павлодар",
  turkistan: "Туркестан"
};

let activeFilter = "all";
let searchQuery = "";

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function percent(part, total) {
  return Math.round((part / total) * 100);
}

function initSummary() {
  const total = regions.reduce((sum, region) => sum + region.snp, 0);
  const built = regions.reduce((sum, region) => sum + region.built, 0);
  const ahead = regions.filter(region => region.status === "ahead").length;
  const behind = regions.filter(region => region.status === "behind").length;

  document.querySelector("#total-settlements").textContent = formatNumber(total);
  document.querySelector("#built-total").textContent = formatNumber(built);
  document.querySelector("#built-share").textContent = `${percent(built, total)}%`;
  document.querySelector("#ahead-total").textContent = ahead;
  document.querySelector("#behind-total").textContent = behind;
  document.querySelector("#donut-total").textContent = formatNumber(built);
}

function buildMap() {
  const map = document.querySelector("#kaz-map");
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.hidden = true;
  map.appendChild(tooltip);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 940 590");
  svg.setAttribute("role", "img");

  regions.forEach(region => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.dataset.status = region.status;
    group.dataset.name = region.name.toLowerCase();

    const cx = region.cx ?? region.x + region.w / 2;
    const cy = region.cy ?? region.y + region.h / 2;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", REGION_RADIUS);
    circle.setAttribute("class", "region-shape");
    circle.setAttribute("fill", statusColor[region.status]);
    circle.setAttribute("tabindex", "0");

    const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
    title.setAttribute("x", cx);
    title.setAttribute("y", cy - 9);
    title.setAttribute("class", "region-label");
    title.textContent = mapLabels[region.id] || region.name;

    const caption = document.createElementNS("http://www.w3.org/2000/svg", "text");
    caption.setAttribute("x", cx);
    caption.setAttribute("y", cy + 15);
    caption.setAttribute("class", "region-caption");
    caption.textContent = `${percent(region.built, region.snp)}%`;

    group.append(circle, title, caption);
    group.addEventListener("mousemove", event => showTooltip(event, region, tooltip, map));
    group.addEventListener("mouseleave", () => tooltip.hidden = true);
    svg.appendChild(group);
  });

  map.appendChild(svg);
}

function showTooltip(event, region, tooltip, map) {
  const bounds = map.getBoundingClientRect();
  tooltip.innerHTML = `
    <strong>${region.name}</strong>
    <span>СНП в проекте: ${formatNumber(region.snp)}</span>
    <span>Построено: ${formatNumber(region.built)} (${percent(region.built, region.snp)}%)</span>
    <span>План: ${region.plan}%</span>
    <span>Статус: ${statusText[region.status]}</span>
  `;
  tooltip.hidden = false;
  tooltip.style.left = `${Math.min(event.clientX - bounds.left + 14, bounds.width - 230)}px`;
  tooltip.style.top = `${Math.max(event.clientY - bounds.top - 20, 12)}px`;
}

function buildTechnologies() {
  const total = technologies.reduce((sum, item) => sum + item.value, 0);
  let start = 0;
  const stops = technologies.map(item => {
    const share = (item.value / total) * 100;
    const segment = `${item.color} ${start}% ${start + share}%`;
    start += share;
    return segment;
  });

  document.querySelector("#tech-donut").style.background = `conic-gradient(${stops.join(", ")})`;
  document.querySelector("#tech-list").innerHTML = technologies.map(item => `
    <div class="tech-row">
      <div class="tech-row-top">
        <strong>${item.name}</strong>
        <span>${formatNumber(item.value)} СНП · ${percent(item.value, total)}%</span>
      </div>
      <div class="bar"><span style="width:${percent(item.value, total)}%; background:${item.color}"></span></div>
    </div>
  `).join("");
}

function buildStages() {
  document.querySelector("#stage-list").innerHTML = stages.map(stage => {
    const diff = +(stage.actualDays - stage.plannedDays).toFixed(1);
    const color = diff <= -0.3 ? "#16865d" : diff <= 0.5 ? "#2876ba" : "#c45137";
    const label = diff <= -0.3 ? "быстрее плана" : diff <= 0.5 ? "в норме" : "дольше плана";

    return `
      <div class="stage-row">
        <div class="stage-row-top">
          <strong>${stage.name}</strong>
          <span>${stage.done}% завершено</span>
        </div>
        <div class="bar"><span style="width:${stage.done}%; background:${color}"></span></div>
        <div class="stage-meta">
          <span>План: ${stage.plannedDays} дн. · Факт: ${stage.actualDays} дн.</span>
          <span style="color:${color}">${label}</span>
        </div>
      </div>
    `;
  }).join("");
}

function getVisibleRegions() {
  return regions.filter(region => {
    const matchesFilter = activeFilter === "all" || region.status === activeFilter;
    const matchesSearch = region.name.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });
}

function renderRegions() {
  const visible = getVisibleRegions();
  const table = document.querySelector("#regions-table");
  table.innerHTML = visible.map(region => {
    const progress = percent(region.built, region.snp);
    const deviation = progress - region.plan;
    const deviationText = `${deviation > 0 ? "+" : ""}${deviation} п.п.`;

    return `
      <tr>
        <td><strong>${region.name}</strong></td>
        <td>${formatNumber(region.snp)}</td>
        <td>${formatNumber(region.built)}</td>
        <td>
          <div class="progress-cell">
            <div class="bar"><span style="width:${progress}%; background:${statusColor[region.status]}"></span></div>
            <span>${progress}%</span>
          </div>
        </td>
        <td>${deviationText}</td>
        <td><span class="status-badge ${region.status}">${statusText[region.status]}</span></td>
      </tr>
    `;
  }).join("");

  document.querySelector("#shown-count").textContent = `${visible.length} регионов`;
  updateMapVisibility(visible);
}

function updateMapVisibility(visibleRegions) {
  const ids = new Set(visibleRegions.map(region => region.id));
  document.querySelectorAll("#kaz-map g").forEach((group, index) => {
    const shape = group.querySelector(".region-shape");
    shape.classList.toggle("dimmed", !ids.has(regions[index].id));
  });
}

function bindControls() {
  document.querySelectorAll(".segment").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      renderRegions();
    });
  });

  document.querySelector("#region-search").addEventListener("input", event => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderRegions();
  });
}

initSummary();
buildMap();
buildTechnologies();
buildStages();
bindControls();
renderRegions();
