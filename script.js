const form = document.getElementById('expenseForm');
const list = document.getElementById('expenseList');
const totalEl = document.getElementById('total');
const topCategoryEl = document.getElementById('topCategory');
const aiInsightEl = document.getElementById('aiInsight');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const startBtn = document.getElementById('startBtn');

let expenses = JSON.parse(localStorage.getItem('fintrack_expenses') || '[]');

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function save() {
  localStorage.setItem('fintrack_expenses', JSON.stringify(expenses));
}

function getInsight(total, topCategory) {
  if (!expenses.length) return 'Adicione alguns gastos para receber recomendações.';
  if (topCategory === 'Lazer' && total > 300) {
    return 'IA: Seus gastos em Lazer estão altos. Tente definir um teto semanal para economizar.';
  }
  if (topCategory === 'Comida' && total > 400) {
    return 'IA: Comida é sua maior categoria. Planejar refeições pode reduzir custos em até 20%.';
  }
  if (topCategory === 'Transporte' && total > 250) {
    return 'IA: Transporte lidera seus gastos. Avalie rotas mais baratas ou carona compartilhada.';
  }
  return 'IA: Seu padrão está equilibrado. Continue monitorando para manter o controle financeiro.';
}

function render() {
  list.innerHTML = '';
  let total = 0;
  const categoryTotals = {};

  expenses.forEach((expense, index) => {
    total += expense.amount;
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

    const li = document.createElement('li');
    li.innerHTML = `
      <span>${expense.title} • ${expense.category}</span>
      <strong>${formatBRL(expense.amount)}</strong>
    `;
    li.title = 'Clique duas vezes para remover';
    li.ondblclick = () => {
      expenses.splice(index, 1);
      save();
      render();
    };
    list.appendChild(li);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  totalEl.textContent = formatBRL(total);
  topCategoryEl.textContent = topCategory;
  aiInsightEl.textContent = getInsight(total, topCategory);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const amount = Number(document.getElementById('amount').value);
  const category = document.getElementById('category').value;

  if (!title || !amount) return;
  expenses.push({ title, amount, category });
  save();
  form.reset();
  render();
});

sampleBtn.addEventListener('click', () => {
  expenses = [
    { title: 'Mercado', amount: 180.5, category: 'Comida' },
    { title: 'Uber', amount: 62.0, category: 'Transporte' },
    { title: 'Cinema', amount: 45.0, category: 'Lazer' }
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
