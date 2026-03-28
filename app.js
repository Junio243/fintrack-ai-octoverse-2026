// ============================================================
// FinTrack AI · app.js  — Full Implementation
// Octoverse Hackathon 2024
// ============================================================

'use strict';

// ─── 1. Constants & Config ─────────────────────────────────
const STORAGE_KEYS = {
  TRANSACTIONS: 'fintrack_transactions_v2',
  GOAL: 'fintrack_monthly_goal',
  CURRENT_VIEW: 'fintrack_current_view',
  DARK_MODE: 'fintrack_dark_mode',
};

const CATEGORY_CONFIG = {
  'Alimentação': { emoji: '🍽', color: 'rgba(0, 108, 82, 0.7)',   bg: 'rgba(143, 246, 208, 0.35)', text: '#007257'  },
  'Transporte':  { emoji: '🚗', color: 'rgba(118, 89, 51, 0.7)',  bg: 'rgba(255, 222, 183, 0.35)', text: '#7d6039'  },
  'Lazer':       { emoji: '🎮', color: 'rgba(46, 99, 133, 0.7)',  bg: 'rgba(202, 231, 255, 0.35)', text: '#356a8c'  },
  'Saúde':       { emoji: '❤️', color: 'rgba(186, 26, 26, 0.7)',  bg: 'rgba(255, 218, 214, 0.35)', text: '#93000a'  },
  'Serviços':    { emoji: '⚡', color: 'rgba(70, 85, 140, 0.7)',  bg: 'rgba(220, 225, 255, 0.35)', text: '#4e5fac'  },
  'Moradia':     { emoji: '🏠', color: 'rgba(46, 133, 90, 0.7)',  bg: 'rgba(160, 240, 200, 0.35)', text: '#1a6b45'  },
  'Outros':      { emoji: '📦', color: 'rgba(114, 120, 118, 0.7)', bg: 'rgba(225, 227, 228, 0.35)', text: '#424846' },
};

// ─── 2. State ───────────────────────────────────────────────
let state = {
  transactions: [],
  monthlyGoal: null,
  currentView: 'dashboard',
  searchQuery: '',
  txSearchQuery: '',
  txCatFilter: '',
  txSort: 'date-desc',
  charts: {
    spending: null,
    report: null,
    bar: null,
  },
};

// ─── 3. Load from localStorage ──────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    state.transactions = raw ? JSON.parse(raw) : [];
  } catch { state.transactions = []; }

  const goal = localStorage.getItem(STORAGE_KEYS.GOAL);
  state.monthlyGoal = goal ? parseFloat(goal) : null;

  const savedView = localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW);
  if (savedView) state.currentView = savedView;
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
}

function saveGoal(val) {
  state.monthlyGoal = val;
  if (val !== null) {
    localStorage.setItem(STORAGE_KEYS.GOAL, val.toString());
  } else {
    localStorage.removeItem(STORAGE_KEYS.GOAL);
  }
}

// ─── 4. DOM References ──────────────────────────────────────
const $= (id) => document.getElementById(id);
const $$= (sel) => document.querySelectorAll(sel);

const dom = {
  form:              $('transaction-form'),
  descInput:         $('desc-input'),
  valInput:          $('val-input'),
  catInput:          $('cat-input'),
  dateInput:         $('date-input'),
  descError:         $('desc-error'),
  valError:          $('val-error'),

  summaryTotal:      $('summary-total'),
  summaryLider:      $('summary-lider'),
  summaryCount:      $('summary-count'),
  summaryTicket:     $('summary-ticket'),
  periodLabel:       $('period-label'),
  goalProgressBar:   $('goal-progress-bar'),
  goalPercentLabel:  $('goal-percent-label'),
  goalSubLabel:      $('goal-sub-label'),

  transactionList:   $('transaction-list'),
  emptyState:        $('empty-state'),
  txCountBadge:      $('tx-count-badge'),

  txFullList:        $('tx-full-list'),
  txEmptyState:      $('tx-empty-state'),
  txResultCount:     $('tx-result-count'),
  txSearchInput:     $('tx-search-input'),
  txCatFilter:       $('tx-cat-filter'),
  txSort:            $('tx-sort'),

  aiInsightsText:    $('ai-insights-text'),
  insightsContainer: $('insights-container'),
  insightsEmpty:     $('insights-empty'),

  chartContainer:    $('chart-container'),
  chartEmptyState:   $('chart-empty-state'),
  spendingChart:     $('spending-chart'),

  reportChartContainer: $('report-chart-container'),
  reportChartEmpty:  $('report-chart-empty'),
  barChartContainer: $('bar-chart-container'),
  barChartEmpty:     $('bar-chart-empty'),
  statMax:           $('stat-max'),
  statMin:           $('stat-min'),
  statDaily:         $('stat-daily'),
  statCats:          $('stat-cats'),

  settingsGoalInput: $('settings-goal-input'),
  settingsGoalStatus:$('settings-goal-status'),

  clearAllBtn:       $('clear-all-btn'),
  loadDemoBtn:       $('load-demo-btn'),
  heroDemoBtn:       $('hero-demo-btn'),
  heroStartBtn:      $('hero-start-btn'),
  ctaBtn:            $('cta-btn'),
  setGoalBtn:        $('set-goal-btn'),
  searchInput:       $('search-input'),

  toastContainer:    $('toast-container'),

  goalModal:         $('goal-modal'),
  goalInput:         $('goal-input'),
  saveGoalBtn:       $('save-goal-btn'),
  closeGoalModal:    $('close-goal-modal'),

  confirmModal:      $('confirm-modal'),
  confirmTitle:      $('confirm-title'),
  confirmMessage:    $('confirm-message'),
  confirmCancel:     $('confirm-cancel'),
  confirmOk:         $('confirm-ok'),

  sidebar:           $('sidebar'),
  mobileMenuBtn:     $('mobile-menu-btn'),
  mobileOverlay:     $('mobile-overlay'),

  exportBtn:         $('export-btn'),
  settingsClearBtn:  $('settings-clear-btn'),
  settingsSaveGoal:  $('settings-save-goal'),
};

// ─── 5. Utilities ───────────────────────────────────────────
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

function formatDateFull(dateString) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
}

function getPeriodLabel() {
  const now = new Date();
  return `Período: ${now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── 6. Toast Notifications ─────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="material-symbols-outlined fill-icon" style="font-size:18px">${icons[type]}</span><span>${message}</span>`;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── 7. Confirm Modal ───────────────────────────────────────
let _confirmResolve = null;

function showConfirm(title, message) {
  return new Promise((resolve) => {
    _confirmResolve = resolve;
    dom.confirmTitle.textContent = title;
    dom.confirmMessage.textContent = message;
    dom.confirmModal.classList.add('open');
  });
}

dom.confirmCancel.addEventListener('click', () => {
  dom.confirmModal.classList.remove('open');
  if (_confirmResolve) _confirmResolve(false);
});

dom.confirmOk.addEventListener('click', () => {
  dom.confirmModal.classList.remove('open');
  if (_confirmResolve) _confirmResolve(true);
});

dom.confirmModal.addEventListener('click', (e) => {
  if (e.target === dom.confirmModal) {
    dom.confirmModal.classList.remove('open');
    if (_confirmResolve) _confirmResolve(false);
  }
});

// ─── 8. Goal Modal ──────────────────────────────────────────
dom.setGoalBtn.addEventListener('click', () => {
  dom.goalInput.value = state.monthlyGoal ?? '';
  dom.goalModal.classList.add('open');
  setTimeout(() => dom.goalInput.focus(), 100);
});

dom.closeGoalModal.addEventListener('click', () => dom.goalModal.classList.remove('open'));

dom.goalModal.addEventListener('click', (e) => {
  if (e.target === dom.goalModal) dom.goalModal.classList.remove('open');
});

dom.saveGoalBtn.addEventListener('click', () => {
  const val = parseFloat(dom.goalInput.value);
  if (isNaN(val) || val <= 0) {
    showToast('Insira um valor de meta válido.', 'error');
    return;
  }
  saveGoal(val);
  dom.goalModal.classList.remove('open');
  updateSummary();
  updateSettingsView();
  showToast(`Meta definida: ${formatCurrency(val)}`, 'success');
});

// ─── 9. Navigation / Views ──────────────────────────────────
function navigateTo(view) {
  state.currentView = view;
  localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Show target view
  const viewEl = $(`view-${view}`);
  if (viewEl) {
    viewEl.classList.add('active');
    // Re-trigger animation
    viewEl.style.animation = 'none';
    viewEl.offsetHeight; // reflow
    viewEl.style.animation = '';
  }

  // Update sidebar nav items
  document.querySelectorAll('.nav-item').forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.classList.toggle('fill-icon', isActive);
  });

  // Update top nav links
  document.querySelectorAll('.nav-link').forEach(a => {
    const isActive = a.dataset.view === view;
    a.classList.toggle('text-primary', isActive);
    a.classList.toggle('border-b-2', isActive);
    a.classList.toggle('border-primary', isActive);
    a.classList.toggle('pb-1', isActive);
    a.classList.toggle('text-on-surface-variant', !isActive);
  });

  // Close mobile sidebar
  closeMobileSidebar();

  // Trigger view-specific render
  if (view === 'reports') renderReports();
  if (view === 'insights') renderInsights();
  if (view === 'settings') updateSettingsView();
  if (view === 'transactions') renderTxList();
}

// Navigation click handlers (sidebar buttons)
document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.view));
});

// Top nav links
document.querySelectorAll('.nav-link[data-view]').forEach(a => {
  a.addEventListener('click', (e) => { e.preventDefault(); navigateTo(a.dataset.view); });
});

// ─── 10. Mobile Sidebar ─────────────────────────────────────
function openMobileSidebar() {
  dom.sidebar.classList.add('translate-x-0');
  dom.sidebar.classList.remove('-translate-x-full');
  dom.mobileOverlay.classList.remove('hidden');
}

function closeMobileSidebar() {
  dom.sidebar.classList.remove('translate-x-0');
  dom.sidebar.classList.add('-translate-x-full');
  dom.mobileOverlay.classList.add('hidden');
}

dom.mobileMenuBtn.addEventListener('click', openMobileSidebar);
dom.mobileOverlay.addEventListener('click', closeMobileSidebar);

// ─── 11. Form Validation & Submission ───────────────────────
function validateForm() {
  let valid = true;
  const desc = dom.descInput.value.trim();
  const val = parseFloat(dom.valInput.value);

  dom.descError.classList.toggle('hidden', !!desc);
  dom.valError.classList.toggle('hidden', !isNaN(val) && val > 0);

  if (!desc) valid = false;
  if (isNaN(val) || val <= 0) valid = false;

  return valid;
}

dom.form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const desc = dom.descInput.value.trim();
  const val = parseFloat(dom.valInput.value);
  const cat = dom.catInput.value;
  const dateVal = dom.dateInput.value;
  const date = dateVal ? new Date(dateVal + 'T12:00:00').toISOString() : new Date().toISOString();

  const tx = { id: generateId(), description: desc, value: val, category: cat, date };
  state.transactions.push(tx);
  updateUI();

  dom.form.reset();
  setDateInputDefault();
  dom.descInput.focus();
  showToast(`${formatCurrency(val)} adicionado com sucesso!`, 'success');
});

// Clear validation errors on input
dom.descInput.addEventListener('input', () => dom.descError.classList.add('hidden'));
dom.valInput.addEventListener('input', () => dom.valError.classList.add('hidden'));

// ─── 12. Summary & Metrics ──────────────────────────────────
function getCategoryTotals() {
  const totals = {};
  state.transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.value;
  });
  return totals;
}

function getLeaderCategory(categoryTotals) {
  let leader = null, maxAmt = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > maxAmt) { maxAmt = amt; leader = cat; }
  }
  return leader;
}

function updateSummary() {
  dom.periodLabel.textContent = getPeriodLabel();

  if (state.transactions.length === 0) {
    dom.summaryTotal.textContent = 'R$ 0,00';
    dom.summaryLider.textContent = '—';
    dom.summaryCount.textContent = '0';
    dom.summaryTicket.textContent = 'R$ 0,00';
    dom.goalPercentLabel.textContent = '—';
    dom.goalProgressBar.style.width = '0%';
    dom.goalProgressBar.className = 'h-full progress-bar-fill rounded-full';
    dom.goalSubLabel.textContent = state.monthlyGoal
      ? `Meta: ${formatCurrency(state.monthlyGoal)}`
      : 'Defina uma meta para acompanhar seu progresso';
    updateAIInsightsSidebar();
    return;
  }

  const total = state.transactions.reduce((a, t) => a + t.value, 0);
  const count = state.transactions.length;
  const ticket = total / count;
  const categoryTotals = getCategoryTotals();
  const leader = getLeaderCategory(categoryTotals);

  dom.summaryTotal.textContent = formatCurrency(total);
  dom.summaryLider.textContent = leader
    ? `${CATEGORY_CONFIG[leader]?.emoji ?? ''} ${leader}`
    : '—';
  dom.summaryCount.textContent = count;
  dom.summaryTicket.textContent = formatCurrency(ticket);

  // Goal progress
  if (state.monthlyGoal && state.monthlyGoal > 0) {
    const pct = Math.min((total / state.monthlyGoal) * 100, 100);
    dom.goalPercentLabel.textContent = `${pct.toFixed(0)}%`;
    dom.goalProgressBar.style.width = `${pct}%`;
    dom.goalProgressBar.className = 'h-full progress-bar-fill rounded-full';
    if (pct >= 90) dom.goalProgressBar.classList.add('danger');
    else if (pct >= 70) dom.goalProgressBar.classList.add('warning');
    dom.goalSubLabel.textContent = pct >= 100
      ? `⚠️ Meta atingida! (${formatCurrency(total)} / ${formatCurrency(state.monthlyGoal)})`
      : `${formatCurrency(total)} de ${formatCurrency(state.monthlyGoal)}`;
  } else {
    dom.goalPercentLabel.textContent = '—';
    dom.goalProgressBar.style.width = '0%';
    dom.goalSubLabel.textContent = 'Clique em 🏳 para definir uma meta mensal';
  }

  updateAIInsightsSidebar();
}

// ─── 13. AI Insights Sidebar ────────────────────────────────
const AI_TEMPLATES = {
  'Alimentação': (total) => `Alimentação lidera seus gastos com ${formatCurrency(total)} acumulados. 💡 Compras programadas no mercado reduzem até 30% dos gastos com alimentação.`,
  'Lazer':       (total) => `Lazer representa seu maior centro de custo (${formatCurrency(total)}). 🎯 Reserve até 15% da renda para lazer — acima disso, pode comprometer suas metas.`,
  'Transporte':  (total) => `Transporte é sua despesa líder. 🚗 Avalie pacotes de mobilidade ou caronas — podem reduzir este custo em até 40%.`,
  'Moradia':     (total) => `Moradia lidera — despesa fixa e previsível. 🏠 Foco em eficiência energética e renegociação de contratos pode liberar margem.`,
  'Serviços':    (total) => `Serviços lideram com ${formatCurrency(total)}. 📋 Revise assinaturas: usuários médios desperdiçam R$ 150/mês em planos não utilizados.`,
  'Saúde':       (total) => `Saúde é prioridade — ${formatCurrency(total)} bem investidos! 💚 Verifique se um plano de saúde seria mais econômico que consultas avulsas.`,
  'Outros':      (total, netTotal) => netTotal > 1000 ? `Gastos variados acima dos R$ 1.000. 🔍 Categorize melhor suas despesas para obter insights mais precisos.` : `Padrão estável. Continue categorizando para análises mais profundas.`,
};

function updateAIInsightsSidebar() {
  if (state.transactions.length === 0) {
    animateText(dom.aiInsightsText, 'Adicione algumas transações para que a IA analise seu padrão de gastos.');
    return;
  }

  const total = state.transactions.reduce((a, t) => a + t.value, 0);
  const categoryTotals = getCategoryTotals();
  const leader = getLeaderCategory(categoryTotals);

  const template = AI_TEMPLATES[leader] || AI_TEMPLATES['Outros'];
  const text = template(categoryTotals[leader] || 0, total);
  animateText(dom.aiInsightsText, text);
}

function animateText(el, text) {
  el.classList.add('updating');
  setTimeout(() => {
    el.textContent = text;
    el.classList.remove('updating');
  }, 250);
}

// ─── 14. Transaction Table ──────────────────────────────────
function makeCatBadge(category) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Outros'];
  return `<span class="cat-badge" style="background:${cfg.bg};color:${cfg.text}">${cfg.emoji} ${category}</span>`;
}

function renderTable() {
  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const query = state.searchQuery.toLowerCase();
  const filtered = query
    ? sorted.filter(t => t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
    : sorted;

  dom.transactionList.innerHTML = '';

  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    dom.txCountBadge.classList.add('hidden');
  } else {
    dom.emptyState.classList.add('hidden');
    dom.txCountBadge.classList.remove('hidden');
    dom.txCountBadge.textContent = filtered.length;
  }

  filtered.slice(0, 10).forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.className = 'group hover:bg-primary/[0.035] transition-colors animate-fade-in';
    tr.style.animationDelay = `${i * 0.04}s`;
    tr.innerHTML = `
      <td class="px-7 py-4 text-sm text-on-surface-variant font-label whitespace-nowrap">${formatDate(t.date)}</td>
      <td class="px-7 py-4 font-medium text-on-surface">${escapeHtml(t.description)}</td>
      <td class="px-7 py-4">${makeCatBadge(t.category)}</td>
      <td class="px-7 py-4 text-right font-headline italic text-on-surface whitespace-nowrap">${formatCurrency(t.value)}</td>
      <td class="px-4 py-4">
        <button data-id="${t.id}" class="delete-btn w-7 h-7 rounded-full hover:bg-error-container flex items-center justify-center transition-colors group" title="Remover">
          <span class="material-symbols-outlined text-outline group-hover:text-error transition-colors" style="font-size:15px">delete</span>
        </button>
      </td>
    `;
    dom.transactionList.appendChild(tr);
  });

  // Show "see more" if needed
  if (filtered.length > 10) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="px-7 py-4 text-center">
      <button data-view="transactions" class="nav-item text-xs font-label text-primary hover:underline flex items-center gap-1 mx-auto">
        Ver todos os ${filtered.length} lançamentos <span class="material-symbols-outlined" style="font-size:14px">arrow_forward</span>
      </button></td>`;
    tr.querySelector('[data-view]').addEventListener('click', () => navigateTo('transactions'));
    dom.transactionList.appendChild(tr);
  }

  // Delete row event
  dom.transactionList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const tx = state.transactions.find(t => t.id === id);
      const confirmed = await showConfirm('Remover lançamento', `Deseja remover "${tx?.description}"?`);
      if (confirmed) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        updateUI();
        showToast('Transação removida.', 'info');
      }
    });
  });
}

// ─── 15. Full Transaction List (view-transactions) ──────────
function renderTxList() {
  const query = dom.txSearchInput.value.toLowerCase();
  const catFilter = dom.txCatFilter.value;
  const sort = dom.txSort.value;

  let list = [...state.transactions];
  if (query) list = list.filter(t => t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
  if (catFilter) list = list.filter(t => t.category === catFilter);

  list.sort((a, b) => {
    switch (sort) {
      case 'date-asc':  return new Date(a.date) - new Date(b.date);
      case 'val-desc':  return b.value - a.value;
      case 'val-asc':   return a.value - b.value;
      default:          return new Date(b.date) - new Date(a.date);
    }
  });

  dom.txResultCount.textContent = `${list.length} ${list.length === 1 ? 'item' : 'itens'}`;
  dom.txFullList.innerHTML = '';

  if (list.length === 0) {
    dom.txEmptyState.classList.remove('hidden');
    return;
  }
  dom.txEmptyState.classList.add('hidden');

  list.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.className = 'group hover:bg-primary/[0.035] transition-colors animate-fade-in';
    tr.style.animationDelay = `${i * 0.02}s`;
    tr.innerHTML = `
      <td class="px-7 py-4 text-sm text-on-surface-variant font-label whitespace-nowrap">${formatDateFull(t.date)}</td>
      <td class="px-7 py-4 font-medium text-on-surface">${escapeHtml(t.description)}</td>
      <td class="px-7 py-4">${makeCatBadge(t.category)}</td>
      <td class="px-7 py-4 text-right font-headline italic text-on-surface whitespace-nowrap">${formatCurrency(t.value)}</td>
      <td class="px-4 py-4">
        <button data-id="${t.id}" class="delete-btn w-7 h-7 rounded-full hover:bg-error-container flex items-center justify-center transition-colors group" title="Remover">
          <span class="material-symbols-outlined text-outline group-hover:text-error transition-colors" style="font-size:15px">delete</span>
        </button>
      </td>
    `;
    dom.txFullList.appendChild(tr);
  });

  dom.txFullList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const tx = state.transactions.find(t => t.id === id);
      const confirmed = await showConfirm('Remover lançamento', `Deseja remover "${tx?.description}"?`);
      if (confirmed) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        updateUI();
        showToast('Transação removida.', 'info');
        renderTxList();
      }
    });
  });
}

// Filters event listeners
dom.txSearchInput?.addEventListener('input', renderTxList);
dom.txCatFilter?.addEventListener('change', renderTxList);
dom.txSort?.addEventListener('change', renderTxList);

// Dashboard search
dom.searchInput?.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  renderTable();
});

// ─── 16. Charts ─────────────────────────────────────────────
const CHART_PALETTE = Object.values(CATEGORY_CONFIG).map(c => c.color);

function buildChartData() {
  const totals = getCategoryTotals();
  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map(l => CATEGORY_CONFIG[l]?.color ?? 'rgba(114,120,118,0.7)');
  return { labels, data, colors };
}

function renderDashboardChart() {
  const { labels, data, colors } = buildChartData();
  const hasData = data.length > 0;

  dom.chartContainer.classList.toggle('hidden', !hasData);
  dom.chartEmptyState.classList.toggle('hidden', hasData);

  if (!hasData) {
    if (state.charts.spending) { state.charts.spending.destroy(); state.charts.spending = null; }
    return;
  }

  const chartData = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: colors.map(c => c.replace('0.7', '0.9')),
      borderWidth: 2,
      hoverOffset: 8,
    }]
  };

  if (state.charts.spending) {
    state.charts.spending.data = chartData;
    state.charts.spending.update('active');
    return;
  }

  state.charts.spending = new Chart(dom.spendingChart, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'Space Grotesk', size: 11 },
            color: '#424846',
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatCurrency(ctx.parsed)}`,
          },
          backgroundColor: 'rgba(255,255,255,0.9)',
          titleColor: '#191c1d',
          bodyColor: '#424846',
          borderColor: 'rgba(194,200,197,0.4)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          titleFont: { family: 'Newsreader', size: 14, style: 'italic' },
          bodyFont: { family: 'Manrope', size: 12 },
        }
      },
      animation: { animateRotate: true, duration: 600, easing: 'easeOutQuart' }
    }
  });
}

function renderReports() {
  const { labels, data, colors } = buildChartData();
  const hasData = data.length > 0;

  // Donut
  dom.reportChartContainer.classList.toggle('hidden', !hasData);
  dom.reportChartEmpty.classList.toggle('hidden', hasData);

  if (hasData) {
    const donutCanvas = $('report-donut-chart');
    if (state.charts.report) { state.charts.report.destroy(); state.charts.report = null; }
    state.charts.report = new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderColor: 'rgba(255,255,255,0.8)', borderWidth: 3, hoverOffset: 10 }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'right', labels: { font: { family: 'Space Grotesk', size: 11 }, color: '#424846', padding: 12, usePointStyle: true } },
          tooltip: {
            callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed)} (${((ctx.parsed / data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)` },
            backgroundColor: 'rgba(255,255,255,0.95)',
            titleColor: '#191c1d', bodyColor: '#424846',
            borderColor: 'rgba(194,200,197,0.4)', borderWidth: 1,
            padding: 12, cornerRadius: 12,
          }
        }
      }
    });
  }

  // Bar chart
  dom.barChartContainer.classList.toggle('hidden', !hasData);
  dom.barChartEmpty.classList.toggle('hidden', hasData);

  if (hasData) {
    const sorted = labels.map((l,i) => ({ label: l, val: data[i], color: colors[i] }))
                         .sort((a,b) => b.val - a.val);
    const barCanvas = $('bar-chart');
    if (state.charts.bar) { state.charts.bar.destroy(); state.charts.bar = null; }
    state.charts.bar = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: sorted.map(d => d.label),
        datasets: [{
          data: sorted.map(d => d.val),
          backgroundColor: sorted.map(d => d.color),
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${formatCurrency(ctx.parsed.y)}` },
            backgroundColor: 'rgba(255,255,255,0.95)',
            titleColor: '#191c1d', bodyColor: '#424846',
            borderColor: 'rgba(194,200,197,0.4)', borderWidth: 1,
            padding: 12, cornerRadius: 12,
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Space Grotesk', size: 11 }, color: '#727876' } },
          y: {
            grid: { color: 'rgba(194,200,197,0.15)', drawBorder: false },
            ticks: { font: { family: 'Space Grotesk', size: 10 }, color: '#727876', callback: v => formatCurrency(v) }
          }
        }
      }
    });
  }

  // Detailed stats
  if (state.transactions.length > 0) {
    const vals = state.transactions.map(t => t.value);
    const total = vals.reduce((a,b)=>a+b,0);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const days = Math.max(1, Math.ceil((new Date() - new Date(Math.min(...state.transactions.map(t => new Date(t.date))))) / 86400000));
    const cats = new Set(state.transactions.map(t => t.category)).size;

    dom.statMax.textContent = formatCurrency(max);
    dom.statMin.textContent = formatCurrency(min);
    dom.statDaily.textContent = formatCurrency(total / days);
    dom.statCats.textContent = `${cats} ativa${cats !== 1 ? 's' : ''}`;
  } else {
    dom.statMax.textContent = dom.statMin.textContent = dom.statDaily.textContent = dom.statCats.textContent = '—';
  }
}

// ─── 17. AI Insights Page ───────────────────────────────────
const INSIGHT_CARDS = [
  {
    id: 'leader',
    icon: 'military_tech',
    title: 'Categoria Dominante',
    generate: () => {
      if (!state.transactions.length) return null;
      const totals = getCategoryTotals();
      const leader = getLeaderCategory(totals);
      const pct = ((totals[leader] / state.transactions.reduce((a,t)=>a+t.value,0))*100).toFixed(0);
      const cfg = CATEGORY_CONFIG[leader] || CATEGORY_CONFIG['Outros'];
      const tmpl = AI_TEMPLATES[leader] || AI_TEMPLATES['Outros'];
      return {
        badge: `${cfg.emoji} ${leader} · ${pct}%`,
        badgeColor: cfg.bg, badgeTextColor: cfg.text,
        body: tmpl(totals[leader], state.transactions.reduce((a,t)=>a+t.value,0)),
      };
    }
  },
  {
    id: 'concentration',
    icon: 'hub',
    title: 'Concentração de Gastos',
    generate: () => {
      if (state.transactions.length < 2) return null;
      const totals = getCategoryTotals();
      const total = state.transactions.reduce((a,t)=>a+t.value,0);
      const sorted = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
      const top2pct = ((sorted.slice(0,2).reduce((a,x)=>a+x[1],0)/total)*100).toFixed(0);
      const diversified = parseInt(top2pct) < 60;
      return {
        badge: diversified ? '✅ Diversificado' : '⚠️ Concentrado',
        badgeColor: diversified ? 'rgba(143,246,208,0.35)' : 'rgba(255,222,183,0.35)',
        badgeTextColor: diversified ? '#007257' : '#7d6039',
        body: diversified
          ? `Suas despesas estão bem distribuídas. As 2 principais categorias representam apenas ${top2pct}% do total — sinal de boa diversificação financeira.`
          : `${top2pct}% dos seus gastos estão concentrados em apenas 2 categorias. Isso pode dificultar ajustes rápidos se precisar cortar custos.`,
      };
    }
  },
  {
    id: 'goal',
    icon: 'flag',
    title: 'Status da Meta',
    generate: () => {
      if (!state.monthlyGoal) return { badge: '⚙️ Meta não definida', badgeColor: 'rgba(225,227,228,0.5)', badgeTextColor: '#424846', body: 'Defina uma meta mensal nas configurações para receber alertas automáticos de progresso e análise de desvios.' };
      const total = state.transactions.reduce((a,t)=>a+t.value,0);
      const pct = (total / state.monthlyGoal) * 100;
      const remaining = state.monthlyGoal - total;
      const status = pct >= 100 ? '🔴 Meta ultrapassada' : pct >= 90 ? '🟠 Risco alto' : pct >= 70 ? '🟡 Atenção' : '🟢 No controle';
      const statusColor = pct >= 100 ? 'rgba(255,218,214,0.5)' : pct >= 70 ? 'rgba(255,222,183,0.5)' : 'rgba(143,246,208,0.35)';
      const statusTextColor = pct >= 100 ? '#93000a' : pct >= 70 ? '#7d6039' : '#007257';
      const body = pct >= 100
        ? `Você ultrapassou sua meta em ${formatCurrency(Math.abs(remaining))}. Revise os últimos lançamentos para identificar gastos evitáveis.`
        : `Você utilizou ${pct.toFixed(1)}% da sua meta mensal. ${remaining > 0 ? `Ainda há ${formatCurrency(remaining)} disponíveis.` : ''}`;
      return { badge: status, badgeColor: statusColor, badgeTextColor: statusTextColor, body };
    }
  },
  {
    id: 'ticket',
    icon: 'payments',
    title: 'Ticket Médio',
    generate: () => {
      if (state.transactions.length < 3) return null;
      const total = state.transactions.reduce((a,t)=>a+t.value,0);
      const avg = total / state.transactions.length;
      const high = state.transactions.filter(t => t.value > avg * 2);
      const body = high.length > 0
        ? `Ticket médio: ${formatCurrency(avg)}. Atenção: ${high.length} transação(ões) estão acima de 2× a média — podem ser candidatas a revisão.`
        : `Ticket médio de ${formatCurrency(avg)} sem grandes outliers. Seus gastos estão distribuídos de forma consistente.`;
      return { badge: formatCurrency(avg), badgeColor: 'rgba(202,231,255,0.4)', badgeTextColor: '#356a8c', body };
    }
  }
];

function renderInsights() {
  if (!dom.insightsContainer) return;

  const cards = INSIGHT_CARDS.map(card => ({ ...card, data: card.generate() })).filter(c => c.data);

  if (cards.length === 0) {
    dom.insightsEmpty?.classList.remove('hidden');
    // Remove any old cards
    dom.insightsContainer.querySelectorAll('.insight-card').forEach(c => c.remove());
    return;
  }

  dom.insightsEmpty?.classList.add('hidden');
  dom.insightsContainer.querySelectorAll('.insight-card').forEach(c => c.remove());

  cards.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'insight-card glass-card p-7 rounded-4xl animate-slide-in';
    div.style.animationDelay = `${i * 0.08}s`;
    div.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-2xl bg-primary-container/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-symbols-outlined fill-icon text-primary" style="font-size:20px">${card.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-3">
            <h3 class="font-headline text-lg italic">${card.title}</h3>
            <span class="cat-badge" style="background:${card.data.badgeColor};color:${card.data.badgeTextColor}">${card.data.badge}</span>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed">${card.data.body}</p>
        </div>
      </div>
    `;
    dom.insightsContainer.appendChild(div);
  });
}

// ─── 18. Settings View ──────────────────────────────────────
function updateSettingsView() {
  if (dom.settingsGoalInput) dom.settingsGoalInput.value = state.monthlyGoal ?? '';
  if (dom.settingsGoalStatus) {
    dom.settingsGoalStatus.textContent = state.monthlyGoal
      ? `Meta atual: ${formatCurrency(state.monthlyGoal)}`
      : 'Meta atual: não definida';
  }
}

dom.settingsSaveGoal?.addEventListener('click', () => {
  const val = parseFloat(dom.settingsGoalInput.value);
  if (isNaN(val) || val <= 0) { showToast('Valor inválido.', 'error'); return; }
  saveGoal(val);
  updateSummary();
  updateSettingsView();
  showToast(`Meta salva: ${formatCurrency(val)}`, 'success');
});

dom.exportBtn?.addEventListener('click', () => {
  const data = JSON.stringify(state.transactions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fintrack-transacoes-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exportação concluída!', 'success');
});

dom.settingsClearBtn?.addEventListener('click', async () => {
  const confirmed = await showConfirm('Apagar todos os dados', 'Esta ação é irreversível. Todos os lançamentos serão deletados permanentemente.');
  if (confirmed) {
    state.transactions = [];
    updateUI();
    showToast('Todos os dados foram apagados.', 'info');
  }
});

// ─── 19. Clear All Handler ───────────────────────────────────
dom.clearAllBtn?.addEventListener('click', async () => {
  if (state.transactions.length === 0) { showToast('Não há lançamentos para apagar.', 'info'); return; }
  const confirmed = await showConfirm('Limpar tudo', `Remover ${state.transactions.length} transação(ões)?`);
  if (confirmed) {
    state.transactions = [];
    updateUI();
    showToast('Todos os lançamentos foram removidos.', 'info');
  }
});

// ─── 19b. Dark Mode ──────────────────────────────────────────
const html = document.getElementById('html-root');

function applyDarkMode(dark) {
  if (dark) {
    html.classList.remove('light');
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, dark ? '1' : '0');
}

function initDarkMode() {
  const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  const prefersDark = saved !== null ? saved === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyDarkMode(prefersDark);
}

document.getElementById('dark-toggle')?.addEventListener('click', () => {
  const isDark = html.classList.contains('dark');
  applyDarkMode(!isDark);
});

// ─── 19b. Premium Demo Data ──────────────────────────────────
const d = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const DEMO_DATA = [
  // Moradia
  { id: 'dm1',  description: 'Aluguel Mensal',              value: 2200.00, category: 'Moradia',     date: d(28) },
  { id: 'dm2',  description: 'Condomínio + IPTU',           value:  380.00, category: 'Moradia',     date: d(27) },
  // Serviços / Assinaturas
  { id: 'dm3',  description: 'Internet (fibra 500mb)',       value:  119.90, category: 'Serviços',    date: d(26) },
  { id: 'dm13', description: 'Spotify Premium',             value:   21.90, category: 'Serviços',    date: d(26) },
  { id: 'dm16', description: 'ChatGPT Plus',                value:  107.00, category: 'Serviços',    date: d(26) },
  // Alimentação
  { id: 'dm4',  description: 'Mercado da Semana',            value:  487.50, category: 'Alimentação', date: d(22) },
  // Transporte
  { id: 'dm11', description: 'Gasolina',                    value:  280.00, category: 'Transporte',  date: d(20) },
  // Saúde
  { id: 'dm8',  description: 'Academia Smart Fit',           value:  109.90, category: 'Saúde',       date: d(25) },
  { id: 'dm9',  description: 'Farmácia — Suplementos',      value:  228.00, category: 'Saúde',       date: d(19) },
  // Alimentação continuação
  { id: 'dm5',  description: 'iFood — Jantar sexta',        value:   89.90, category: 'Alimentação', date: d(17) },
  // Lazer
  { id: 'dm15', description: 'Steam — Hogwarts Legacy',     value:  149.90, category: 'Lazer',       date: d(15) },
  { id: 'dm6',  description: 'Padaria Artesanal',            value:   42.00, category: 'Alimentação', date: d(14) },
  // Saúde
  { id: 'dm10', description: 'Consulta Médica Particular',   value:  350.00, category: 'Saúde',       date: d(11) },
  // Lazer
  { id: 'dm14', description: 'Cinema + Jantar',             value:  198.00, category: 'Lazer',       date: d(9)  },
  // Alimentação
  { id: 'dm7',  description: 'Mercado da Semana',            value:  312.00, category: 'Alimentação', date: d(7)  },
  // Transporte
  { id: 'dm12', description: 'Uber / 99 (semana)',           value:  145.00, category: 'Transporte',  date: d(5)  },
  // Serviços
  { id: 'dm17', description: 'Adobe Creative Cloud',        value:  234.90, category: 'Serviços',    date: d(3)  },
  { id: 'dm18', description: 'Curso Udemy — AWS Solutions', value:   27.90, category: 'Serviços',    date: d(1)  },
];

function loadDemo() {
  state.transactions = DEMO_DATA.map(t => ({ ...t }));
  if (!state.monthlyGoal) saveGoal(5500);
  updateUI();
  showToast('Cenário mensal completo carregado!', 'success');
}


dom.loadDemoBtn?.addEventListener('click', loadDemo);
dom.heroDemoBtn?.addEventListener('click', loadDemo);

dom.heroStartBtn?.addEventListener('click', () => {
  dom.descInput?.focus();
  window.scrollTo({ top: 400, behavior: 'smooth' });
});

dom.ctaBtn?.addEventListener('click', () => {
  dom.descInput?.focus();
  window.scrollTo({ top: 400, behavior: 'smooth' });
});

// ─── 20. Master updateUI ─────────────────────────────────────
function updateUI() {
  saveTransactions();
  renderTable();
  updateSummary();
  renderDashboardChart();
  if (state.currentView === 'reports') renderReports();
  if (state.currentView === 'insights') renderInsights();
  if (state.currentView === 'transactions') renderTxList();
}

// ─── 21. Security Utility ────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── 22. Date input default ──────────────────────────────────
function setDateInputDefault() {
  if (dom.dateInput) {
    const now = new Date();
    dom.dateInput.value = now.toISOString().split('T')[0];
  }
}

// ─── 23. Keyboard Shortcuts ──────────────────────────────────
document.addEventListener('keydown', (e) => {
  // ESC to close modals
  if (e.key === 'Escape') {
    dom.goalModal?.classList.remove('open');
    dom.confirmModal?.classList.remove('open');
    closeMobileSidebar();
  }
  // Ctrl+K to focus search (if on dashboard)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const search = state.currentView === 'transactions' ? dom.txSearchInput : dom.searchInput;
    search?.focus();
  }
});

// ─── 24. Init ────────────────────────────────────────────────
(function init() {
  initDarkMode();
  loadState();
  setDateInputDefault();
  navigateTo(state.currentView);
  updateUI();
  updateSettingsView();

  // Smooth scroll for nav links
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  console.log('%c FinTrack AI ✨', 'font-size:20px;font-family:Newsreader,serif;font-style:italic;color:#2e6385;font-weight:bold');
  console.log('%c Octoverse Hackathon 2024 · by Júnio (@Junio243)', 'font-size:11px;color:#727876;font-family:Space Grotesk');
})();
