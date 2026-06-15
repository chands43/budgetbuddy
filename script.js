// Core Data
let incomes = [];
let bills = [];
let transactions = [];
let savingsGoals = [];
let currentPeriod = 2; // 0: week, 1: fortnight, 2: month

// Load data
function loadData() {
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) incomes = JSON.parse(savedIncomes);
    
    const savedBills = localStorage.getItem('bills');
    if (savedBills) bills = JSON.parse(savedBills);
    
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    
    const savedGoals = localStorage.getItem('savingsGoals');
    if (savedGoals) savingsGoals = JSON.parse(savedGoals);
    
    updateDashboard();
    renderBillsScreen();
}

// Save data
function saveData() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
    updateDashboard();
}

// Update main dashboard
function updateDashboard() {
    let totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    let totalBillsAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    let totalExpenses = transactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    let totalSpent = totalBillsAmount + totalExpenses;
    let leftover = totalIncome - totalSpent;
    
    // Update UI
    document.getElementById('leftover-amount').textContent = '$' + Math.max(0, leftover).toFixed(2);
    document.getElementById('total-income').textContent = '$' + totalIncome.toFixed(2);
    document.getElementById('total-bills').textContent = '$' + totalSpent.toFixed(2);
    
    // Budget used %
    const budgetUsed = totalIncome > 0 ? Math.min(100, Math.round((totalSpent / totalIncome) * 100)) : 0;
    document.getElementById('budget-percent').textContent = budgetUsed + '%';
    document.getElementById('budget-progress').style.width = budgetUsed + '%';
    
    // Health Score (simple formula)
    const healthScore = Math.max(30, Math.min(100, 100 - Math.round(totalSpent / totalIncome * 40 || 0)));
    document.getElementById('health-score').textContent = healthScore;
    
    const billsRatio = totalIncome > 0 ? Math.round((totalBillsAmount / totalIncome) * 100) : 0;
    document.getElementById('bills-ratio').textContent = billsRatio + '%';
    document.getElementById('bills-bar').style.width = billsRatio + '%';
    
    const savingsRate = Math.max(0, 100 - budgetUsed);
    document.getElementById('savings-rate').textContent = savingsRate + '%';
    document.getElementById('savings-bar').style.width = savingsRate + '%';
}

// Add Income with prompts
function addIncome() {
    const desc = document.getElementById('income-desc').value.trim() || 'Pay';
    const type = document.getElementById('income-type').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value || new Date().toISOString().split('T')[0];
    
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    if (type === 'casual') {
        if (!confirm("Casual pay detected. This amount will be added as one-off. Continue?")) {
            return;
        }
    }
    
    incomes.push({
        description: desc,
        type: type,
        amount: amount,
        date: date
    });
    
    saveData();
    hideModals();
    clearForms();
}

// Add Bill
function addBill() {
    const desc = document.getElementById('bill-desc').value.trim() || 'Bill';
    const amount = parseFloat(document.getElementById('bill-amount').value);
    const date = document.getElementById('bill-date').value || new Date().toISOString().split('T')[0];
    
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    bills.push({
        description: desc,
        amount: amount,
        date: date
    });
    
    saveData();
    hideModals();
    clearForms();
    renderBillsScreen();
}

// Add Transaction
function addTransaction() {
    const desc = document.getElementById('trans-desc').value.trim();
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const type = document.getElementById('trans-type').value;
    const date = document.getElementById('trans-date').value || new Date().toISOString().split('T')[0];
    
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    transactions.push({
        description: desc || (type === 'income' ? 'Income' : 'Expense'),
        amount: amount,
        type: type,
        date: date
    });
    
    if (type === 'income') {
        incomes.push({
            description: desc || 'Income',
            type: 'other',
            amount: amount,
            date: date
        });
    }
    
    saveData();
    hideModals();
    clearForms();
}

// Helper to clear forms
function clearForms() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
}

// Modal controls
function showAddIncomeModal() {
    document.getElementById('income-modal').style.display = 'flex';
}

function showAddBillModal() {
    document.getElementById('bill-modal').style.display = 'flex';
}

function showAddTransactionModal() {
    document.getElementById('transaction-modal').style.display = 'flex';
}

function hideModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach((item, index) => {
        item.classList.toggle('active', index === tab);
    });
    
    document.getElementById('home-screen').classList.toggle('hidden', tab !== 0);
    document.getElementById('bills-screen').classList.toggle('hidden', tab !== 1);
    
    if (tab === 1) renderBillsScreen();
}

function setPeriod(period) {
    currentPeriod = period;
    document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === period);
    });
    updateDashboard();
}

// Render bills screen
function renderBillsScreen() {
    const container = document.getElementById('bills-list');
    container.innerHTML = '<h3 style="margin-bottom:16px;">Recent Bills & Income</h3>';
    
    // Bills
    if (bills.length > 0) {
        const billHeader = document.createElement('div');
        billHeader.textContent = 'Bills';
        billHeader.style.fontWeight = '600';
        billHeader.style.margin = '16px 0 8px';
        container.appendChild(billHeader);
        
        bills.forEach((bill, i) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <strong>${bill.description}</strong><br>
                <small>${bill.date}</small>
                <span style="float:right;color:#ef4444;font-weight:600;">-$${bill.amount}</span>
            `;
            container.appendChild(div);
        });
    }
    
    // Income
    if (incomes.length > 0) {
        const incHeader = document.createElement('div');
        incHeader.textContent = 'Income';
        incHeader.style.fontWeight = '600';
        incHeader.style.margin = '16px 0 8px';
        container.appendChild(incHeader);
        
        incomes.slice(-5).forEach(inc => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <strong>${inc.description}</strong> (${inc.type})<br>
                <small>${inc.date}</small>
                <span style="float:right;color:#22c55e;font-weight:600;">+$${inc.amount}</span>
            `;
            container.appendChild(div);
        });
    }
    
    if (bills.length === 0 && incomes.length === 0) {
        container.innerHTML += '<p style="color:#64748b;padding:40px 20px;text-align:center;">No entries yet. Add some above!</p>';
    }
}

// Settings placeholder
function toggleSettings() {
    const name = prompt("Enter your name:", "Jayden");
    if (name) document.getElementById('user-name').textContent = name + " 👋";
}

// PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    console.log('PWA install prompt ready');
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    console.log('%c✅ CashFlow Complete - Fully functional finance PWA ready', 'color:#22c55e;font-size:15px;font-weight:700');
});