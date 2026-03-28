// app.js

// 1. DOM Elements
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc-input');
const valInput = document.getElementById('val-input');
const catInput = document.getElementById('cat-input');

const summaryTotal = document.getElementById('summary-total');
const summaryLider = document.getElementById('summary-lider');
const summaryCount = document.getElementById('summary-count');
const summaryTicket = document.getElementById('summary-ticket');

const transactionList = document.getElementById('transaction-list');
const aiInsightsText = document.getElementById('ai-insights-text');
const clearAllBtn = document.getElementById('clear-all-btn');
const loadDemoBtn = document.getElementById('load-demo-btn');

// 2. State Management
let transactions = JSON.parse(localStorage.getItem('fintrack_transactions')) || [];

const catColors = {
    'Alimentação': 'bg-secondary-container/30 text-on-secondary-container',
    'Transporte': 'bg-tertiary-container/30 text-on-tertiary-container',
    'Lazer': 'bg-primary-container/30 text-on-primary-container',
    'Saúde': 'bg-error-container/30 text-on-error-container',
    'Serviços': 'bg-primary-container/30 text-on-primary-container',
    'Moradia': 'bg-secondary-container/30 text-on-secondary-container',
    'Outros': 'bg-surface-variant text-on-surface-variant'
};

// 3. Helper Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
}

// 4. Core Logic & Rendering
function saveTransactions() {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
}

function updateSummary() {
    if (transactions.length === 0) {
        summaryTotal.textContent = 'R$ 0,00';
        summaryLider.textContent = '-';
        summaryCount.textContent = '0';
        summaryTicket.textContent = 'R$ 0,00';
        updateAIInsights(0, null);
        return;
    }

    const total = transactions.reduce((acc, t) => acc + t.value, 0);
    const count = transactions.length;
    const ticket = total / count;

    // Lider category
    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.value;
    });

    let lider = '-';
    let maxSpent = 0;
    for (const [cat, amount] of Object.entries(categoryTotals)) {
        if (amount > maxSpent) {
            maxSpent = amount;
            lider = cat;
        }
    }

    summaryTotal.textContent = formatCurrency(total);
    summaryLider.textContent = lider;
    summaryCount.textContent = count.toString();
    summaryTicket.textContent = formatCurrency(ticket);

    updateAIInsights(total, lider);
}

function updateAIInsights(total, liderCategory) {
    if (transactions.length === 0) {
        aiInsightsText.textContent = 'Adicione algumas transações para que a IA possa analisar seu padrão de gastos.';
        return;
    }

    let insight = '';
    if (liderCategory === 'Lazer') {
        insight = `Seu maior volume de gastos está em Lazer (${formatCurrency(total)} no total desta vez). Cuidado para não comprometer suas metas essenciais.`;
    } else if (liderCategory === 'Alimentação') {
        insight = 'O padrão recente indica alta concentração em Alimentação. Uma dica da IA: compras programadas em supermercado podem reduzir pequenos gastos diários.';
    } else if (liderCategory === 'Transporte') {
        insight = 'Transporte é sua despesa líder. Vale analisar se pacotes de mobilidade ou caronas não seriam mais eficientes para seu perfil.';
    } else if (liderCategory === 'Moradia') {
        insight = 'Gastos com Moradia lideram seu fluxo financeiro. Sendo uma despesa fixa, focar em economia de energia e água pode gerar margem na conta final.';
    } else {
        if (total > 2000) {
            insight = 'Seu volume de gastos está acelerando. Com a categoria líder sendo ' + liderCategory + ', convém revisar suas assinaturas e gastos invisíveis.';
        } else {
            insight = 'Padrão estável detectado na categoria ' + liderCategory + '. Excelente! Continue mantendo a proporção de despesas sob os 75% da sua meta holística.';
        }
    }

    aiInsightsText.textContent = insight;
}

function renderTable() {
    transactionList.innerHTML = '';
    
    // Render from newest to oldest
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-primary/5 transition-colors';
        
        const catColorClass = catColors[t.category] || catColors['Outros'];

        tr.innerHTML = `
            <td class="px-8 py-5 text-sm text-on-surface-variant">${formatDate(t.date)}</td>
            <td class="px-8 py-5 font-medium text-on-surface">${t.description}</td>
            <td class="px-8 py-5">
                <span class="px-3 py-1 ${catColorClass} text-[10px] uppercase tracking-wider font-label rounded-full">${t.category}</span>
            </td>
            <td class="px-8 py-5 text-right font-headline italic text-on-surface">${formatCurrency(t.value)}</td>
        `;
        transactionList.appendChild(tr);
    });
}

function updateUI() {
    saveTransactions();
    renderTable();
    updateSummary();
}

// 5. Event Listeners
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const desc = descInput.value.trim();
    const val = parseFloat(valInput.value);
    const cat = catInput.value;

    if (!desc || isNaN(val) || val <= 0) {
        alert("Por favor, preencha os campos corretamente.");
        return;
    }

    const t = {
        id: Date.now().toString(),
        description: desc,
        value: val,
        category: cat,
        date: new Date().toISOString()
    };

    transactions.push(t);
    updateUI();

    // Reset form
    form.reset();
});

clearAllBtn.addEventListener('click', () => {
    if (confirm("Tem certeza que deseja apagar todos os lançamentos?")) {
        transactions = [];
        updateUI();
    }
});

loadDemoBtn.addEventListener('click', () => {
    transactions = [
        {
            id: '1',
            description: 'Supermercado Premium',
            value: 342.00,
            category: 'Alimentação',
            date: new Date().toISOString()
        },
        {
            id: '2',
            description: 'Assinatura FinTrack AI',
            value: 49.90,
            category: 'Serviços',
            date: new Date(Date.now() - 86400000).toISOString() // ontem
        },
        {
            id: '3',
            description: 'Uber para Aeroporto',
            value: 88.20,
            category: 'Transporte',
            date: new Date(Date.now() - 2 * 86400000).toISOString() // 2 dias atras
        },
        {
            id: '4',
            description: 'Aluguel Junho',
            value: 2500.00,
            category: 'Moradia',
            date: new Date(Date.now() - 5 * 86400000).toISOString()
        }
    ];
    updateUI();
});

// Init
updateUI();
