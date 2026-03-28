const form = document.getElementById('expenseForm');
const list = document.getElementById('expenseList');
const totalEl = document.getElementById('total');
const topCategoryEl = document.getElementById('topCategory');
const expenseCountEl = document.getElementById('expenseCount');
const avgTicketEl = document.getElementById('avgTicket');
const aiInsightEl = document.getElementById('aiInsight');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const startBtn = document.getElementById('startBtn');
const chartEl = document.getElementById('chart');

let expenses = JSON.parse(localStorage.getItem('fintrack_expenses') || '[]');

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function save() {
  localStorage.setItem('fintrack_expenses', JSON.stringify(expenses));
}

function getInsight(total, topCategory) {
  if (!expenses.length) {
    return 'Adicione alguns gastos para receber recomendações personalizadas.';
  }

  if (topCategory === 'Comida' && total > 500) {
    return 'Você concentra boa parte dos gastos em Comida. Considere planejar refeições semanais para reduzir desperdícios.';
  }
  if (topCategory === 'Transporte' && total > 300) {
    return 'Transporte está puxando seu orçamento. Teste rotas alternativas ou agrupamento de viagens para economizar.';
  }
  if (topCategory === 'Lazer' && total > 350) {
    return 'Seu gasto em Lazer está elevado. Definir um limite mensal pode manter equilíbrio sem cortar diversão.';
  }

  return 'Seu padrão está relativamente equilibrado. Continue registrando diariamente para melhorar a previsibilidade financeira.';
}

function renderChart(categoryTotals) {
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    chartEl.innerHTML = '<small style="color:#9fb2d8">Sem dados ainda para o gráfico de categorias.</small>';
    return;
  }

  const maxValue = entries[0][1] || 1;

  chartEl.innerHTML = entries
    .map(([category, value]) => {
      const width = Math.max(8, (value / maxValue) * 100);
      return `
        <div class="chart-item">
          <div class="chart-head">
            <span>${category}</span>
            <strong>${formatBRL(value)}</strong>
          </div>
          <div class="chart-bar">
            <div class="chart-fill" style="width:${width}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function render() {
  list.innerHTML = '';
  let total = 0;
  const categoryTotals = {};

  expenses.forEach((expense, index) => {
    total += expense.amount;
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div class="expense-meta">
        <strong>${expense.title}</strong>
        <small>${expense.category}</small>
      </div>
      <div style="display:flex;align-items:center;gap:.55rem;">
        <strong>${formatBRL(expense.amount)}</strong>
        <button class="btn ghost" data-remove="${index}" style="padding:.35rem .55rem;">✕</button>
      </div>
    `;
    list.appendChild(li);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const count = expenses.length;
  const avg = count ? total / count : 0;

  totalEl.textContent = formatBRL(total);
  topCategoryEl.textContent = topCategory;
  expenseCountEl.textContent = String(count);
  avgTicketEl.textContent = formatBRL(avg);
  aiInsightEl.textContent = getInsight(total, topCategory);

  renderChart(categoryTotals);

  list.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.getAttribute('data-remove'));
      expenses.splice(index, 1);
      save();
      render();
    });
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (!title || !amount) return;

  expenses.unshift({ title, amount, category });
  save();
  form.reset();
  render();
});

sampleBtn.addEventListener('click', () => {
  expenses = [
    { title: 'Mercado', amount: 189.9, category: 'Comida' },
    { title: 'Aluguel', amount: 1200, category: 'Moradia' },
    { title: 'Uber', amount: 48.5, category: 'Transporte' },
    { title: 'Streaming', amount: 39.9, category: 'Lazer' }
  ];
  save();
  render();
});

clearBtn.addEventListener('click', () => {
  expenses = [];
  save();
  render();
});

startBtn.addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
});

render();
