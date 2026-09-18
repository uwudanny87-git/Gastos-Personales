// Estado inicial de la app cargado desde localStorage o vacío
let datosApp = JSON.parse(localStorage.getItem('finanzas_pareja')) || {
    incomeDanny: 0,
    incomeSantiago: 0,
    expensesDanny: [],
    expensesSantiago: [],
    wishlist: []
};

// Cargar datos en los inputs al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('income-danny').value = datosApp.incomeDanny || '';
    document.getElementById('income-santiago').value = datosApp.incomeSantiago || '';
    renderizarTodo();
});

// Guardar en localStorage
function guardarDatos() {
    localStorage.setItem('finanzas_pareja', JSON.stringify(datosApp));
}

// Actualizar ingresos iniciales
function actualizarDatos() {
    datosApp.incomeDanny = parseFloat(document.getElementById('income-danny').value) || 0;
    datosApp.incomeSantiago = parseFloat(document.getElementById('income-santiago').value) || 0;
    guardarDatos();
    renderizarTodo();
}

// Agregar Gasto
function agregarGasto(event, persona) {
    event.preventDefault();
    const descInput = document.getElementById(`desc-${persona}`);
    const amountInput = document.getElementById(`amount-${persona}`);

    const nuevoGasto = {
        id: Date.now(),
        descripcion: descInput.value,
        monto: parseFloat(amountInput.value) || 0
    };

    if (persona === 'danny') {
        datosApp.expensesDanny.push(nuevoGasto);
    } else {
        datosApp.expensesSantiago.push(nuevoGasto);
    }

    descInput.value = '';
    amountInput.value = '';

    guardarDatos();
    renderizarTodo();
}

// Eliminar Gasto
function eliminarGasto(persona, id) {
    if (persona === 'danny') {
        datosApp.expensesDanny = datosApp.expensesDanny.filter(item => item.id !== id);
    } else {
        datosApp.expensesSantiago = datosApp.expensesSantiago.filter(item => item.id !== id);
    }
    guardarDatos();
    renderizarTodo();
}

// Agregar Deseo a la Wishlist
function agregarDeseo(event) {
    event.preventDefault();
    const userSelect = document.getElementById('wish-user');
    const itemInput = document.getElementById('wish-item');

    const nuevoDeseo = {
        id: Date.now(),
        usuario: userSelect.value,
        texto: itemInput.value,
        comprado: false
    };

    datosApp.wishlist.push(nuevoDeseo);
    itemInput.value = '';

    guardarDatos();
    renderizarTodo();
}

// Cambiar estado de comprado en Wishlist
function toggleDeseo(id) {
    const deseo = datosApp.wishlist.find(item => item.id === id);
    if (deseo) {
        deseo.comprado = !deseo.comprado;
        guardarDatos();
        renderizarTodo();
    }
}

// Eliminar Deseo
function eliminarDeseo(id) {
    datosApp.wishlist = datosApp.wishlist.filter(item => item.id !== id);
    guardarDatos();
    renderizarTodo();
}

// Renderizar toda la interfaz y cálculos
function renderizarTodo() {
    // Cálculos Danny
    const totalGastadoDanny = datosApp.expensesDanny.reduce((acc, curr) => acc + curr.monto, 0);
    const saldoDanny = datosApp.incomeDanny - totalGastadoDanny;

    document.getElementById('spent-danny').textContent = `$${totalGastadoDanny.toLocaleString()}`;
    const balanceDannyEl = document.getElementById('balance-danny');
    balanceDannyEl.textContent = `$${saldoDanny.toLocaleString()}`;
    balanceDannyEl.style.color = saldoDanny < 0 ? 'var(--danger)' : 'var(--success)';

    const listaDannyEl = document.getElementById('list-danny');
    listaDannyEl.innerHTML = datosApp.expensesDanny.map(item => `
        <li>
            <span>${item.descripcion} (-$${item.monto.toLocaleString()})</span>
            <button onclick="eliminarGasto('danny', ${item.id})">✕</button>
        </li>
    `).join('');

    // Cálculos Santiago
    const totalGastadoSantiago = datosApp.expensesSantiago.reduce((acc, curr) => acc + curr.monto, 0);
    const saldoSantiago = datosApp.incomeSantiago - totalGastadoSantiago;

    document.getElementById('spent-santiago').textContent = `$${totalGastadoSantiago.toLocaleString()}`;
    const balanceSantiagoEl = document.getElementById('balance-santiago');
    balanceSantiagoEl.textContent = `$${saldoSantiago.toLocaleString()}`;
    balanceSantiagoEl.style.color = saldoSantiago < 0 ? 'var(--danger)' : 'var(--success)';

    const listaSantiagoEl = document.getElementById('list-santiago');
    listaSantiagoEl.innerHTML = datosApp.expensesSantiago.map(item => `
        <li>
            <span>${item.descripcion} (-$${item.monto.toLocaleString()})</span>
            <button onclick="eliminarGasto('santiago', ${item.id})">✕</button>
        </li>
    `).join('');

    // Resumen Conjunto
    const totalIngresos = datosApp.incomeDanny + datosApp.incomeSantiago;
    const totalGastos = totalGastadoDanny + totalGastadoSantiago;
    const totalSaldo = totalIngresos - totalGastos;

    document.getElementById('total-ingresos').textContent = `$${totalIngresos.toLocaleString()}`;
    document.getElementById('total-gastos').textContent = `$${totalGastos.toLocaleString()}`;
    const totalSaldoEl = document.getElementById('total-saldo');
    totalSaldoEl.textContent = `$${totalSaldo.toLocaleString()}`;
    totalSaldoEl.style.color = totalSaldo < 0 ? 'var(--danger)' : 'var(--coffee-dark)';

    // Renderizar Wishlist
    const wishlistEl = document.getElementById('wishlist');
    wishlistEl.innerHTML = datosApp.wishlist.map(item => `
        <li class="wish-item ${item.comprado ? 'purchased' : ''}">
            <span><strong>[${item.usuario}]</strong> ${item.texto}</span>
            <div class="wish-actions">
                <button onclick="toggleDeseo(${item.id})">${item.comprado ? '↩️ Deshacer' : '✅ Comprado'}</button>
                <button onclick="eliminarDeseo(${item.id})">🗑️</button>
            </div>
        </li>
    `).join('');
}