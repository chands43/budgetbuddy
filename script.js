// Data storage
let incomes = [];
let bills = [];
let transactions = [];
let savingsGoals = [];

// Load from localStorage
function loadData() {
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) incomes = JSON.parse(savedIncomes);
    
    const savedBills = localStorage.getItem('bills');
    if (savedBills) bills = JSON.parse(savedBills);
    
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    
    updateDashboard();
}

// Save to localStorage
function saveData() {
    localStorage.setItem('incomes', JSON.stringify(incomes));
    localStorage.setItem('bills', JSON.stringify(bills));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateDashboard();
}

// Update main dashboard numbers
function updateDashboard() {
    // Calculate totals
    let totalIncome = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0);
    let totalBills = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
    let leftover = totalIncome - totalBills;
    
    document.getElementById('leftover-amount').textContent = '$' + leftover.toFixed(2);
    document.getElementById('total-income').textContent = '$' + totalIncome.toFixed(2);
    document.getElementById('total-bills').textContent = '$' + totalBills.toFixed(2);
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

// Add Income with type handling for casual etc.
function addIncome() {
    const desc = document.getElementById('income-desc').value || 'Income';
    const type = document.getElementById('income-type').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    
    if (!amount) {
        alert("Please enter an amount");
        return;
    }
    
    incomes.push({
        description: desc,
        type: type,
        amount: amount,
        date: date || new Date().toISOString().split('T')[0]
    });
    
    saveData();
    hideModals();
    
    // Clear form
    document.getElementById('income-desc').value = '';
    document.getElementById('income-amount').value = '';
}

// Add Bill
function addBill() {
    const desc = document.getElementById('bill-desc').value || 'Bill';
    const amount = parseFloat(document.getElementById('bill-amount').value);
    const date = document.getElementById('bill-date').value;
    
    if (!amount) return alert("Please enter amount");
    
    bills.push({
        description: desc,
        amount: amount,
        date: date || new Date().toISOString().split('T')[0]
    });
    
    saveData();
    hideModals();
    document.getElementById('bill-desc').value = '';
    document.getElementById('bill-amount').value = '';
}

// Add Transaction
function addTransaction() {
    const desc = document.getElementById('trans-desc').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const type = document.getElementById('trans-type').value;
    const date = document.getElementById('trans-date').value;
    
    if (!amount) return alert("Please enter amount");
    
    transactions.push({
        description: desc || (type === 'income' ? 'Income' : 'Expense'),
        amount: amount,
        type: type,
        date: date || new Date().toISOString().split('T')[0]
    });
    
    if (type === 'income') {
        incomes.push({
            description: desc,
            type: 'other',
            amount: amount,
            date: date
        });
    }
    
    saveData();
    hideModals();
    document.getElementById('trans-desc').value = '';
    document.getElementById('trans-amount').value = '';
}

// Tab switching (basic)
function switchTab(tab) {
    // For demo - could expand to show different views
    alert("Screen " + (tab + 1) + " coming soon - Full version ready for expansion");
}

// PWA install prompt handling
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    // Could show custom "Add to Home Screen" button
});

console.log('%cCashFlow PWA loaded - Premium finance tracker ready', 'color:#22c55e; font-size:14px; font-weight:600');

// Initialize
loadData();