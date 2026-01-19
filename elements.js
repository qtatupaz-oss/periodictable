let periodicData = [];
let pinnedElement = null;

document.addEventListener('DOMContentLoaded', loadData);

async function loadData() {
    try {
        const res = await fetch('periodic-data.json');
        if (!res.ok) throw Error();
        periodicData = await res.json();
        renderTable(periodicData);
    } catch {
        document.getElementById('periodicTable').innerHTML =
            '<div class="loading">Error loading data.</div>';
    }
}

function renderTable(elements) {
    const table = document.getElementById('periodicTable');
    table.innerHTML = `
        <div id="centerDisplay">
            <div class="display-left">
                <div class="display-symbol" style="color:#667eea;">?</div>
                <div class="display-name">Hover over an element</div>
                <div class="display-category">Explore the periodic table</div>
            </div>
            <div class="display-right">
                <p>Move your cursor over any element to see its details</p>
            </div>
        </div>
    `;

    elements.forEach(el => table.appendChild(createCell(el)));
    table.addEventListener('mouseover', onHover);
    table.addEventListener('click', onClick);
}

function createCell(el) {
    const div = document.createElement('div');
    const cat = normalize(el.category);

    let row, col;

    if (el.atomicNumber >= 57 && el.atomicNumber <= 71) {
        row = 8;
        col = (el.atomicNumber - 54) + 1; 
    }
    else if (el.atomicNumber >= 89 && el.atomicNumber <= 103) {
        row = 9;
        col = (el.atomicNumber - 86) + 1; 
    }
    else {
        row = el.period;
        col = el.group;
    }

    div.className = `element ${cat}`;
    div.dataset.atomicNumber = el.atomicNumber;
    div.style.gridRow = row;
    div.style.gridColumn = col;

    div.innerHTML = `
        <span class="atomic-number">${el.atomicNumber}</span>
        <div class="symbol">${el.symbol}</div>
        <div class="name">${el.name}</div>
        <div class="mass">${el.atomicMass}</div>
    `;

    return div;
}



function onHover(e) {
    if (pinnedElement || !e.target.closest('.element')) return;
    updateDisplay(getElementData(e));
}

function onClick(e) {
    const el = e.target.closest('.element');
    if (!el) return;

    if (pinnedElement === el) {
        el.classList.remove('pinned');
        pinnedElement = null;
        document.getElementById('centerDisplay').classList.remove('pinned');
    } else {
        pinnedElement?.classList.remove('pinned');
        pinnedElement = el;
        el.classList.add('pinned');
        document.getElementById('centerDisplay').classList.add('pinned');
        updateDisplay(getElementData(e));
    }
}

function getElementData(e) {
    const num = e.target.closest('.element').dataset.atomicNumber;
    return periodicData.find(el => el.atomicNumber == num);
}

function updateDisplay(el) {
    if (!el) return;
    const cat = normalize(el.category);
    const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${cat}`) || '#667eea';

    document.getElementById('centerDisplay').innerHTML = `
        <div class="display-left">
            <div class="display-symbol" style="color:${color};">${el.symbol}</div>
            <div class="display-name">${el.name}</div>
            <div class="display-category">${el.category}</div>
        </div>
        <div class="display-right">
            <p><strong>Atomic Number:</strong> ${el.atomicNumber}</p>
            <p><strong>Atomic Mass:</strong> ${el.atomicMass}</p>
            <p><strong>Period:</strong> ${el.period} | <strong>Group:</strong> ${el.group}</p>
            <p><strong>Block:</strong> ${el.block}-block</p>
        </div>
    `;
}

const normalize = s =>
    s.toLowerCase().replace(/\s+|\(|\)/g, '-');
