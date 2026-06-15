// CashFlow - Personal Finance PWA
let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let goals = JSON.parse(localStorage.getItem('goals')) || [];

// Current date helpers
const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay());
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

function saveData() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('goals', JSON.stringify(goals));
    updateUI();
}

function calculateBalance() {
    let totalIncome = 0;
    const today = new Date();
    
    incomes.forEach(inc => {
        // Simplified projection
        totalIncome += parseFloat(inc.amount) || 0;
    });
    
    let totalSpent = 0;
    transactions.forEach(t => {
        if (t.type === 'expense' || t.type === 'bill') {
            totalSpent += parseFloat(t.amount) || 0;
        }
    });
    
    return Math.max(0, totalIncome - totalSpent).toFixed(2);
}

function updateUI() {
    // Total balance
    const balanceEl = document.getElementById('total-balance');
    balanceEl.textContent = '$' + calculateBalance();
    
    // Week and Month (simplified)
    document.getElementById('week-balance').textContent = '$' + (parseFloat(calculateBalance()) * 0.25).toFixed(0);
    document.getElementById('month-balance').textContent = '$' + calculateBalance();
    
    renderIncomeList();
    renderTransactionsList();
    renderUpcomingBills();
    renderGoalsList();
}

function renderIncomeList() {
    const container = document.getElementById('income-list');
    container.innerHTML = '<h3>Your Income Sources</h3>';
    
    if (incomes.length === 0) {
        container.innerHTML += '<p class="list-item">No income sources yet. Add one above.</p>';
        return;
    }
    
    incomes.forEach((inc, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <strong>${inc.type}</strong><br>
                <small>${inc.frequency} • $${parseFloat(inc.amount).toFixed(2)}</small>
            </div>
            <button onclick="removeIncome(${index})" style="background:none; color:#ef4444; font-size:18px; padding:0; width:auto;">×</button>
        `;
        container.appendChild(div);
    });
}

function renderTransactionsList() {
    const container = document.getElementById('transactions-list');
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<p class="list-item">No transactions yet.</p>';
        return;
    }
    
    const recent = transactions.slice(0, 8);
    recent.forEach((t, index) => {
        const div = document.createElement('div');
        div.className = `list-item ${t.type}`;
        div.innerHTML = `
            <div>
                <strong>${t.description}</strong><br>
                <small>${new Date(t.date).toLocaleDateString()}</small>
            </div>
            <div style="text-align:right; color: ${t.type === 'expense' || t.type === 'bill' ? '#ef4444' : '#10b981'}">
                ${t.type === 'expense' || t.type === 'bill' ? '-' : '+'}$${parseFloat(t.amount).toFixed(2)}
            </div>
        `;
        container.appendChild(div);
    });
}

function renderUpcomingBills() {
    const container = document.getElementById('upcoming-bills');
    const bills = transactions.filter(t => t.type === 'bill');
    
    container.innerHTML = '';
    if (bills.length === 0) {
        container.innerHTML = '<p class="list-item">No upcoming bills.</p>';
        return;
    }
    
    bills.slice(0, 5).forEach(bill => {
        const div = document.createElement('div');
        div.className = 'list-item expense';
        div.innerHTML = `
            <div><strong>${bill.description}</strong></div>
            <div>-$${parseFloat(bill.amount).toFixed(2)}</div>
        `;
        container.appendChild(div);
    });
}

function renderGoalsList() {
    const container = document.getElementById('goals-list');
    container.innerHTML = '';
    
    if (goals.length === 0) {
        container.innerHTML = '<p class="list-item">No savings goals yet. Add one above.</p>';
        return;
    }
    
    goals.forEach((goal, index) => {
        const progress = 45; // Placeholder
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div style="flex:1">
                <strong>${goal.name}</strong><br>
                <small>$${parseFloat(goal.target).toFixed(0)} target</small>
                <div style="height:6px; background:#333; border-radius:999px; margin-top:8px;">
                    <div style="width:${progress}%; height:100%; background:var(--primary); border-radius:999px;"></div>
                </div>
            </div>
            <button onclick="removeGoal(${index})" style="background:none; color:#ef4444;">×</button>
        `;
        container.appendChild(div);
    });
}

// Form handlers
document.getElementById('income-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('income-type').value;
    const amount = document.getElementById('income-amount').value;
    const frequency = document.getElementById('pay-frequency').value;
    
    if (!amount) return alert("Please enter an amount");
    
    incomes.push({
        type: type,
        amount: parseFloat(amount),
        frequency: frequency,
        dateAdded: new Date().toISOString()
    });
    
    saveData();
    this.reset();
});

document.getElementById('transaction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('trans-type').value;
    const desc = document.getElementById('trans-desc').value;
    const amount = document.getElementById('trans-amount').value;
    const date = document.getElementById('trans-date').value || new Date().toISOString().split('T')[0];
    
    if (!desc || !amount) return alert("Please fill all fields");
    
    transactions.unshift({
        type: type,
        description: desc,
        amount: parseFloat(amount),
        date: date
    });
    
    saveData();
    this.reset();
});

document.getElementById('goal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('goal-name').value;
    const target = document.getElementById('goal-target').value;
    
    if (!name || !target) return alert("Please fill all fields");
    
    goals.push({
        name: name,
        target: parseFloat(target),
        current: 0
    });
    
    saveData();
    this.reset();
});

function removeIncome(index) {
    incomes.splice(index, 1);
    saveData();
}

function removeGoal(index) {
    goals.splice(index, 1);
    saveData();
}

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const pageId = this.getAttribute('data-page');
        document.getElementById(pageId).classList.add('active');
    });
});

// Initialize
updateUI();

// Prompt for PWA install (iOS/Android friendly)
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    
    setTimeout(() => {
        if (confirm("💡 Add CashFlow to your home screen for the best app experience?")) {
            alert("On most phones: Tap the share/menu button → 'Add to Home Screen'");
        }
    }, 2500);
});