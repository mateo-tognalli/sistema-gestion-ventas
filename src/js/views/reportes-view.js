const ReportesView = {
    topVestidosData: [],
    topClientesData: [],
    topVendedoresData: [],
    ventasFormaPagoData: [],
    ventasDiariaData: [],
    graficosInstancias: {},
    paginaTopVestidos: 1,
    paginaTopClientes: 1,
    paginaTopVendedores: 1,
    itemsPorPaginaTop: 5,

    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Reportes y Estadísticas</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarTodo()">&#128424; Exportar todo</button>
                    </div>

                    <!-- Filtros de fecha -->
                    <div class="form-grid" style="margin-bottom: 25px;">
                        <div class="form-group">
                            <label>Fecha Inicio</label>
                            <input type="date" id="fechaInicioReporte" min="2020-01-01" max="2050-12-31">
                        </div>
                        <div class="form-group">
                            <label>Fecha Fin</label>
                            <input type="date" id="fechaFinReporte" min="2020-01-01" max="2050-12-31">
                        </div>
                        <div class="form-group">
                            <label>Período rápido</label>
                            <select id="periodoRapido" onchange="ReportesView.aplicarPeriodo(this.value)">
                                <option value="hoy">Hoy</option>
                                <option value="semana">1 semana</option>
                                <option value="mes">1 mes</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; align-items: flex-end; gap: 10px;">
                            <button class="btn btn-primary" onclick="ReportesView.filtrarPorFechas()">Filtrar</button>
                            <button class="btn btn-secondary" onclick="ReportesView.limpiarFiltros()">Limpiar</button>
                        </div>
                    </div>

                    <!-- Estadísticas principales -->
                    <div class="stats-container" id="statsReportes">
                        <div class="stat-card">
                            <div class="stat-icon purple">👑</div>
                            <div class="stat-info">
                                <h3>Cliente Más Frecuente</h3>
                                <p id="statClienteFrecuente">-</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon blue">👗</div>
                            <div class="stat-info">
                                <h3>Vestido Más Vendido</h3>
                                <p id="statVestidoTop">-</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">💰</div>
                            <div class="stat-info">
                                <h3>Total de Ventas</h3>
                                <p id="statTotalVentas">0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon orange">📈</div>
                            <div class="stat-info">
                                <h3>Ingresos Totales</h3>
                                <p id="statIngresosTotales">$0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ingresos por período -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Ingresos por Período</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarReporte('ingresos')">Exportar PDF o Excel</button>
                    </div>
                    <div id="ingresosPeriodo" style="padding: 20px;"></div>
                </div>

                <!-- Top vestidos más vendidos -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Top 10 Vestidos Más Vendidos</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarReporte('vestidos')">Exportar PDF o Excel</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Unidades Vendidas</th>
                                    <th>Ingresos Generados</th>
                                </tr>
                            </thead>
                            <tbody id="topVestidosBody"></tbody>
                        </table>
                    </div>
                    <div class="pagination" id="paginacionTopVestidos" style="display:none; margin-top:15px; text-align:center;">
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('vestidos', ReportesView.paginaTopVestidos - 1)" id="btnAntTopVestidos">Anterior</button>
                        <span style="margin: 0 15px; font-weight:bold; color: #e2e8f0;">Página <span id="paginaTopVestidos">1</span> de <span id="totalPaginasTopVestidos">1</span></span>
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('vestidos', ReportesView.paginaTopVestidos + 1)" id="btnSigTopVestidos">Siguiente</button>
                    </div>
                </div>

                <!-- Top clientes -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Top 10 Clientes</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarReporte('clientes')">Exportar PDF o Excel</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Cliente</th>
                                    <th>Correo</th>
                                    <th>Total Compras</th>
                                    <th>Total Gastado</th>
                                </tr>
                            </thead>
                            <tbody id="topClientesBody"></tbody>
                        </table>
                    </div>
                    <div class="pagination" id="paginacionTopClientes" style="display:none; margin-top:15px; text-align:center;">
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('clientes', ReportesView.paginaTopClientes - 1)" id="btnAntTopClientes">Anterior</button>
                        <span style="margin: 0 15px; font-weight:bold; color: #e2e8f0;">Página <span id="paginaTopClientes">1</span> de <span id="totalPaginasTopClientes">1</span></span>
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('clientes', ReportesView.paginaTopClientes + 1)" id="btnSigTopClientes">Siguiente</button>
                    </div>
                </div>

                <!-- Top vendedores -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Top 10 Vendedores</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarReporte('vendedores')">Exportar PDF o Excel</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Posición</th>
                                    <th>Vendedor</th>
                                    <th>Total Ventas</th>
                                    <th>Ingresos Generados</th>
                                </tr>
                            </thead>
                            <tbody id="topVendedoresBody"></tbody>
                        </table>
                    </div>
                    <div class="pagination" id="paginacionTopVendedores" style="display:none; margin-top:15px; text-align:center;">
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('vendedores', ReportesView.paginaTopVendedores - 1)" id="btnAntTopVendedores">Anterior</button>
                        <span style="margin: 0 15px; font-weight:bold; color: #e2e8f0;">Página <span id="paginaTopVendedores">1</span> de <span id="totalPaginasTopVendedores">1</span></span>
                        <button class="btn btn-secondary" onclick="ReportesView.cambiarPaginaTop('vendedores', ReportesView.paginaTopVendedores + 1)" id="btnSigTopVendedores">Siguiente</button>
                    </div>
                </div>

                <!-- Ventas por forma de pago -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Ventas por Forma de Pago</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarReporte('formaPago')">Exportar PDF o Excel</button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Forma de Pago</th>
                                    <th>Cantidad Ventas</th>
                                    <th>Total Ingresos</th>
                                    <th>Porcentaje Ingresos</th>
                                </tr>
                            </thead>
                            <tbody id="ventasFormaPagoBody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Gráficos de torta -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Gráficos</h2>
                        <button class="btn btn-primary" onclick="ReportesView.exportarGraficos()">Exportar PDF</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 20px;">
                        <div style="text-align:center;">
                            <h3 style="color:#e2e8f0; margin-bottom:10px;">Ingresos por Período</h3>
                            <div style="max-width:450px; margin:0 auto;"><canvas id="chartIngresos"></canvas></div>
                        </div>
                        <div style="text-align:center;">
                            <h3 style="color:#e2e8f0; margin-bottom:10px;">Top 10 Vestidos</h3>
                            <div style="max-width:450px; margin:0 auto;"><canvas id="chartVestidos"></canvas></div>
                        </div>
                        <div style="text-align:center;">
                            <h3 style="color:#e2e8f0; margin-bottom:10px;">Top 10 Clientes</h3>
                            <div style="max-width:450px; margin:0 auto;"><canvas id="chartClientes"></canvas></div>
                        </div>
                        <div style="text-align:center;">
                            <h3 style="color:#e2e8f0; margin-bottom:10px;">Top 10 Vendedores</h3>
                            <div style="max-width:450px; margin:0 auto;"><canvas id="chartVendedores"></canvas></div>
                        </div>
                        <div style="text-align:center; grid-column: 1 / -1;">
                            <h3 style="color:#e2e8f0; margin-bottom:10px;">Ventas por Forma de Pago</h3>
                            <canvas id="chartFormaPago" style="max-width:450px; display:block; margin:0 auto;"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        const hoy = new Date();
        document.getElementById('periodoRapido').value = 'hoy';
        document.getElementById('fechaInicioReporte').value = fechaLocalStr(hoy);
        document.getElementById('fechaFinReporte').value = fechaLocalStr(hoy);
        await this.cargarReportes();
    },

    async cargarReportes() {
        try {
            const fechaInicio = document.getElementById('fechaInicioReporte').value;
            const fechaFin = document.getElementById('fechaFinReporte').value;

            // Cliente más frecuente
            const clienteFrecuente = await ReportesController.getClienteMasFrecuente(fechaInicio, fechaFin);
            document.getElementById('statClienteFrecuente').innerHTML = clienteFrecuente ? 
                `${clienteFrecuente.nombre} ${clienteFrecuente.apellido}<br><small>${clienteFrecuente.total_compras} compras</small>` : 
                'Sin datos';

            // Vestido más vendido
            const vestidoTop = await ReportesController.getVestidoMasVendido(fechaInicio, fechaFin);
            document.getElementById('statVestidoTop').innerHTML = vestidoTop ? 
                `${vestidoTop.nombre}<br><small>${vestidoTop.total_vendido} unidades</small>` : 
                'Sin datos';

            // Ingresos por período
            const ingresos = await ReportesController.getIngresosPorPeriodo(fechaInicio, fechaFin);
            document.getElementById('statTotalVentas').textContent = ingresos.total_ventas || 0;
            document.getElementById('statIngresosTotales').textContent = formatCurrency(ingresos.total_ingresos || 0);

        document.getElementById('ingresosPeriodo').innerHTML = `
            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Total Ventas</h3>
                        <p style="font-size: 32px;">${ingresos.total_ventas || 0}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Ingresos Totales</h3>
                        <p style="font-size: 32px;">${formatCurrency(ingresos.total_ingresos || 0)}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Promedio por Venta</h3>
                        <p style="font-size: 32px;">${formatCurrency(ingresos.promedio_venta || 0)}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Venta Mínima</h3>
                        <p style="font-size: 24px;">${formatCurrency(ingresos.venta_minima || 0)}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-info">
                        <h3>Venta Máxima</h3>
                        <p style="font-size: 24px;">${formatCurrency(ingresos.venta_maxima || 0)}</p>
                    </div>
                </div>
            </div>
        `;

        // Ventas por forma de pago
        this.ventasFormaPagoData = await ReportesController.getVentasPorFormaPago(fechaInicio, fechaFin);
        const totalIngresos = this.ventasFormaPagoData.reduce((sum, item) => sum + parseFloat(item.total_ingresos || 0), 0);
        const tbody1 = document.getElementById('ventasFormaPagoBody');
        tbody1.innerHTML = this.ventasFormaPagoData.length === 0
            ? '<tr><td colspan="4">Sin datos en el período seleccionado</td></tr>'
            : this.ventasFormaPagoData.map(item => `
            <tr>
                <td>${item.forma_pago}</td>
                <td>${item.cantidad_ventas}</td>
                <td>${formatCurrency(parseFloat(item.total_ingresos || 0))}</td>
                <td>${totalIngresos > 0 ? ((parseFloat(item.total_ingresos || 0) / totalIngresos) * 100).toFixed(1) : '0.0'}%</td>
            </tr>
        `).join('');

        // Top vestidos
        this.topVestidosData = await ReportesController.getTopVestidosMasVendidos(fechaInicio, fechaFin);
        this.paginaTopVestidos = 1;
        this.renderTopVestidos();

        // Top clientes
        this.topClientesData = await ReportesController.getTopClientes(fechaInicio, fechaFin);
        this.paginaTopClientes = 1;
        this.renderTopClientes();

        // Top vendedores
        this.topVendedoresData = await ReportesController.getTopVendedores(fechaInicio, fechaFin);
        this.paginaTopVendedores = 1;
        this.renderTopVendedores();

        // Datos diarios para gráfico de ingresos
        this.ventasDiariaData = await ReportesController.getVentasPorDia(fechaInicio, fechaFin);
        this.renderGraficos();

        } catch (error) {
            console.error('Error cargando reportes:', error);
            showAlert('Error al cargar los reportes: ' + error.message, 'error');
        }
    },

    aplicarPeriodo(valor) {
        if (!valor) return;
        const hoy = new Date();
        let inicio;
        if (valor === 'hoy') {
            inicio = hoy;
        } else if (valor === 'semana') {
            inicio = new Date(hoy);
            inicio.setDate(hoy.getDate() - 7);
        } else if (valor === 'mes') {
            inicio = new Date(hoy);
            inicio.setMonth(hoy.getMonth() - 1);
        }
        document.getElementById('fechaInicioReporte').value = fechaLocalStr(inicio);
        document.getElementById('fechaFinReporte').value = fechaLocalStr(hoy);
        ReportesView.filtrarPorFechas();
    },

    async filtrarPorFechas() {
        await this.cargarReportes();
        showAlert('Reportes actualizados', 'success');
    },

    limpiarFiltros() {
        const hoy = new Date();
        document.getElementById('fechaInicioReporte').value = fechaLocalStr(hoy);
        document.getElementById('fechaFinReporte').value = fechaLocalStr(hoy);
        document.getElementById('periodoRapido').value = 'hoy';
        this.cargarReportes();
    },

    async exportarReporte(tipo) {
        try {
            const formato = await PDFGenerator.pedirFormato();
            if (formato === 2) return;

            let titulo, datos, columnas, extraData = null;
            const fechaInicio = document.getElementById('fechaInicioReporte').value;
            const fechaFin = document.getElementById('fechaFinReporte').value;
            const periodo = fechaInicio && fechaFin
                ? `${formatFechaCorta(fechaInicio)} al ${formatFechaCorta(fechaFin)}`
                : 'Todo';

            switch(tipo) {
                case 'ingresos': {
                    titulo = 'Reporte de Ingresos';
                    const [rawIngresos, resumenIngresos] = await Promise.all([
                        ReportesController.getVentasPorDia(fechaInicio, fechaFin),
                        ReportesController.getIngresosPorPeriodo(fechaInicio, fechaFin)
                    ]);
                    datos = rawIngresos.map(row => ({
                        fecha: formatFechaCorta(row.fecha),
                        cantidad_ventas: row.cantidad_ventas,
                        total_ingresos: formatCurrency(parseFloat(row.total_ingresos || 0))
                    }));
                    columnas = [
                        { label: 'Fecha', field: 'fecha' },
                        { label: 'Ventas', field: 'cantidad_ventas' },
                        { label: 'Ingresos', field: 'total_ingresos' }
                    ];
                    extraData = {
                        'Total de Ventas': resumenIngresos.total_ventas || 0,
                        'Ingresos Totales': formatCurrency(resumenIngresos.total_ingresos || 0),
                        'Promedio por Venta': formatCurrency(resumenIngresos.promedio_venta || 0),
                        'Venta Mínima': formatCurrency(resumenIngresos.venta_minima || 0),
                        'Venta Máxima': formatCurrency(resumenIngresos.venta_maxima || 0)
                    };
                    break;
                }
                case 'vestidos': {
                    titulo = 'Top Vestidos Más Vendidos';
                    const rawVestidos = await ReportesController.getTopVestidosMasVendidos(fechaInicio, fechaFin);
                    datos = rawVestidos.map(row => ({
                        codigo: row.codigo,
                        nombre: row.nombre,
                        categoria_nombre: row.categoria_nombre,
                        total_vendido: row.total_vendido,
                        total_ingresos: formatCurrency(parseFloat(row.total_ingresos || 0))
                    }));
                    columnas = [
                        { label: 'Código', field: 'codigo' },
                        { label: 'Nombre', field: 'nombre' },
                        { label: 'Categoría', field: 'categoria_nombre' },
                        { label: 'Vendidos', field: 'total_vendido' },
                        { label: 'Ingresos', field: 'total_ingresos' }
                    ];
                    break;
                }
                case 'clientes': {
                    titulo = 'Top Clientes';
                    const rawClientes = await ReportesController.getTopClientes(fechaInicio, fechaFin);
                    datos = rawClientes.map(row => ({
                        nombre: row.nombre,
                        apellido: row.apellido,
                        total_compras: row.total_compras,
                        total_gastado: formatCurrency(parseFloat(row.total_gastado || 0))
                    }));
                    columnas = [
                        { label: 'Nombre', field: 'nombre' },
                        { label: 'Apellido', field: 'apellido' },
                        { label: 'Compras', field: 'total_compras' },
                        { label: 'Total Gastado', field: 'total_gastado' }
                    ];
                    break;
                }
                case 'vendedores': {
                    titulo = 'Top 10 Vendedores';
                    const rawVendedores = await ReportesController.getTopVendedores(fechaInicio, fechaFin);
                    datos = rawVendedores.map(row => ({
                        usuario_venta: row.usuario_venta,
                        total_ventas: row.total_ventas,
                        total_ingresos: formatCurrency(parseFloat(row.total_ingresos || 0))
                    }));
                    columnas = [
                        { label: 'Vendedor', field: 'usuario_venta' },
                        { label: 'Total Ventas', field: 'total_ventas' },
                        { label: 'Ingresos Generados', field: 'total_ingresos' }
                    ];
                    break;
                }
                case 'formaPago': {
                    titulo = 'Ventas por Forma de Pago';
                    const rawFormaPago = await ReportesController.getVentasPorFormaPago(fechaInicio, fechaFin);
                    const totalIng = rawFormaPago.reduce((s, r) => s + parseFloat(r.total_ingresos || 0), 0);
                    datos = rawFormaPago.map(row => ({
                        forma_pago: row.forma_pago,
                        cantidad_ventas: row.cantidad_ventas,
                        total_ingresos: formatCurrency(parseFloat(row.total_ingresos || 0)),
                        porcentaje: totalIng > 0 ? ((parseFloat(row.total_ingresos || 0) / totalIng) * 100).toFixed(1) + '%' : '0.0%'
                    }));
                    columnas = [
                        { label: 'Forma de Pago', field: 'forma_pago' },
                        { label: 'Cantidad Ventas', field: 'cantidad_ventas' },
                        { label: 'Total Ingresos', field: 'total_ingresos' },
                        { label: 'Porcentaje', field: 'porcentaje' }
                    ];
                    break;
                }
            }

            const filePath = formato === 0
                ? await PDFGenerator.generarReporte(titulo, datos, columnas, tipo, periodo, extraData)
                : await PDFGenerator.generarExcel(titulo, datos, columnas, tipo, extraData, periodo);
            if (filePath) showAlert(`Reporte exportado: ${filePath}`, 'success');
        } catch (error) {
            console.error('Error exportando reporte:', error);
            showAlert('Error al generar el reporte', 'error');
        }
    },

    renderGraficos() {
        const COLORES = [
            'rgba(99, 179, 237, 0.85)',
            'rgba(154, 117, 234, 0.85)',
            'rgba(72, 187, 120, 0.85)',
            'rgba(237, 137, 54, 0.85)',
            'rgba(252, 129, 129, 0.85)',
            'rgba(246, 224, 94, 0.85)',
            'rgba(100, 210, 180, 0.85)',
            'rgba(180, 100, 200, 0.85)',
            'rgba(100, 160, 230, 0.85)',
            'rgba(200, 160, 80, 0.85)',
        ];

        Object.values(this.graficosInstancias).forEach(c => c && c.destroy());
        this.graficosInstancias = {};

        const sinDatos = (canvasId) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            canvas.style.display = 'none';
            const prev = canvas.parentElement.querySelector('.chart-sin-datos');
            if (!prev) {
                const msg = document.createElement('p');
                msg.className = 'chart-sin-datos';
                msg.style.cssText = 'color:#a0aec0; text-align:center; padding:30px 0;';
                msg.textContent = 'Sin datos en el período seleccionado';
                canvas.parentElement.appendChild(msg);
            }
        };

        const crearTorta = (canvasId, labels, values) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            canvas.style.display = '';
            const prev = canvas.parentElement.querySelector('.chart-sin-datos');
            if (prev) prev.remove();
            const colores = COLORES.slice(0, labels.length);
            const total = values.reduce((a, b) => a + b, 0);
            this.graficosInstancias[canvasId] = new Chart(canvas.getContext('2d'), {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colores,
                        borderColor: colores.map(c => c.replace('0.85', '1')),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#e2e8f0', font: { size: 11 }, padding: 8, boxWidth: 14 }
                        }
                    }
                },
                plugins: [{
                    id: 'datalabelsCustom',
                    afterDraw(chart) {
                        const ctx = chart.ctx;
                        const meta = chart.getDatasetMeta(0);
                        const ds = chart.data.datasets[0];
                        meta.data.forEach((arc, i) => {
                            const value = ds.data[i];
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            if (parseFloat(pct) < 0.5) return; // solo omitir valores extremadamente pequeños
                            const midAngle = (arc.startAngle + arc.endAngle) / 2;
                            const esSmall = parseFloat(pct) < 5;
                            // Todos los porcentajes siempre dentro del gráfico
                            const r = arc.outerRadius * 0.6;
                            const x = arc.x + r * Math.cos(midAngle);
                            const y = arc.y + r * Math.sin(midAngle);
                            ctx.save();
                            ctx.font = esSmall ? 'bold 9px Arial' : 'bold 11px Arial';
                            ctx.fillStyle = '#fff';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(`${pct}%`, x, y);
                            ctx.restore();
                        });
                    }
                }]
            });
        };

        // 1. Ingresos por período
        if (this.ventasDiariaData && this.ventasDiariaData.length > 0) {
            const top = this.ventasDiariaData.slice(0, 10);
            const resto = this.ventasDiariaData.slice(10);
            const labels = top.map(d => formatFechaCorta(d.fecha));
            const values = top.map(d => parseFloat(d.total_ingresos || 0));
            if (resto.length > 0) {
                labels.push('Otros');
                values.push(resto.reduce((s, d) => s + parseFloat(d.total_ingresos || 0), 0));
            }
            crearTorta('chartIngresos', labels, values);
        } else {
            sinDatos('chartIngresos');
        }

        // 2. Top vestidos
        if (this.topVestidosData.length > 0) {
            crearTorta('chartVestidos',
                this.topVestidosData.map(v => v.nombre),
                this.topVestidosData.map(v => parseFloat(v.total_ingresos || 0))
            );
        } else {
            sinDatos('chartVestidos');
        }

        // 3. Top clientes
        if (this.topClientesData.length > 0) {
            crearTorta('chartClientes',
                this.topClientesData.map(c => `${c.nombre} ${c.apellido}`),
                this.topClientesData.map(c => parseFloat(c.total_gastado || 0))
            );
        } else {
            sinDatos('chartClientes');
        }

        // 4. Top vendedores
        if (this.topVendedoresData.length > 0) {
            crearTorta('chartVendedores',
                this.topVendedoresData.map(v => v.usuario_venta),
                this.topVendedoresData.map(v => parseFloat(v.total_ingresos || 0))
            );
        } else {
            sinDatos('chartVendedores');
        }

        // 5. Ventas por forma de pago
        if (this.ventasFormaPagoData.length > 0) {
            crearTorta('chartFormaPago',
                this.ventasFormaPagoData.map(f => f.forma_pago),
                this.ventasFormaPagoData.map(f => parseFloat(f.total_ingresos || 0))
            );
        } else {
            sinDatos('chartFormaPago');
        }
    },

    async exportarTodo() {
        try {
            const formato = await PDFGenerator.pedirFormato();
            if (formato === 2) return;
            const fechaInicio = document.getElementById('fechaInicioReporte').value;
            const fechaFin = document.getElementById('fechaFinReporte').value;
            const periodo = `${formatFechaCorta(fechaInicio)} al ${formatFechaCorta(fechaFin)}`;

            // Recopilar todos los datos en paralelo
            const [rawIngresos, rawResumenIngresos, rawVestidos, rawClientes, rawVendedores, rawFormaPago] = await Promise.all([
                ReportesController.getVentasPorDia(fechaInicio, fechaFin),
                ReportesController.getIngresosPorPeriodo(fechaInicio, fechaFin),
                ReportesController.getTopVestidosMasVendidos(fechaInicio, fechaFin),
                ReportesController.getTopClientes(fechaInicio, fechaFin),
                ReportesController.getTopVendedores(fechaInicio, fechaFin),
                ReportesController.getVentasPorFormaPago(fechaInicio, fechaFin)
            ]);

            // Capturar gráficos con fondo blanco
            const canvasIds = ['chartIngresos', 'chartVestidos', 'chartClientes', 'chartVendedores', 'chartFormaPago'];
            const titulosGraficos = ['Ingresos por Período', 'Top 10 Vestidos', 'Top 10 Clientes', 'Top 10 Vendedores', 'Ventas por Forma de Pago'];
            const graficos = [];
            for (let i = 0; i < canvasIds.length; i++) {
                const canvas = document.getElementById(canvasIds[i]);
                const instance = this.graficosInstancias[canvasIds[i]];
                if (canvas && canvas.style.display !== 'none' && instance) {
                    const animOriginal = instance.options.animation;
                    instance.options.animation = false;
                    instance.options.plugins.legend.labels.color = '#000000';
                    instance.update();
                    const tmp = document.createElement('canvas');
                    tmp.width = canvas.width;
                    tmp.height = canvas.height;
                    const tmpCtx = tmp.getContext('2d');
                    tmpCtx.fillStyle = '#ffffff';
                    tmpCtx.fillRect(0, 0, tmp.width, tmp.height);
                    tmpCtx.drawImage(canvas, 0, 0);
                    graficos.push({ titulo: titulosGraficos[i], dataUrl: tmp.toDataURL('image/png') });
                    instance.options.animation = animOriginal;
                    instance.options.plugins.legend.labels.color = '#e2e8f0';
                    instance.update();
                }
            }

            // Formatear datos
            const totalIng = rawFormaPago.reduce((s, r) => s + parseFloat(r.total_ingresos || 0), 0);
            const datos = {
                periodo,
                resumenIngresos: {
                    total_ventas: rawResumenIngresos.total_ventas || 0,
                    total_ingresos: formatCurrency(rawResumenIngresos.total_ingresos || 0),
                    promedio_venta: formatCurrency(rawResumenIngresos.promedio_venta || 0),
                    venta_minima: formatCurrency(rawResumenIngresos.venta_minima || 0),
                    venta_maxima: formatCurrency(rawResumenIngresos.venta_maxima || 0)
                },
                ingresos: rawIngresos.map(r => ({
                    fecha: formatFechaCorta(r.fecha),
                    cantidad_ventas: r.cantidad_ventas,
                    total_ingresos: formatCurrency(parseFloat(r.total_ingresos || 0))
                })),
                vestidos: rawVestidos.map(r => ({
                    codigo: r.codigo,
                    nombre: r.nombre,
                    categoria_nombre: r.categoria_nombre || 'Sin categoría',
                    total_vendido: r.total_vendido,
                    total_ingresos: formatCurrency(parseFloat(r.total_ingresos || 0))
                })),
                clientes: rawClientes.map(r => ({
                    nombre: `${r.nombre} ${r.apellido}`,
                    total_compras: r.total_compras,
                    total_gastado: formatCurrency(parseFloat(r.total_gastado || 0))
                })),
                vendedores: rawVendedores.map(r => ({
                    usuario_venta: r.usuario_venta,
                    total_ventas: r.total_ventas,
                    total_ingresos: formatCurrency(parseFloat(r.total_ingresos || 0))
                })),
                formaPago: rawFormaPago.map(r => ({
                    forma_pago: r.forma_pago,
                    cantidad_ventas: r.cantidad_ventas,
                    total_ingresos: formatCurrency(parseFloat(r.total_ingresos || 0)),
                    porcentaje: totalIng > 0 ? ((parseFloat(r.total_ingresos || 0) / totalIng) * 100).toFixed(1) + '%' : '0.0%'
                })),
                graficos
            };

            const filePath = formato === 0
                ? await PDFGenerator.generarReporteTodo(datos)
                : await PDFGenerator.generarExcelTodo(datos);
            if (filePath) showAlert(`Reporte exportado: ${filePath}`, 'success');
        } catch (error) {
            console.error('Error generando reporte completo:', error);
            showAlert('Error al generar el reporte completo', 'error');
        }
    },

    async exportarGraficos() {
        try {
            const fechaInicio = document.getElementById('fechaInicioReporte').value;
            const fechaFin = document.getElementById('fechaFinReporte').value;
            const periodo = fechaInicio && fechaFin
                ? `${formatFechaCorta(fechaInicio)} al ${formatFechaCorta(fechaFin)}`
                : 'Todo';

            const canvasIds = ['chartIngresos', 'chartVestidos', 'chartClientes', 'chartVendedores', 'chartFormaPago'];
            const titulos = ['Ingresos por Período', 'Top 10 Vestidos', 'Top 10 Clientes', 'Top 10 Vendedores', 'Ventas por Forma de Pago'];

            const activos = canvasIds
                .map((id, i) => ({ id, titulo: titulos[i], canvas: document.getElementById(id) }))
                .filter(item => item.canvas && item.canvas.style.display !== 'none' && this.graficosInstancias[item.id]);

            if (activos.length === 0) {
                showAlert('No hay gráficos para exportar', 'warning');
                return;
            }

            const capturarConFondoBlanco = (canvas) => {
                const tmp = document.createElement('canvas');
                tmp.width = canvas.width;
                tmp.height = canvas.height;
                const tmpCtx = tmp.getContext('2d');
                tmpCtx.fillStyle = '#ffffff';
                tmpCtx.fillRect(0, 0, tmp.width, tmp.height);
                tmpCtx.drawImage(canvas, 0, 0);
                return tmp.toDataURL('image/png');
            };

            const imagenes = [];
            for (const item of activos) {
                const chart = this.graficosInstancias[item.id];
                // Deshabilitar animación y cambiar color a negro → update sincrónico
                const animOriginal = chart.options.animation;
                chart.options.animation = false;
                chart.options.plugins.legend.labels.color = '#000000';
                chart.update();
                imagenes.push({ titulo: item.titulo, dataUrl: capturarConFondoBlanco(item.canvas) });
                // Restaurar
                chart.options.animation = animOriginal;
                chart.options.plugins.legend.labels.color = '#e2e8f0';
                chart.update();
            }

            const pdfPath = await PDFGenerator.generarGraficosReporte(imagenes, periodo);
            showAlert(`Gráficos exportados: ${pdfPath}`, 'success');
        } catch (error) {
            console.error('Error exportando gráficos:', error);
            showAlert('Error al exportar los gráficos', 'error');
        }
    },

    renderTopVestidos() {
        const datos = this.topVestidosData;
        const tbody = document.getElementById('topVestidosBody');
        if (!tbody) return;
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Sin datos</td></tr>';
            document.getElementById('paginacionTopVestidos').style.display = 'none';
            return;
        }
        const totalPaginas = Math.ceil(datos.length / this.itemsPorPaginaTop);
        const inicio = (this.paginaTopVestidos - 1) * this.itemsPorPaginaTop;
        const pagina = datos.slice(inicio, inicio + this.itemsPorPaginaTop);
        tbody.innerHTML = pagina.map((v, i) => `
            <tr>
                <td><strong>#${inicio + i + 1}</strong></td>
                <td>${v.codigo}</td>
                <td>${v.nombre}</td>
                <td><span class="badge badge-info">${v.categoria_nombre || 'Sin categoría'}</span></td>
                <td>${v.total_vendido}</td>
                <td>${formatCurrency(parseFloat(v.total_ingresos || 0))}</td>
            </tr>
        `).join('');
        const pag = document.getElementById('paginacionTopVestidos');
        pag.style.display = 'block';
        document.getElementById('paginaTopVestidos').textContent = this.paginaTopVestidos;
        document.getElementById('totalPaginasTopVestidos').textContent = totalPaginas;
        const soloUnaV = totalPaginas <= 1;
        document.getElementById('btnAntTopVestidos').disabled = this.paginaTopVestidos === 1 || soloUnaV;
        document.getElementById('btnSigTopVestidos').disabled = this.paginaTopVestidos === totalPaginas || soloUnaV;
    },

    renderTopClientes() {
        const datos = this.topClientesData;
        const tbody = document.getElementById('topClientesBody');
        if (!tbody) return;
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Sin datos</td></tr>';
            document.getElementById('paginacionTopClientes').style.display = 'none';
            return;
        }
        const totalPaginas = Math.ceil(datos.length / this.itemsPorPaginaTop);
        const inicio = (this.paginaTopClientes - 1) * this.itemsPorPaginaTop;
        const pagina = datos.slice(inicio, inicio + this.itemsPorPaginaTop);
        tbody.innerHTML = pagina.map((c, i) => `
            <tr>
                <td><strong>#${inicio + i + 1}</strong></td>
                <td>${c.nombre} ${c.apellido}</td>
                <td>${c.correo || '-'}</td>
                <td>${c.total_compras}</td>
                <td>${formatCurrency(parseFloat(c.total_gastado || 0))}</td>
            </tr>
        `).join('');
        const pag = document.getElementById('paginacionTopClientes');
        pag.style.display = 'block';
        document.getElementById('paginaTopClientes').textContent = this.paginaTopClientes;
        document.getElementById('totalPaginasTopClientes').textContent = totalPaginas;
        const soloUnaC = totalPaginas <= 1;
        document.getElementById('btnAntTopClientes').disabled = this.paginaTopClientes === 1 || soloUnaC;
        document.getElementById('btnSigTopClientes').disabled = this.paginaTopClientes === totalPaginas || soloUnaC;
    },

    renderTopVendedores() {
        const datos = this.topVendedoresData;
        const tbody = document.getElementById('topVendedoresBody');
        if (!tbody) return;
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">Sin datos</td></tr>';
            document.getElementById('paginacionTopVendedores').style.display = 'none';
            return;
        }
        const totalPaginas = Math.ceil(datos.length / this.itemsPorPaginaTop);
        const inicio = (this.paginaTopVendedores - 1) * this.itemsPorPaginaTop;
        const pagina = datos.slice(inicio, inicio + this.itemsPorPaginaTop);
        tbody.innerHTML = pagina.map((v, i) => `
            <tr>
                <td><strong>#${inicio + i + 1}</strong></td>
                <td>👤 ${v.usuario_venta}</td>
                <td>${v.total_ventas}</td>
                <td>${formatCurrency(parseFloat(v.total_ingresos || 0))}</td>
            </tr>
        `).join('');
        const pag = document.getElementById('paginacionTopVendedores');
        pag.style.display = 'block';
        document.getElementById('paginaTopVendedores').textContent = this.paginaTopVendedores;
        document.getElementById('totalPaginasTopVendedores').textContent = totalPaginas;
        const soloUnaVend = totalPaginas <= 1;
        document.getElementById('btnAntTopVendedores').disabled = this.paginaTopVendedores === 1 || soloUnaVend;
        document.getElementById('btnSigTopVendedores').disabled = this.paginaTopVendedores === totalPaginas || soloUnaVend;
    },

    cambiarPaginaTop(tipo, nuevaPagina) {
        const mapaData = { vestidos: 'topVestidosData', clientes: 'topClientesData', vendedores: 'topVendedoresData' };
        const mapaRender = { vestidos: 'renderTopVestidos', clientes: 'renderTopClientes', vendedores: 'renderTopVendedores' };
        const mapaPagina = { vestidos: 'paginaTopVestidos', clientes: 'paginaTopClientes', vendedores: 'paginaTopVendedores' };
        const totalPaginas = Math.ceil(this[mapaData[tipo]].length / this.itemsPorPaginaTop);
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
        this[mapaPagina[tipo]] = nuevaPagina;
        this[mapaRender[tipo]]();
    }
};

function formatFechaCorta(fecha) {
    const str = (fecha instanceof Date) ? fecha.toISOString().split('T')[0] : String(fecha).split('T')[0];
    const [year, month, day] = str.split('-');
    return `${day}/${month}/${year}`;
}