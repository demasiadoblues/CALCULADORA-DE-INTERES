let datosCalculados = [];

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    }).format(valor);
}

function formatearPorcentaje(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'percent',
        minimumFractionDigits: 4
    }).format(valor / 100);
}

function calcularInteresCompuesto() {
    const capital = parseFloat(document.getElementById('capital').value) || 0;
    const tasaAnual = parseFloat(document.getElementById('tasa').value) || 0;
    const dias = parseInt(document.getElementById('dias').value) || 30;
    const tipoCalculo = document.getElementById('tipoCalculo').value;
    
    // Calcular tasa diaria
    const tasaDiaria = tasaAnual / 365;
    document.getElementById('tasaDiaria').textContent = formatearPorcentaje(tasaDiaria);
    
    datosCalculados = [];
    let capitalActual = capital;
    let gananciaAcumulada = 0;
    
    for (let dia = 1; dia <= dias; dia++) {
        let interesDiario;
        
        if (tipoCalculo === 'compuesto') {
            // Interés compuesto: se calcula sobre el capital actual
            interesDiario = capitalActual * (tasaDiaria / 100);
            capitalActual += interesDiario;
        } else {
            // Interés simple: siempre se calcula sobre el capital inicial
            interesDiario = capital * (tasaDiaria / 100);
            capitalActual = capital + (interesDiario * dia);
        }
        
        gananciaAcumulada = capitalActual - capital;
        
        datosCalculados.push({
            dia: dia,
            capitalInicial: dia === 1 ? capital : datosCalculados[dia-2].capitalFinal,
            interesDiario: interesDiario,
            capitalFinal: capitalActual,
            gananciaAcumulada: gananciaAcumulada
        });
    }
    
    actualizarTabla();
    actualizarResumen();
}

function actualizarTabla() {
    const tbody = document.getElementById('tablaBody');
    tbody.innerHTML = '';
    
    datosCalculados.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.dia}</td>
            <td class="currency">${formatearMoneda(row.capitalInicial)}</td>
            <td class="currency">${formatearMoneda(row.interesDiario)}</td>
            <td class="currency">${formatearMoneda(row.capitalFinal)}</td>
            <td class="currency">${formatearMoneda(row.gananciaAcumulada)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarResumen() {
    const capital = parseFloat(document.getElementById('capital').value) || 0;
    
    if (datosCalculados.length > 0) {
        const ultimoDia = datosCalculados[datosCalculados.length - 1];
        const capitalFinal = ultimoDia.capitalFinal;
        const gananciaTotal = ultimoDia.gananciaAcumulada;
        const rentabilidad = (gananciaTotal / capital) * 100;
        
        document.getElementById('resumenCapital').textContent = formatearMoneda(capital);
        document.getElementById('resumenFinal').textContent = formatearMoneda(capitalFinal);
        document.getElementById('resumenGanancia').textContent = formatearMoneda(gananciaTotal);
        document.getElementById('resumenRentabilidad').textContent = rentabilidad.toFixed(2) + '%';
    }
}

function exportarCSV() {
    const headers = ['Día', 'Capital Inicial', 'Interés Diario', 'Capital Final', 'Ganancia Acumulada'];
    const csvContent = [
        headers.join(','),
        ...datosCalculados.map(row => 
            [row.dia, row.capitalInicial.toFixed(2), row.interesDiario.toFixed(2), 
             row.capitalFinal.toFixed(2), row.gananciaAcumulada.toFixed(2)].join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'calculo_interes_compuesto.csv';
    link.click();
}

function exportarJSON() {
    const datosExport = {
        parametros: {
            capitalInicial: parseFloat(document.getElementById('capital').value),
            tasaAnual: parseFloat(document.getElementById('tasa').value),
            dias: parseInt(document.getElementById('dias').value),
            tipoCalculo: document.getElementById('tipoCalculo').value
        },
        resultados: datosCalculados
    };
    
    const jsonContent = JSON.stringify(datosExport, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'calculo_interes_compuesto.json';
    link.click();
}

// Event listeners y inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners
    document.getElementById('capital').addEventListener('input', calcularInteresCompuesto);
    document.getElementById('tasa').addEventListener('input', calcularInteresCompuesto);
    document.getElementById('dias').addEventListener('input', calcularInteresCompuesto);
    document.getElementById('tipoCalculo').addEventListener('change', calcularInteresCompuesto);

    // Cálculo inicial
    calcularInteresCompuesto();
});