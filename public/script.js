const TOTAL_STATIONS = 459;
const TODAY = new Date("2026-07-09T00:00:00");

const statuses = {
  done: { label: "Выполнено", color: "#16945f", className: "done" },
  active: { label: "В работе", color: "#226fc2", className: "active" },
  wait: { label: "В ожидании", color: "#8b96a6", className: "wait" }
};

const stageMeta = {
  "Ожидание": { color: "#8b96a6", weight: 0 },
  "Тендер ПИР": { color: "#6f55d8", weight: 12 },
  "ПИР в работе": { color: "#226fc2", weight: 25 },
  "ПИР завершен": { color: "#1298a8", weight: 38 },
  "Тендер СМР": { color: "#6f55d8", weight: 45 },
  "СМР в работе": { color: "#226fc2", weight: 72 },
  "СМР завершен": { color: "#16945f", weight: 90 },
  "Приемка": { color: "#d6a229", weight: 96 },
  "Завершено": { color: "#16945f", weight: 100 }
};

const regions = [
  ["Север", "Акмолинская область", ["Кокшетау", "Щучинск", "Степногорск"]],
  ["Север", "Костанайская область", ["Костанай", "Рудный", "Лисаковск"]],
  ["Север", "Павлодарская область", ["Павлодар", "Экибастуз", "Аксу"]],
  ["Юг", "Туркестанская область", ["Туркестан", "Кентау", "Арысь"]],
  ["Юг", "Жамбылская область", ["Тараз", "Шу", "Кордай"]],
  ["Юг", "Кызылординская область", ["Кызылорда", "Аральск", "Байконур"]],
  ["Запад", "Атырауская область", ["Атырау", "Кульсары", "Индер"]],
  ["Запад", "Мангистауская область", ["Актау", "Жанаозен", "Бейнеу"]],
  ["Запад", "Актюбинская область", ["Актобе", "Хромтау", "Шалкар"]],
  ["Восток", "Восточно-Казахстанская область", ["Усть-Каменогорск", "Риддер", "Алтай"]],
  ["Восток", "Абайская область", ["Семей", "Курчатов", "Аягоз"]],
  ["Центр", "Карагандинская область", ["Караганда", "Темиртау", "Балхаш"]],
  ["Центр", "Улытауская область", ["Жезказган", "Сатпаев", "Улытау"]],
  ["Юго-Восток", "Алматинская область", ["Конаев", "Талгар", "Каскелен"]],
  ["Юго-Восток", "Жетысуская область", ["Талдыкорган", "Текели", "Сарканд"]]
];

const contractors = ["KazBuild Telecom", "Qazaq Tower Service", "Altel Infra", "Steppe Engineering", "Orda Construction", "Sapa Montazh"];
const designers = ["GeoProject KZ", "Alem Design", "Nomad Project", "Sigma PIR", "Ulan Engineering"];
const types = ["Макро", "Транспортная", "Узловая", "Приграничная", "Сельская"];
const risks = ["", "Риск задержки поставки", "Требуется акт приемки", "Нет фактической стоимости", "Нет подрядчика", "Без плановой даты завершения"];

let stations = createMockStations();
let filteredStations = [...stations];
let sortState = { key: "stationId", direction: "asc" };

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value || 0));
}

function formatMoney(value) {
  return `${formatNumber(value)} млн ₸`;
}

function formatBillions(value) {
  return (value / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

function dateAdd(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function toIso(date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.round((new Date(end) - new Date(start)) / 86400000);
}

function percent(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function createMockStations() {
  const stagePlan = [
    ["Завершено", 43],
    ["Приемка", 12],
    ["СМР завершен", 16],
    ["СМР в работе", 28],
    ["Тендер СМР", 14],
    ["ПИР завершен", 10],
    ["ПИР в работе", 14],
    ["Тендер ПИР", 6],
    ["Ожидание", 316]
  ];

  const rows = [];
  let counter = 1;

  stagePlan.forEach(([stage, amount]) => {
    for (let i = 0; i < amount; i += 1) {
      const region = regions[(counter + i) % regions.length];
      const status = stage === "Завершено" ? "done" : stage === "Ожидание" ? "wait" : "active";
      const planAmount = status === "wait" ? 0 : 55 + ((counter * 17) % 140);
      const contractAmount = status === "wait" ? 0 : Math.max(30, planAmount - 4 - ((counter * 7) % 24));
      const factAmount = ["Завершено", "Приемка", "СМР завершен", "СМР в работе"].includes(stage)
        ? Math.max(25, contractAmount + (((counter % 9) - 4) * 2))
        : 0;
      const startOffset = -250 + ((counter * 11) % 240);
      const planStart = status === "wait" ? "" : toIso(dateAdd(TODAY, startOffset));
      const planFinish = status === "wait" ? "" : toIso(dateAdd(TODAY, startOffset + 70 + (counter % 45)));
      const actualStart = ["Тендер ПИР", "Ожидание"].includes(stage) ? "" : toIso(dateAdd(new Date(planStart), (counter % 7) - 3));
      const isDone = stage === "Завершено";
      const actualFinish = isDone ? toIso(dateAdd(new Date(planFinish), (counter % 17) - 8)) : "";
      const delayDays = calculateDelay(status, planFinish, actualFinish, actualStart);
      const finalEconomy = planAmount - factAmount;
      const contractDelta = contractAmount - factAmount;
      const readiness = stageMeta[stage].weight + (stage === "СМР в работе" ? (counter % 12) : 0);
      const hasOverrun = contractDelta < 0 || finalEconomy < 0;
      const risk = delayDays > 0 ? "Есть отставание" : hasOverrun ? "Есть перерасход" : risks[counter % risks.length];

      rows.push({
        stationId: `AMS-${String(counter).padStart(3, "0")}`,
        name: `АМС ${region[2][counter % region[2].length]}-${String(100 + counter)}`,
        region: region[0],
        area: region[1],
        locality: region[2][counter % region[2].length],
        address: `${region[2][counter % region[2].length]}, промышленная зона ${1 + (counter % 9)}`,
        type: types[counter % types.length],
        status,
        stage,
        programYear: 2024 + (counter % 3),
        pirTenderDate: status === "wait" ? "" : toIso(dateAdd(TODAY, -330 + counter)),
        pirWinner: status === "wait" ? "" : designers[counter % designers.length],
        pirContractAmount: status === "wait" ? 0 : 7 + (counter % 12),
        pirFinishDate: ["Ожидание", "Тендер ПИР", "ПИР в работе"].includes(stage) ? "" : toIso(dateAdd(TODAY, -145 + counter)),
        smrTenderDate: ["Ожидание", "Тендер ПИР", "ПИР в работе", "ПИР завершен"].includes(stage) ? "" : toIso(dateAdd(TODAY, -110 + counter)),
        contractor: ["Ожидание", "Тендер ПИР", "ПИР в работе", "ПИР завершен", "Тендер СМР"].includes(stage) ? "" : contractors[counter % contractors.length],
        planAmount,
        contractAmount,
        factAmount,
        economyToPlan: planAmount - contractAmount,
        finalEconomy,
        contractDelta,
        planStart,
        planFinish,
        actualStart,
        actualFinish,
        planDays: daysBetween(planStart, planFinish),
        actualDays: actualStart ? daysBetween(actualStart, actualFinish || TODAY) : 0,
        delayDays,
        readiness: Math.min(100, readiness),
        comment: status === "wait" ? "Станция ожидает включения в тендерный план." : "Данные рассчитаны по демонстрационному реестру.",
        responsible: ["А. Нурланов", "Д. Ибраева", "С. Ахметов", "М. Ким"][counter % 4],
        risk
      });
      counter += 1;
    }
  });

  return rows.slice(0, TOTAL_STATIONS);
}

function calculateDelay(status, planFinish, actualFinish, actualStart) {
  if (!planFinish) return 0;
  const baseDate = status === "done" && actualFinish ? new Date(actualFinish) : TODAY;
  if (status !== "done" && !actualStart) return 0;
  return Math.max(0, daysBetween(planFinish, baseDate));
}

function initFilters() {
  fillSelect("status-filter", [["all", "Все"], ...Object.entries(statuses).map(([key, item]) => [key, item.label])]);
  fillSelect("stage-filter", [["all", "Все"], ...Object.keys(stageMeta).map(value => [value, value])]);
  fillSelect("region-filter", makeOptions(stations.map(item => item.region)));
  fillSelect("area-filter", makeOptions(stations.map(item => item.area)));
  fillSelect("type-filter", makeOptions(stations.map(item => item.type)));
  fillSelect("contractor-filter", makeOptions(stations.map(item => item.contractor).filter(Boolean)));
  fillSelect("tender-year-filter", makeOptions(stations.map(item => item.programYear)));
}

function makeOptions(values) {
  return [["all", "Все"], ...Array.from(new Set(values)).sort().map(value => [String(value), String(value)])];
}

function fillSelect(id, options) {
  document.querySelector(`#${id}`).innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
}

function getFilters() {
  return {
    search: document.querySelector("#search-filter").value.trim().toLowerCase(),
    status: document.querySelector("#status-filter").value,
    stage: document.querySelector("#stage-filter").value,
    region: document.querySelector("#region-filter").value,
    area: document.querySelector("#area-filter").value,
    type: document.querySelector("#type-filter").value,
    contractor: document.querySelector("#contractor-filter").value,
    year: document.querySelector("#tender-year-filter").value,
    delay: document.querySelector("#delay-filter").checked,
    overrun: document.querySelector("#overrun-filter").checked
  };
}

function applyFilters() {
  const filter = getFilters();
  filteredStations = stations.filter(item => {
    const text = `${item.stationId} ${item.name} ${item.locality} ${item.area} ${item.contractor}`.toLowerCase();
    return (!filter.search || text.includes(filter.search))
      && (filter.status === "all" || item.status === filter.status)
      && (filter.stage === "all" || item.stage === filter.stage)
      && (filter.region === "all" || item.region === filter.region)
      && (filter.area === "all" || item.area === filter.area)
      && (filter.type === "all" || item.type === filter.type)
      && (filter.contractor === "all" || item.contractor === filter.contractor)
      && (filter.year === "all" || String(item.programYear) === filter.year)
      && (!filter.delay || item.delayDays > 0)
      && (!filter.overrun || item.contractDelta < 0 || item.finalEconomy < 0);
  });
  sortStations();
  renderAll();
}

function sortStations() {
  const direction = sortState.direction === "asc" ? 1 : -1;
  filteredStations.sort((a, b) => {
    const left = a[sortState.key];
    const right = b[sortState.key];
    if (typeof left === "number") return (left - right) * direction;
    return String(left).localeCompare(String(right), "ru") * direction;
  });
}

function renderAll() {
  renderKpis();
  renderFunnel();
  renderStatusDonut();
  renderTenderStats();
  renderRegionBars();
  renderMonthChart();
  renderTimelineChart();
  renderBudgetChart();
  renderProblemList();
  renderTable();
}

function getTotals(rows) {
  return rows.reduce((acc, item) => {
    acc.total += 1;
    acc[item.status] += 1;
    acc.plan += item.planAmount;
    acc.contract += item.contractAmount;
    acc.fact += item.factAmount;
    acc.economy += item.finalEconomy;
    acc.contractDelta += item.contractDelta;
    if (item.delayDays > 0) {
      acc.delayed += 1;
      acc.delaySum += item.delayDays;
    } else {
      acc.onTime += 1;
    }
    return acc;
  }, { total: 0, done: 0, active: 0, wait: 0, plan: 0, contract: 0, fact: 0, economy: 0, contractDelta: 0, delayed: 0, delaySum: 0, onTime: 0 });
}

function renderKpis() {
  const totals = getTotals(filteredStations);
  setText("kpi-total", formatNumber(totals.total));
  setText("kpi-done", formatNumber(totals.done));
  setText("kpi-active", formatNumber(totals.active));
  setText("kpi-wait", formatNumber(totals.wait));
  setText("kpi-done-share", `${percent(totals.done, totals.total)}% выполнения`);
  setText("kpi-active-share", `${percent(totals.active, totals.total)}% в работе`);
  setText("kpi-wait-share", `${percent(totals.wait, totals.total)}% ожидания`);
  setText("kpi-plan", formatBillions(totals.plan));
  setText("kpi-contract", formatBillions(totals.contract));
  setText("kpi-fact", formatBillions(totals.fact));
  setText("kpi-economy", formatBillions(totals.economy));
  setText("kpi-contract-delta", `${formatMoney(totals.contractDelta)} отклонение от договора`);
  setText("kpi-delayed", formatNumber(totals.delayed));
  setText("kpi-average-delay", `${totals.delayed ? Math.round(totals.delaySum / totals.delayed) : 0} дней среднее отставание`);
  setText("kpi-on-time", formatNumber(totals.onTime));
  setText("filtered-count", `${formatNumber(totals.total)} станций`);
}

function renderFunnel() {
  const max = Math.max(...Object.keys(stageMeta).map(stage => countBy(filteredStations, "stage", stage)), 1);
  document.querySelector("#funnel").innerHTML = Object.entries(stageMeta).map(([stage, meta]) => {
    const count = countBy(filteredStations, "stage", stage);
    return `<div class="funnel-row">
      <strong>${stage}</strong>
      <div class="track"><span style="width:${percent(count, max)}%; background:${meta.color}"></span></div>
      <span>${formatNumber(count)}</span>
    </div>`;
  }).join("");
}

function renderStatusDonut() {
  const totals = getTotals(filteredStations);
  let start = 0;
  const gradient = Object.entries(statuses).map(([key, item]) => {
    const share = totals.total ? (totals[key] / totals.total) * 100 : 0;
    const segment = `${item.color} ${start}% ${start + share}%`;
    start += share;
    return segment;
  }).join(", ");
  document.querySelector("#status-donut").style.background = `conic-gradient(${gradient || "#edf0f3 0 100%"})`;
  document.querySelector("#status-legend").innerHTML = Object.entries(statuses).map(([key, item]) => (
    `<div class="legend-item"><span><i style="background:${item.color}"></i>${item.label}</span><strong>${formatNumber(totals[key])}</strong></div>`
  )).join("");
}

function renderTenderStats() {
  const pirTender = countStage(["Тендер ПИР"]);
  const pirDone = filteredStations.filter(item => item.pirFinishDate).length;
  const smrTender = countStage(["Тендер СМР"]);
  const smrActive = countStage(["СМР в работе"]);
  const smrDone = countStage(["СМР завершен", "Приемка", "Завершено"]);
  const avgDiff = filteredStations.filter(item => item.contractAmount).reduce((sum, item) => sum + item.economyToPlan, 0) / Math.max(1, filteredStations.filter(item => item.contractAmount).length);
  const stats = [
    ["На тендере ПИР", pirTender],
    ["ПИР завершен", pirDone],
    ["На тендере СМР", smrTender],
    ["СМР в работе", smrActive],
    ["СМР завершен", smrDone],
    ["Средняя разница план-договор", `${Math.round(avgDiff)} млн ₸`]
  ];
  document.querySelector("#tender-stats").innerHTML = stats.map(([label, value]) => `<div class="mini-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderRegionBars() {
  const grouped = groupBy(filteredStations, "area");
  const rows = Object.entries(grouped).map(([area, rows]) => ({ area, total: rows.length, done: countBy(rows, "status", "done") }))
    .sort((a, b) => b.total - a.total).slice(0, 8);
  document.querySelector("#region-bars").innerHTML = rows.map(item => {
    const doneShare = percent(item.done, item.total);
    return `<div class="bar-row">
      <div class="bar-row-top"><strong>${item.area}</strong><span>${item.done}/${item.total}</span></div>
      <div class="bar"><span style="width:${doneShare}%; background:var(--green)"></span></div>
    </div>`;
  }).join("") || emptyState("Нет данных");
}

function renderMonthChart() {
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  const counts = Array(12).fill(0);
  filteredStations.forEach(item => {
    if (item.actualFinish) counts[new Date(item.actualFinish).getMonth()] += 1;
  });
  const max = Math.max(...counts, 1);
  document.querySelector("#month-chart").innerHTML = counts.map((count, index) => `<div class="chart-col">
    <div class="chart-bar fact" title="${count}" style="height:${Math.max(4, percent(count, max) * 1.8)}px"></div>
    <span>${months[index]}</span>
  </div>`).join("");
}

function renderTimelineChart() {
  const buckets = [
    ["до 30", item => item.actualDays <= 30],
    ["31-60", item => item.actualDays > 30 && item.actualDays <= 60],
    ["61-90", item => item.actualDays > 60 && item.actualDays <= 90],
    ["90+", item => item.actualDays > 90]
  ];
  const counts = buckets.map(([, fn]) => filteredStations.filter(item => item.actualDays && fn(item)).length);
  const max = Math.max(...counts, 1);
  document.querySelector("#timeline-chart").innerHTML = buckets.map(([label], index) => `<div class="chart-col">
    <div class="chart-bar" title="${counts[index]}" style="height:${Math.max(4, percent(counts[index], max) * 1.8)}px"></div>
    <span>${label}</span>
  </div>`).join("");
}

function renderBudgetChart() {
  const totals = getTotals(filteredStations);
  const rows = [
    ["План", totals.plan, "var(--blue)"],
    ["Договор", totals.contract, "var(--violet)"],
    ["Факт", totals.fact, "var(--green)"],
    ["Экономия", Math.max(0, totals.economy), "var(--yellow)"]
  ];
  const max = Math.max(...rows.map(row => row[1]), 1);
  document.querySelector("#budget-chart").innerHTML = rows.map(([label, value, color]) => `<div class="budget-row">
    <strong>${label}</strong>
    <div class="bar"><span style="width:${percent(value, max)}%; background:${color}"></span></div>
    <span>${formatBillions(value)} млрд</span>
  </div>`).join("");
}

function renderProblemList() {
  const rows = filteredStations
    .filter(item => item.delayDays > 0 || item.contractDelta < 0 || !item.contractor || !item.actualStart || !item.factAmount || !item.planFinish)
    .sort((a, b) => b.delayDays - a.delayDays)
    .slice(0, 8);
  document.querySelector("#problem-list").innerHTML = rows.map(item => `<div class="problem-item">
    <button type="button" data-id="${item.stationId}">${item.stationId} ${item.name}</button>
    <span>${item.delayDays > 0 ? `${item.delayDays} дн.` : item.risk}</span>
  </div>`).join("") || emptyState("Нет проблемных станций");
}

function renderTable() {
  document.querySelector("#stations-table").innerHTML = filteredStations.map(item => {
    const scheduleClass = item.delayDays > 0 ? "bad" : "done";
    return `<tr>
      <td><button class="station-link" type="button" data-id="${item.stationId}">${item.stationId}</button></td>
      <td>${item.name}</td>
      <td>${item.region}</td>
      <td>${item.area}</td>
      <td>${item.locality}</td>
      <td>${badge(statuses[item.status].label, statuses[item.status].className)}</td>
      <td>${badge(item.stage, item.stage.includes("Тендер") ? "tender" : item.status === "wait" ? "wait" : "active")}</td>
      <td>${item.contractor || "Нет"}</td>
      <td>${formatMoney(item.planAmount)}</td>
      <td>${formatMoney(item.contractAmount)}</td>
      <td>${formatMoney(item.factAmount)}</td>
      <td>${formatMoney(item.finalEconomy)}</td>
      <td>${badge(item.delayDays > 0 ? `${item.delayDays} дн.` : "В норме", scheduleClass)}</td>
      <td>${item.readiness}%</td>
    </tr>`;
  }).join("");
}

function badge(text, className) {
  return `<span class="badge ${className}">${text}</span>`;
}

function emptyState(text) {
  return `<p class="note">${text}</p>`;
}

function countStage(stageNames) {
  return filteredStations.filter(item => stageNames.includes(item.stage)).length;
}

function countBy(rows, key, value) {
  return rows.filter(item => item[key] === value).length;
}

function groupBy(rows, key) {
  return rows.reduce((acc, item) => {
    const group = item[key] || "Не указано";
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function showStation(id) {
  const item = stations.find(row => row.stationId === id);
  if (!item) return;
  document.querySelector("#dialog-title").textContent = `${item.stationId} · ${item.name}`;
  document.querySelector("#dialog-content").innerHTML = `
    ${detailCard("Общая информация", [`Регион: ${item.region}`, `Область: ${item.area}`, `Населенный пункт: ${item.locality}`, `Адрес: ${item.address}`, `Тип станции: ${item.type}`])}
    ${detailCard("История этапов", [`Текущий статус: ${statuses[item.status].label}`, `Этап: ${item.stage}`, `Год включения: ${item.programYear}`, `Готовность: ${item.readiness}%`])}
    ${detailCard("Финансы", [`Плановая сумма СМР: ${formatMoney(item.planAmount)}`, `Договорная сумма СМР: ${formatMoney(item.contractAmount)}`, `Фактическая сумма СМР: ${formatMoney(item.factAmount)}`, `Экономия к плану: ${formatMoney(item.economyToPlan)}`, `Отклонение от договора: ${formatMoney(item.contractDelta)}`])}
    ${detailCard("Сроки", [`План начала: ${item.planStart || "Нет"}`, `План завершения: ${item.planFinish || "Нет"}`, `Факт начала: ${item.actualStart || "Нет"}`, `Факт завершения: ${item.actualFinish || "Нет"}`, `Отставание: ${item.delayDays} дней`])}
    ${detailCard("Подрядчики", [`Проектировщик: ${item.pirWinner || "Нет"}`, `Подрядчик СМР: ${item.contractor || "Нет"}`, `Договор ПИР: ${formatMoney(item.pirContractAmount)}`])}
    ${detailCard("Документы и риски", [`Ответственный: ${item.responsible}`, `Комментарий: ${item.comment}`, `Риск/проблема: ${item.risk || "Нет"}`])}
  `;
  document.querySelector("#station-dialog").showModal();
}

function detailCard(title, lines) {
  return `<section class="detail-card"><h3>${title}</h3>${lines.map(line => `<p>${line}</p>`).join("")}</section>`;
}

function exportCsv() {
  const headers = ["ID станции", "Наименование станции", "Регион", "Область", "Населенный пункт", "Адрес", "Текущий статус", "Текущий этап", "Год включения", "Дата тендера ПИР", "Победитель ПИР", "Сумма договора ПИР", "Дата завершения ПИР", "Дата тендера СМР", "Подрядчик СМР", "Плановая сумма СМР", "Договорная сумма СМР", "Фактическая сумма СМР", "Экономия", "Плановая дата начала", "Плановая дата завершения", "Фактическая дата начала", "Фактическая дата завершения", "Дней по плану", "Фактически затрачено дней", "Отставание в днях", "Процент готовности", "Комментарий", "Ответственный сотрудник", "Риск/проблема"];
  const rows = filteredStations.map(item => [item.stationId, item.name, item.region, item.area, item.locality, item.address, statuses[item.status].label, item.stage, item.programYear, item.pirTenderDate, item.pirWinner, item.pirContractAmount, item.pirFinishDate, item.smrTenderDate, item.contractor, item.planAmount, item.contractAmount, item.factAmount, item.finalEconomy, item.planStart, item.planFinish, item.actualStart, item.actualFinish, item.planDays, item.actualDays, item.delayDays, item.readiness, item.comment, item.responsible, item.risk]);
  const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ams-capital-repair-dashboard.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function parseUpload(file) {
  if (file.name.toLowerCase().endsWith(".xlsx")) {
    if (!window.XLSX) {
      document.querySelector("#upload-note").textContent = "Не удалось загрузить модуль Excel. Повторите попытку при наличии подключения к сети.";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = window.XLSX.read(reader.result, { type: "array", cellDates: false });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: "" });
        if (rows.length < 2) throw new Error("В книге нет строк данных");
        stations = rows.slice(1).map((row, index) => normalizeUploadedRow(row, index)).filter(Boolean);
        initFilters();
        applyFilters();
        document.querySelector("#upload-note").textContent = `Загружено строк из Excel: ${stations.length}. KPI и графики пересчитаны.`;
      } catch (error) {
        document.querySelector("#upload-note").textContent = `Не удалось прочитать Excel: ${error.message}`;
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result);
    const delimiter = text.includes(";") ? ";" : text.includes("\t") ? "\t" : ",";
    const lines = text.split(/\r?\n/).filter(Boolean).map(line => line.split(delimiter).map(cell => cell.replace(/^"|"$/g, "").replace(/""/g, '"')));
    if (lines.length < 2) return;
    stations = lines.slice(1).map((row, index) => normalizeUploadedRow(row, index)).filter(Boolean);
    initFilters();
    applyFilters();
    document.querySelector("#upload-note").textContent = `Загружено строк: ${stations.length}. KPI и графики пересчитаны.`;
  };
  reader.readAsText(file, "utf-8");
}

function normalizeUploadedRow(row, index) {
  const statusLabel = row[6] || "В ожидании";
  const status = statusLabel.includes("Выполн") ? "done" : statusLabel.includes("работ") ? "active" : "wait";
  const stage = row[7] && stageMeta[row[7]] ? row[7] : status === "done" ? "Завершено" : status === "active" ? "СМР в работе" : "Ожидание";
  const planAmount = Number(row[15]) || 0;
  const contractAmount = Number(row[16]) || 0;
  const factAmount = Number(row[17]) || 0;
  const planFinish = row[20] || "";
  const actualFinish = row[22] || "";
  const actualStart = row[21] || "";
  return {
    stationId: row[0] || `AMS-UP-${index + 1}`,
    name: row[1] || "АМС",
    region: row[2] || "Не указано",
    area: row[3] || "Не указано",
    locality: row[4] || "",
    address: row[5] || "",
    type: "Макро",
    status,
    stage,
    programYear: Number(row[8]) || 2026,
    pirTenderDate: row[9] || "",
    pirWinner: row[10] || "",
    pirContractAmount: Number(row[11]) || 0,
    pirFinishDate: row[12] || "",
    smrTenderDate: row[13] || "",
    contractor: row[14] || "",
    planAmount,
    contractAmount,
    factAmount,
    economyToPlan: planAmount - contractAmount,
    finalEconomy: planAmount - factAmount,
    contractDelta: contractAmount - factAmount,
    planStart: row[19] || "",
    planFinish,
    actualStart,
    actualFinish,
    planDays: Number(row[23]) || daysBetween(row[19], planFinish),
    actualDays: Number(row[24]) || (actualStart ? daysBetween(actualStart, actualFinish || TODAY) : 0),
    delayDays: Number(row[25]) || calculateDelay(status, planFinish, actualFinish, actualStart),
    readiness: Number(row[26]) || stageMeta[stage].weight,
    comment: row[27] || "",
    responsible: row[28] || "",
    risk: row[29] || ""
  };
}

function bindEvents() {
  ["search-filter", "status-filter", "stage-filter", "region-filter", "area-filter", "type-filter", "contractor-filter", "tender-year-filter", "delay-filter", "overrun-filter"].forEach(id => {
    document.querySelector(`#${id}`).addEventListener("input", applyFilters);
  });
  document.querySelector("#reset-filters").addEventListener("click", () => {
    document.querySelectorAll(".filters-panel input").forEach(input => {
      if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });
    document.querySelectorAll(".filters-panel select").forEach(select => select.value = "all");
    applyFilters();
  });
  document.querySelector("#export-button").addEventListener("click", exportCsv);
  document.querySelector("#file-input").addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) parseUpload(file);
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-id]");
    if (button) showStation(button.dataset.id);
    const sortButton = event.target.closest(".sort-button");
    if (sortButton) {
      const key = sortButton.dataset.sort;
      sortState.direction = sortState.key === key && sortState.direction === "asc" ? "desc" : "asc";
      sortState.key = key;
      applyFilters();
    }
  });
  document.querySelector("#close-dialog").addEventListener("click", () => document.querySelector("#station-dialog").close());
}

initFilters();
bindEvents();
applyFilters();
