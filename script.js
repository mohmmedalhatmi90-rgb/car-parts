// Data State
let cars = JSON.parse(localStorage.getItem('carcost_cars')) || [];

// DOM Elements
const carForm = document.getElementById('car-form');
const carTableBody = document.getElementById('car-table-body');
const emptyState = document.getElementById('empty-state');
const exportBtn = document.getElementById('export-btn');

// Form Input Elements
const buyPriceInput = document.getElementById('buy-price');
const shipCostInput = document.getElementById('ship-cost');
const repairCostInput = document.getElementById('repair-cost');
const otherCostInput = document.getElementById('other-cost');
const sellPriceInput = document.getElementById('sell-price');

// Live Text Elements
const liveCostText = document.getElementById('live-cost');
const liveProfitText = document.getElementById('live-profit');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
    updateGlobalStats();
    
    // Attach Live Calculation Listeners
    [buyPriceInput, shipCostInput, repairCostInput, otherCostInput, sellPriceInput].forEach(input => {
        input.addEventListener('input', calculateLiveSummary);
    });
});

// Live Computation Function
function calculateLiveSummary() {
    const buy = parseFloat(buyPriceInput.value) || 0;
    const ship = parseFloat(shipCostInput.value) || 0;
    const repair = parseFloat(repairCostInput.value) || 0;
    const other = parseFloat(otherCostInput.value) || 0;
    const sell = parseFloat(sellPriceInput.value) || 0;

    const totalCost = buy + ship + repair + other;
    const netProfit = sell - totalCost;

    liveCostText.textContent = `${totalCost.toLocaleString()} ر.ع`;
    liveProfitText.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()} ر.ع`;
    
    liveProfitText.className = netProfit >= 0 ? 'profit-text' : 'badge-loss';
}

// Add New Car Form Submit
carForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const buy = parseFloat(buyPriceInput.value) || 0;
    const ship = parseFloat(shipCostInput.value) || 0;
    const repair = parseFloat(repairCostInput.value) || 0;
    const other = parseFloat(otherCostInput.value) || 0;
    const sell = parseFloat(sellPriceInput.value) || 0;

    const totalExpenses = ship + repair + other;
    const totalCost = buy + totalExpenses;
    const netProfit = sell - totalCost;

    const newCar = {
        id: Date.now(),
        name: document.getElementById('car-name').value,
        year: document.getElementById('car-year').value,
        buyPrice: buy,
        expenses: totalExpenses,
        totalCost: totalCost,
        sellPrice: sell,
        profit: netProfit
    };

    cars.push(newCar);
    saveData();
    renderTable();
    updateGlobalStats();

    carForm.reset();
    calculateLiveSummary();
});

// Save to LocalStorage
function saveData() {
    localStorage.setItem('carcost_cars', JSON.stringify(cars));
}

// Update Top Dashboard Stats
function updateGlobalStats() {
    const totalCars = cars.length;
    const totalCost = cars.reduce((acc, c) => acc + c.totalCost, 0);
    const totalSales = cars.reduce((acc, c) => acc + c.sellPrice, 0);
    const totalProfit = cars.reduce((acc, c) => acc + c.profit, 0);

    document.getElementById('stat-count').textContent = totalCars;
    document.getElementById('stat-cost').innerHTML = `${totalCost.toLocaleString()} <small>ر.ع</small>`;
    document.getElementById('stat-sales').innerHTML = `${totalSales.toLocaleString()} <small>ر.ع</small>`;
    
    const profitStat = document.getElementById('stat-profit');
    profitStat.innerHTML = `${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()} <small>ر.ع</small>`;
    profitStat.className = totalProfit >= 0 ? 'stat-value profit' : 'stat-value badge-loss';
}

// Render Table Data
function renderTable() {
    carTableBody.innerHTML = '';

    if (cars.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    cars.forEach(car => {
        const tr = document.createElement('tr');
        const isProfit = car.profit >= 0;

        tr.innerHTML = `
            <td><strong>${car.name}</strong></td>
            <td>${car.year}</td>
            <td>${car.buyPrice.toLocaleString()} ر.ع</td>
            <td>${car.expenses.toLocaleString()} ر.ع</td>
            <td><strong>${car.totalCost.toLocaleString()} ر.ع</strong></td>
            <td>${car.sellPrice.toLocaleString()} ر.ع</td>
            <td class="${isProfit ? 'badge-profit' : 'badge-loss'}">
                ${isProfit ? '+' : ''}${car.profit.toLocaleString()} ر.ع
            </td>
            <td>
                <button class="btn-delete" onclick="deleteCar(${car.id})">حذف</button>
            </td>
        `;

        carTableBody.appendChild(tr);
    });
}

// Delete Action
function deleteCar(id) {
    if (confirm('هل أنت تأكد من رغبتك في حذف هذه السيارة؟')) {
        cars = cars.filter(c => c.id !== id);
        saveData();
        renderTable();
        updateGlobalStats();
    }
}

// Export Data to JSON File
exportBtn.addEventListener('click', () => {
    if (cars.length === 0) {
        alert('لا توجد بيانات لتصديرها');
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cars, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `carcost_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});