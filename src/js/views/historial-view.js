const HistorialView = {
    paginaActual: 1,
    itemsPorPagina: 10,
    totalVentas: 0,

    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Historial de Ventas</h2>
                        <button class="btn btn-primary" onclick="HistorialView.exportarPorPeriodo()">Exportar por periodo</button>
                    </div>

                    <div class="form-grid" style="margin-bottom: 25px; grid-template-columns: repeat(auto-fit, minmax(175px, 1fr)); gap: 12px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="margin-bottom: 4px; font-size: 12px;">Buscar</label>
                            <input type="text" id="buscarVenta" placeholder="N° de venta o cliente..." style="padding: 12px 10px; font-size: 13px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="margin-bottom: 4px; font-size: 12px;">Fecha de inicio</label>
                            <input type="date" id="filtroFechaInicioHist" min="2020-01-01" max="2050-12-31" style="padding: 12px 10px; font-size: 13px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="margin-bottom: 4px; font-size: 12px;">Fecha de fin</label>
                            <input type="date" id="filtroFechaFinHist" min="2020-01-01" max="2050-12-31" style="padding: 12px 10px; font-size: 13px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="margin-bottom: 4px; font-size: 12px;">Período rápido</label>
                            <select id="periodoRapidoHist" onchange="HistorialView.aplicarPeriodo(this.value)" style="padding: 12px 10px; font-size: 13px;">
                                <option value="hoy">Hoy</option>
                                <option value="semana">1 semana</option>
                                <option value="mes">1 mes</option>
                                <option value="todo">Todo</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label style="margin-bottom: 4px; font-size: 12px;">Forma de pago</label>
                            <select id="filtroFormaPagoHist" style="padding: 12px 10px; font-size: 13px;">
                                <option value="">Todas las formas</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; align-items: flex-end; gap: 8px; margin-bottom: 0;">
                            <button class="btn btn-primary" onclick="HistorialView.cargarVentas(1)" style="padding: 13px 15px; font-size: 12px;">Filtrar</button>
                            <button class="btn btn-secondary" onclick="HistorialView.limpiarFiltros()" style="padding: 13px 15px; font-size: 12px;">Limpiar</button>
                        </div>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>N° Venta</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Forma de Pago</th>
                                    <th>Usuario</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="historialVentasBody">
                                <tr><td colspan="7">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div id="paginacionHistorial" style="margin-top: 10px; text-align: center;"></div>
                </div>
            </div>
            <div id="modalDetalleVenta" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Detalle de Venta</h3>
                        <button class="modal-close" onclick="hideModal('modalDetalleVenta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div id="detalleVentaInfo"></div>
                        
                        <h4 style="margin-top: 20px; margin-bottom: 10px; color: #ffffff;">Productos Vendidos</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody id="detalleProductosBody"></tbody>
                            </table>
                        </div>

                        <div style="text-align: right; margin-top: 20px;">
                            <h3 style="color: #764ba2;" id="totalDetalleVenta">TOTAL: $0.00</h3>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="HistorialView.reimprimirComprobante()">Reimprimir Comprobante</button>
                        <button class="btn btn-secondary" onclick="hideModal('modalDetalleVenta')">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        // Cargar formas de pago
        const formasPago = await VentasController.getFormasPago();
        const select = document.getElementById('filtroFormaPagoHist');
        formasPago.forEach(fp => {
            select.innerHTML += `<option value="${fp.id_forma_pago}">${fp.nombre}</option>`;
        });

        // Establecer período por defecto: "Hoy"
        document.getElementById('periodoRapidoHist').value = 'hoy';
        this.aplicarPeriodo('hoy');

        // Event listeners
        document.getElementById('buscarVenta').addEventListener('input', () => this.cargarVentas(1));

        await this.cargarVentas(1);
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
        } else if (valor === 'todo') {
            inicio = new Date(2020, 0, 1);
        }
        document.getElementById('filtroFechaInicioHist').value = fechaLocalStr(inicio);
        document.getElementById('filtroFechaFinHist').value = fechaLocalStr(hoy);
    },

    limpiarFiltros() {
        const hoy = new Date();
        document.getElementById('buscarVenta').value = '';
        document.getElementById('periodoRapidoHist').value = 'hoy';
        document.getElementById('filtroFormaPagoHist').value = '';
        this.aplicarPeriodo('hoy');
        this.cargarVentas(1);
    },

    async cargarVentas(pagina = 1) {
        this.paginaActual = pagina;

        const fechaInicio = document.getElementById('filtroFechaInicioHist').value;
        const fechaFin = document.getElementById('filtroFechaFinHist').value;
        const formaPago = document.getElementById('filtroFormaPagoHist').value;
        const busqueda = document.getElementById('buscarVenta').value.trim();

        const filtros = {
            fechaInicio,
            fechaFin,
            formaPago: formaPago || null,
            busqueda: busqueda || null,
            limit: this.itemsPorPagina,
            offset: (pagina - 1) * this.itemsPorPagina
        };

        this.totalVentas = await VentasController.countVentas(filtros);
        const ventas = await VentasController.getAllVentas(filtros);
        this.renderVentas(ventas);
        this.renderPaginacion();
    },

    renderVentas(ventas) {
        const tbody = document.getElementById('historialVentasBody');
        
        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No se encontraron ventas</td></tr>';
            return;
        }

        tbody.innerHTML = ventas.map(v => `
            <tr>
                <td><strong>#${v.id_venta}</strong></td>
                <td>${v.nombre_cliente || 'Cliente anónimo'}</td>
                <td><strong>${formatCurrency(v.total)}</strong>${v.descuento > 0 ? ` <small style="color:#888">(${parseInt(v.descuento)}% dto)</small>` : ''}</td>
                <td><span class="badge badge-info">${v.forma_pago}</span></td>
                <td>${v.usuario_venta}</td>
                <td>${formatDate(v.fecha_venta)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-small btn-primary" onclick="HistorialView.verDetalle(${v.id_venta})">
                            👁️ Ver Detalle
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderPaginacion() {
        const totalPaginas = Math.ceil(this.totalVentas / this.itemsPorPagina) || 1;
        const soloUna = totalPaginas <= 1;
        const paginacion = document.getElementById('paginacionHistorial');
        paginacion.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="HistorialView.cambiarPagina(1)" title="Primera página" ${this.paginaActual === 1 || soloUna ? 'disabled' : ''}>⏮</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="HistorialView.cambiarPagina(HistorialView.paginaActual - 1)" ${this.paginaActual === 1 || soloUna ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 10px; font-weight: bold; color: #e2e8f0;">${this.paginaActual} de ${totalPaginas}</span>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="HistorialView.cambiarPagina(HistorialView.paginaActual + 1)" ${this.paginaActual === totalPaginas || soloUna ? 'disabled' : ''}>Siguiente</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="HistorialView.irUltimaPagina()" title="Última página" ${this.paginaActual === totalPaginas || soloUna ? 'disabled' : ''}>⏭</button>
                <select onchange="HistorialView.cambiarItemsPorPagina(this.value)" style="margin-left: 6px; padding: 5px 8px; font-size: 12px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px;">
                    <option value="5" ${this.itemsPorPagina === 5 ? 'selected' : ''}>5/pág.</option>
                    <option value="10" ${this.itemsPorPagina === 10 ? 'selected' : ''}>10/pág.</option>
                    <option value="15" ${this.itemsPorPagina === 15 ? 'selected' : ''}>15/pág.</option>
                    <option value="20" ${this.itemsPorPagina === 20 ? 'selected' : ''}>20/pág.</option>
                </select>
            </div>
        `;
    },

    irUltimaPagina() {
        const totalPaginas = Math.ceil(this.totalVentas / this.itemsPorPagina) || 1;
        this.cargarVentas(totalPaginas);
    },

    cambiarItemsPorPagina(valor) {
        this.itemsPorPagina = parseInt(valor);
        this.cargarVentas(1);
    },

    cambiarPagina(nuevaPagina) {
        const totalPaginas = Math.ceil(this.totalVentas / this.itemsPorPagina) || 1;
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
        this.cargarVentas(nuevaPagina);
    },

    async exportarPorPeriodo() {
        try {
            const formato = await PDFGenerator.pedirFormato();
            if (formato === 2) return;

            const fechaInicio = document.getElementById('filtroFechaInicioHist').value;
            const fechaFin = document.getElementById('filtroFechaFinHist').value;
            const periodoLabel = fechaInicio && fechaFin
                ? `${formatFechaCorta(fechaInicio)} al ${formatFechaCorta(fechaFin)}`
                : fechaInicio ? `Desde ${formatFechaCorta(fechaInicio)}` : 'Todo';

            const datos = await VentasController.getVentasConDetallesParaReporte({ fechaInicio, fechaFin });

            if (!datos || datos.length === 0) {
                showAlert('No hay ventas en el período seleccionado', 'warning');
                return;
            }

            const filePath = formato === 0
                ? await PDFGenerator.generarHistorialVentas('Historial de Ventas', periodoLabel, datos)
                : await PDFGenerator.generarExcelHistorial('Historial de Ventas', periodoLabel, datos);
            if (filePath) showAlert(`Reporte exportado: ${filePath}`, 'success');
        } catch (error) {
            console.error('Error exportando historial:', error);
            showAlert('Error al exportar el historial', 'error');
        }
    },

    async verDetalle(idVenta) {
        const { venta, detalles } = await VentasController.getVenta(idVenta);
        
        if (!venta) {
            showAlert('Venta no encontrada', 'error');
            return;
        }

        // Guardar para reimprimir
        this.ventaActual = { venta, detalles };

        // Mostrar información de la venta
        document.getElementById('detalleVentaInfo').innerHTML = `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <strong>N° de Venta:</strong> #${venta.id_venta}
                    </div>
                    <div>
                        <strong>Fecha:</strong> ${formatDate(venta.fecha_venta)}
                    </div>
                    <div>
                        <strong>Cliente:</strong> ${venta.nombre_cliente || 'Cliente anónimo'}
                    </div>
                    <div>
                        <strong>Forma de Pago:</strong> ${venta.forma_pago}
                    </div>
                    <div>
                        <strong>Atendido por:</strong> ${venta.usuario_venta}
                    </div>
                    <div>
                        <strong>Correo enviado:</strong> ${venta.correo_enviado ? 'Sí' : 'No'}
                    </div>
                </div>
            </div>
        `;

        // Mostrar productos
        const tbody = document.getElementById('detalleProductosBody');
        tbody.innerHTML = detalles.map(d => `
            <tr>
                <td>${d.codigo_vestido}</td>
                <td>${d.nombre_vestido}</td>
                <td>${d.cantidad}</td>
                <td>${formatCurrency(d.precio_unitario)}</td>
                <td><strong>${formatCurrency(d.subtotal)}</strong></td>
            </tr>
        `).join('');

        document.getElementById('totalDetalleVenta').textContent = `TOTAL: ${formatCurrency(venta.total)}${venta.descuento > 0 ? ` (${parseInt(venta.descuento)}% de descuento)` : ''}`;

        showModal('modalDetalleVenta');
    },

    async reimprimirComprobante() {
        if (!this.ventaActual) return;

        try {
            const { venta, detalles } = this.ventaActual;
            const pdfPath = await PDFGenerator.generarComprobante(venta, detalles);
            if (pdfPath && pdfPath !== 'printed') {
                showAlert('Comprobante guardado exitosamente', 'success');
            }
        } catch (error) {
            console.error('Error generando comprobante:', error);
            showAlert('Error al generar el comprobante', 'error');
        }
    },

};
