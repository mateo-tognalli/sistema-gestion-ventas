const OperacionesView = {
    vestidosTodos: [],
    clientesData: [],
    clienteSeleccionado: null,
    paginaVestidos: 1,
    vestidosPorPagina: 5,
    paginaCarrito: 1,
    itemsCarritoPorPagina: 3,

    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Nueva Venta</h2>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                        <!-- Sección de búsqueda y productos -->
                        <div>
                            <div class="form-group">
                                <label>Buscar Vestido</label>
                                <input type="text" id="buscarVestidoVenta" placeholder="Buscar por nombre, código o color...">
                            </div>

                            <div id="resultadosVestidos" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
                            </div>
                        </div>

                        <!-- Carrito -->
                        <div>
                            <h3 style="margin-bottom: 15px; color: #ffffff;">Carrito de Compra</h3>
                            <div id="carritoVentas" style="border: 2px solid #334155; border-radius: 10px; padding: 15px; min-height: 400px;">
                                <div class="empty-state">
                                    <div class="empty-state-icon">🛒</div>
                                    <h3>Carrito vacío</h3>
                                    <p>Busca y agrega vestidos para vender</p>
                                </div>
                            </div>

                            <div id="totalVenta" style="margin-top: 0px; padding: 15px; background: #1e293b; border-radius: 8px; display: none;">
                                <h3 style="text-align: right; color: #06b6d4; font-size: 24px;" id="montoTotal">$0.00</h3>
                            </div>

                            <button class="btn btn-success" style="width: 100%; margin-top: 0px; display: none;" id="btnFinalizarVenta" onclick="OperacionesView.abrirFinalizarVenta()">
                                Finalizar Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Finalizar Venta -->
            <div id="modalFinalizarVenta" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Finalizar Venta</h3>
                        <button class="modal-close" onclick="hideModal('modalFinalizarVenta')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formFinalizarVenta">
                            <div class="form-group">
                                <label>Cliente (Opcional)</label>
                                <div style="position: relative;">
                                    <input type="text" id="clienteVentaInput" placeholder="Escribí un nombre o dejá vacío para anónimo..." autocomplete="off" style="width: 100%; box-sizing: border-box;">
                                    <div id="clienteDropdown" style="display:none; position:absolute; z-index:1000; left:0; right:0; background:#1e293b; border:1px solid #334155; border-radius:0 0 6px 6px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.3); top:100%;"></div>
                                </div>
                            </div>
                            <div id="clienteInfoGroup" style="display:none;">
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                    <div class="form-group">
                                        <label style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:block;">Teléfono</label>
                                        <input type="text" id="clienteTelDisplay" readonly style="background:#334155; color:#94a3b8; cursor:default;">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:block;">Dirección</label>
                                        <input type="text" id="clienteDirDisplay" readonly style="background:#334155; color:#94a3b8; cursor:default;">
                                    </div>
                                </div>
                            </div>

                            <!-- Formulario para cliente nuevo (no registrado) -->
                            <div id="clienteNuevoGroup" style="display:none; margin-bottom:16px;">
                                <div style="background:#0d1f35; border:1px solid #22d3ee; border-radius:8px; padding:12px;">
                                    <p style="color:#22d3ee; font-size:12px; margin:0 0 10px 0; font-weight:bold;">✨ Cliente nuevo — completá los datos para registrarlo al confirmar la venta</p>
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                        <div class="form-group">
                                            <label style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:block;">Teléfono</label>
                                            <input type="tel" id="nuevoClienteTel" inputmode="numeric" maxlength="12" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,12)" placeholder="Ej: 3413001234">
                                        </div>
                                        <div class="form-group">
                                            <label style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:block;">Dirección</label>
                                            <input type="text" id="nuevoClienteDir" placeholder="Ej: San Martín 456">
                                        </div>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label style="font-size:11px; color:#94a3b8; margin-bottom:4px; display:block;">Correo Electrónico *</label>
                                        <input type="email" id="nuevoClienteEmail" placeholder="cliente@ejemplo.com" oninput="OperacionesView.sincronizarEmailNuevoCliente(this.value)">
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Forma de Pago *</label>
                                <select id="formaPagoVenta" required>
                                    <option value="">Seleccionar...</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Descuento</label>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <input type="number" id="descuentoVenta" min="0" max="100" step="5" value="0" oninput="OperacionesView.actualizarTotalConDescuento()" style="width: 80px;">
                                    <span style="color: #ffffff;">%</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; justify-content: flex-start;">
                                    <label for="enviarEmailCheckbox" style="margin: 0; cursor: pointer; user-select: none;">Enviar comprobante por correo</label>
                                    <input type="checkbox" id="enviarEmailCheckbox" style="width: 18px; height: 18px; margin: 0; flex-shrink: 0;">
                                </div>
                            </div>

                            <div class="form-group" id="emailGroup" style="display: none;">
                                <label>Correo Electrónico</label>
                                <input type="email" id="emailComprobante">
                            </div>

                            <div style="padding: 15px; background: #0f172a; border-radius: 8px; margin-top: 15px; border: 1px solid #334155;">
                                <h4 style="color: #ffffff;">Resumen de la Venta</h4>
                                <div id="resumenVenta"></div>
                                <hr>
                                <h3 style="text-align: right; color: #06b6d4;" id="totalFinal">TOTAL: $0.00</h3>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="hideModal('modalFinalizarVenta')">Cancelar</button>
                        <button class="btn btn-success" onclick="OperacionesView.confirmarVenta()">Confirmar Venta</button>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await this.cargarClientes();
        await this.cargarFormasPago();
        
        document.getElementById('buscarVestidoVenta').addEventListener('input', (e) => {
            this.buscarVestidos(e.target.value);
        });

        document.getElementById('enviarEmailCheckbox').addEventListener('change', (e) => {
            document.getElementById('emailGroup').style.display = e.target.checked ? 'block' : 'none';
        });

        await this.buscarVestidos('');
        this.actualizarCarrito();
    },

    async cargarClientes() {
        this.clientesData = await ClientesController.getAllClientes();
        this.clienteSeleccionado = null;

        const input = document.getElementById('clienteVentaInput');
        const dropdown = document.getElementById('clienteDropdown');

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            this.clienteSeleccionado = null;
            document.getElementById('clienteInfoGroup').style.display = 'none';
            document.getElementById('emailComprobante').value = '';

            if (!q) {
                dropdown.style.display = 'none';
                document.getElementById('clienteNuevoGroup').style.display = 'none';
                return;
            }

            const matches = this.clientesData
                .filter(c => `${c.nombre} ${c.apellido}`.toLowerCase().includes(q) ||
                    (c.telefono && c.telefono.includes(q)))
                .slice(0, 5);

            if (matches.length === 0) {
                dropdown.style.display = 'none';
                document.getElementById('clienteNuevoGroup').style.display = 'block';
                return;
            }

            document.getElementById('clienteNuevoGroup').style.display = 'none';
            dropdown.innerHTML = matches.map(c => {
                const data = JSON.stringify({
                    id_cliente: c.id_cliente,
                    nombre: c.nombre,
                    apellido: c.apellido,
                    telefono: c.telefono || '',
                    correo: c.correo || '',
                    direccion: c.direccion || ''
                }).replace(/'/g, "&#39;");
                return `<div style="padding:10px 14px; cursor:pointer; border-bottom:1px solid #334155; color:#e2e8f0;"
                    onmouseover="this.style.background='#334155'" onmouseout="this.style.background=''"
                    onclick='OperacionesView.seleccionarCliente(${data})'>
                    <strong>${c.nombre} ${c.apellido}</strong>
                    ${c.telefono ? `<span style="color:#94a3b8; font-size:12px;"> · ${c.telefono}</span>` : ''}
                </div>`;
            }).join('');
            dropdown.style.display = 'block';
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
                const q = input.value.trim();
                if (q && !this.clienteSeleccionado) {
                    document.getElementById('clienteNuevoGroup').style.display = 'block';
                }
            }, 200);
        });
    },

    seleccionarCliente(cliente) {
        this.clienteSeleccionado = cliente;
        document.getElementById('clienteVentaInput').value = `${cliente.nombre} ${cliente.apellido}`;
        document.getElementById('clienteDropdown').style.display = 'none';
        document.getElementById('clienteTelDisplay').value = cliente.telefono || 'Sin teléfono';
        document.getElementById('clienteDirDisplay').value = cliente.direccion || 'Sin dirección';
        document.getElementById('clienteInfoGroup').style.display = 'block';
        document.getElementById('clienteNuevoGroup').style.display = 'none';
        // Auto-rellenar email y mostrar campo si el cliente tiene correo
        if (cliente.correo) {
            document.getElementById('emailComprobante').value = cliente.correo;
            document.getElementById('enviarEmailCheckbox').checked = true;
            document.getElementById('emailGroup').style.display = 'block';
        } else {
            document.getElementById('emailComprobante').value = '';
        }
    },

    async cargarFormasPago() {
        const formasPago = await VentasController.getFormasPago();
        const select = document.getElementById('formaPagoVenta');
        formasPago.forEach(fp => {
            select.innerHTML += `<option value="${fp.id_forma_pago}">${fp.nombre}</option>`;
        });
    },

    sincronizarEmailNuevoCliente(email) {
        document.getElementById('emailComprobante').value = email;
    },

    async buscarVestidos(termino) {
        let vestidos;
        if (termino.trim()) {
            vestidos = await VestidosController.buscarVestidos(termino);
        } else {
            vestidos = await VestidosController.getAllVestidos();
        }

        this.vestidosTodos = vestidos.map(v => ({ ...v, stock_original: v.stock }));
        this.paginaVestidos = 1;
        this.renderVestidosPagina();
    },

    renderVestidosPagina() {
        const container = document.getElementById('resultadosVestidos');
        const vestidos = this.vestidosTodos.filter(v => v.stock > 0);

        if (vestidos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #94a3b8;">No se encontraron vestidos</p>';
            return;
        }

        const totalPaginas = Math.ceil(vestidos.length / this.vestidosPorPagina) || 1;
        const inicio = (this.paginaVestidos - 1) * this.vestidosPorPagina;
        const fin = inicio + this.vestidosPorPagina;
        const pagina = vestidos.slice(inicio, fin);

        const items = pagina.map(v => `
                <div style="border: 1px solid #334155; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #ffffff;">${v.nombre}</strong>
                    <p style="margin: 5px 0; color: #94a3b8; font-size: 13px;">
                        Código: ${v.codigo} | Talle: ${v.talle} | Color: ${v.color}
                    </p>
                    <p style="margin: 5px 0;">
                        <span class="badge badge-info">${v.categoria_nombre}</span>
                        <span class="badge badge-success">Stock: ${v.stock}</span>
                    </p>
                    <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #06b6d4;">
                        ${formatCurrency(v.precio)}
                    </p>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button class="btn btn-danger" style="padding: 7px 14px; font-size: 18px; font-weight: bold; line-height: 1;" onclick="OperacionesView.restarDelCarrito(${v.id_vestido})">− Quitar 🛒</button>
                    <button class="btn btn-primary" style="padding: 7px 14px; font-size: 18px; font-weight: bold; line-height: 1;" onclick='OperacionesView.agregarAlCarrito(${JSON.stringify({...v, stock: v.stock_original ?? v.stock}).replace(/'/g, "&apos;")})'>+ Agregar 🛒</button>
                </div>
            </div>
        `).join('');

        const soloUna = totalPaginas <= 1;
        const paginacion = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                <button class="btn btn-secondary btn-small" style="padding: 5px 10px;"
                    onclick="OperacionesView.cambiarPaginaVestidos(1)"
                    ${soloUna || this.paginaVestidos === 1 ? 'disabled' : ''} title="Primera página">⏮</button>
                <button class="btn btn-secondary btn-small" style="padding: 5px 10px;"
                    onclick="OperacionesView.cambiarPaginaVestidos(${this.paginaVestidos - 1})"
                    ${soloUna || this.paginaVestidos === 1 ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 8px; font-weight: bold; font-size: 13px; color: #e2e8f0;">
                    ${this.paginaVestidos} de ${totalPaginas}
                </span>
                <button class="btn btn-secondary btn-small" style="padding: 5px 10px;"
                    onclick="OperacionesView.cambiarPaginaVestidos(${this.paginaVestidos + 1})"
                    ${soloUna || this.paginaVestidos === totalPaginas ? 'disabled' : ''}>Siguiente</button>
                <button class="btn btn-secondary btn-small" style="padding: 5px 10px;"
                    onclick="OperacionesView.cambiarPaginaVestidos(${totalPaginas})"
                    ${soloUna || this.paginaVestidos === totalPaginas ? 'disabled' : ''} title="Última página">⏭</button>
                <select onchange="OperacionesView.cambiarVestidosPorPagina(this.value)" style="padding: 4px 8px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; font-size: 12px;">
                    <option value="5" ${this.vestidosPorPagina===5?'selected':''}>5/pág.</option>
                    <option value="10" ${this.vestidosPorPagina===10?'selected':''}>10/pág.</option>
                    <option value="15" ${this.vestidosPorPagina===15?'selected':''}>15/pág.</option>
                    <option value="20" ${this.vestidosPorPagina===20?'selected':''}>20/pág.</option>
                </select>
            </div>
        `;

        container.innerHTML = items + paginacion;
    },

    cambiarPaginaVestidos(nuevaPagina) {
        const totalPaginas = Math.ceil(this.vestidosTodos.filter(v => v.stock > 0).length / this.vestidosPorPagina);
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
        this.paginaVestidos = nuevaPagina;
        this.renderVestidosPagina();
    },

    cambiarVestidosPorPagina(valor) {
        this.vestidosPorPagina = parseInt(valor);
        this.paginaVestidos = 1;
        this.renderVestidosPagina();
    },

    agregarAlCarrito(vestido) {
        try {
            if (vestido.stock <= 0) {
                showAlert('Este vestido no tiene stock disponible', 'error');
                return;
            }

            VentasController.agregarAlCarrito(vestido, 1);

            // Reducir stock local
            const idx = this.vestidosTodos.findIndex(v => v.id_vestido === vestido.id_vestido);
            if (idx !== -1) this.vestidosTodos[idx].stock--;

            this.renderVestidosPagina();
            this.actualizarCarrito();
            showAlert(`${vestido.nombre} agregado al carrito`, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    },

    restarDelCarrito(idVestido) {
        const item = VentasController.carrito.find(i => i.id_vestido === idVestido);
        if (!item) return;

        VentasController.restarDelCarrito(idVestido);

        // Devolver 1 unidad al stock local
        const idx = this.vestidosTodos.findIndex(v => v.id_vestido === idVestido);
        if (idx !== -1) {
            this.vestidosTodos[idx].stock++;
        } else {
            this.vestidosTodos.push({ ...item, nombre: item.nombre_vestido, codigo: item.codigo_vestido, precio: item.precio_unitario, stock: 1, stock_original: item.stock_disponible ?? 1 });
        }

        this.renderVestidosPagina();
        this.actualizarCarrito();
    },

    quitarDelCarrito(idVestido) {
        const item = VentasController.carrito.find(i => i.id_vestido === idVestido);
        VentasController.quitarDelCarrito(idVestido);

        // Devolver toda la cantidad al stock local
        if (item) {
            const idx = this.vestidosTodos.findIndex(v => v.id_vestido === idVestido);
            if (idx !== -1) {
                this.vestidosTodos[idx].stock += item.cantidad;
            } else {
                this.vestidosTodos.push({ ...item, nombre: item.nombre_vestido, codigo: item.codigo_vestido, precio: item.precio_unitario, stock: item.cantidad, stock_original: item.stock_disponible ?? item.cantidad });
            }
        }

        this.renderVestidosPagina();
        this.actualizarCarrito();
    },

    actualizarCarrito() {
        const carritoDiv = document.getElementById('carritoVentas');
        const totalDiv = document.getElementById('totalVenta');
        const btnFinalizar = document.getElementById('btnFinalizarVenta');
        const montoTotal = document.getElementById('montoTotal');

        if (VentasController.carrito.length === 0) {
            carritoDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <h3>Carrito vacío</h3>
                    <p>Busca y agrega vestidos para vender</p>
                </div>
            `;
            totalDiv.style.display = 'none';
            btnFinalizar.style.display = 'none';
            return;
        }

        // Resetear a página 1 si el carrito cambió
        if (this.paginaCarrito > Math.ceil(VentasController.carrito.length / this.itemsCarritoPorPagina)) {
            this.paginaCarrito = 1;
        }

        const totalPaginas = Math.ceil(VentasController.carrito.length / this.itemsCarritoPorPagina);
        const inicio = (this.paginaCarrito - 1) * this.itemsCarritoPorPagina;
        const fin = inicio + this.itemsCarritoPorPagina;
        const paginaItems = VentasController.carrito.slice(inicio, fin);

        const items = paginaItems.map(item => `
            <div style="border-bottom: 1px solid #334155; padding: 10px 0; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <strong style="font-size: 14px; color: #ffffff;">${item.nombre_vestido}</strong>
                        <p style="font-size: 12px; color: #94a3b8; margin: 3px 0;">Código: ${item.codigo_vestido}</p>
                        <p style="font-size: 12px; margin: 3px 0; color: #ffffff;">
                            Cantidad: ${item.cantidad} x ${formatCurrency(item.precio_unitario)}
                        </p>
                        <p style="font-weight: bold; color: #06b6d4; margin: 3px 0;">
                            ${formatCurrency(item.subtotal)}
                        </p>
                    </div>
                    <button class="btn btn-small btn-danger" onclick="OperacionesView.quitarDelCarrito(${item.id_vestido})">
                        ❌
                    </button>
                </div>
            </div>
        `).join('');

        const paginacion = totalPaginas > 1 ? `
            <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #334155;">
                <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;"
                    onclick="OperacionesView.cambiarPaginaCarrito(${this.paginaCarrito - 1})"
                    ${this.paginaCarrito === 1 ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 8px; font-size: 12px; color: #e2e8f0;">
                    ${this.paginaCarrito} de ${totalPaginas}
                </span>
                <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;"
                    onclick="OperacionesView.cambiarPaginaCarrito(${this.paginaCarrito + 1})"
                    ${this.paginaCarrito === totalPaginas ? 'disabled' : ''}>Siguiente</button>
            </div>
        ` : '';

        carritoDiv.innerHTML = items + paginacion;

        const total = VentasController.calcularTotal();
        montoTotal.textContent = formatCurrency(total);
        totalDiv.style.display = 'block';
        btnFinalizar.style.display = 'block';
    },

    cambiarPaginaCarrito(nuevaPagina) {
        const totalPaginas = Math.ceil(VentasController.carrito.length / this.itemsCarritoPorPagina);
        if (nuevaPagina < 1 || nuevaPagina > totalPaginas) return;
        this.paginaCarrito = nuevaPagina;
        this.actualizarCarrito();
    },

    abrirFinalizarVenta() {
        document.getElementById('descuentoVenta').value = 0;
        document.getElementById('enviarEmailCheckbox').checked = false;
        document.getElementById('emailGroup').style.display = 'none';
        document.getElementById('emailComprobante').value = '';
        document.getElementById('clienteVentaInput').value = '';
        const dd = document.getElementById('clienteDropdown');
        if (dd) dd.style.display = 'none';
        document.getElementById('clienteInfoGroup').style.display = 'none';
        document.getElementById('clienteTelDisplay').value = '';
        document.getElementById('clienteDirDisplay').value = '';
        document.getElementById('clienteNuevoGroup').style.display = 'none';
        document.getElementById('nuevoClienteTel').value = '';
        document.getElementById('nuevoClienteDir').value = '';
        document.getElementById('nuevoClienteEmail').value = '';
        this.clienteSeleccionado = null;

        // Actualizar resumen
        const resumen = document.getElementById('resumenVenta');
        resumen.innerHTML = VentasController.carrito.map(item => `
            <p style="display: flex; justify-content: space-between; margin: 5px 0; color: #ffffff;">
                <span>${item.cantidad}x ${item.nombre_vestido} <span style="color:#a0aec0; font-size:13px;">(${item.codigo_vestido}${item.color ? ' · ' + item.color : ''}${item.talle ? ' · ' + item.talle : ''})</span></span>
                <strong>${formatCurrency(item.subtotal)}</strong>
            </p>
        `).join('');

        document.getElementById('totalFinal').textContent = `TOTAL: ${formatCurrency(VentasController.calcularTotal())}`;
        showModal('modalFinalizarVenta');
    },

    actualizarTotalConDescuento() {
        const descuento = parseFloat(document.getElementById('descuentoVenta').value) || 0;
        const totalOriginal = VentasController.calcularTotal();
        const totalConDescuento = Math.round(totalOriginal * (1 - descuento / 100));
        const totalFinalEl = document.getElementById('totalFinal');
        if (descuento > 0) {
            totalFinalEl.innerHTML = `<span style="text-decoration:line-through;color:#94a3b8;font-size:14px;">${formatCurrency(totalOriginal)}</span> &nbsp; TOTAL: <strong>${formatCurrency(totalConDescuento)}</strong> <small style="color:#4ade80;">(${descuento}% de descuento)</small>`;
        } else {
            totalFinalEl.textContent = `TOTAL: ${formatCurrency(totalConDescuento)}`;
        }
    },

    async confirmarVenta() {
        const formaPago = document.getElementById('formaPagoVenta').value;
        if (!formaPago) {
            showAlert('Debe seleccionar una forma de pago', 'error');
            return;
        }

        const descuento = parseFloat(document.getElementById('descuentoVenta').value) || 0;
        if (descuento < 0 || descuento > 100) {
            showAlert('El descuento debe estar entre 0 y 100', 'error');
            return;
        }

        // Validar campos del nuevo cliente si corresponde
        const clienteNuevoGroup = document.getElementById('clienteNuevoGroup');
        const esClienteNuevo = clienteNuevoGroup && clienteNuevoGroup.style.display !== 'none';
        if (esClienteNuevo) {
            const nombreCompleto = document.getElementById('clienteVentaInput').value.trim();
            if (!nombreCompleto) {
                showAlert('Debe ingresar el nombre del cliente', 'error');
                return;
            }
            const emailNuevoVal = document.getElementById('nuevoClienteEmail').value.trim();
            if (!emailNuevoVal) {
                showAlert('Debe ingresar el correo del nuevo cliente', 'error');
                return;
            }
            if (!validateEmail(emailNuevoVal)) {
                showAlert('El correo del nuevo cliente no tiene un formato válido', 'error');
                return;
            }
        }

        const enviarEmail = document.getElementById('enviarEmailCheckbox').checked;
        const emailDest = document.getElementById('emailComprobante').value;

        // Mostrar opciones de comprobante ANTES de procesar la venta
        // Si el usuario cancela aquí, la venta NO se procesa
        let opcion; // 0=guardar PDF, 1=imprimir, 'email'=guardar y enviar por correo
        if (enviarEmail) {
            const choice = await window.ipcRenderer.invoke('show-comprobante-email-options');
            if (choice === 1) return; // Cancelar → no procesar venta
            opcion = 'email';
        } else {
            const choice = await window.ipcRenderer.invoke('show-comprobante-options');
            if (choice === 2) return; // Cancelar → no procesar venta
            opcion = choice; // 0=guardar, 1=imprimir
        }

        // Crear nuevo cliente en la base de datos si corresponde
        if (esClienteNuevo) {
            const nombreCompleto = capitalizeWords(document.getElementById('clienteVentaInput').value.trim());
            const partes = nombreCompleto.split(' ').filter(p => p.length > 0);
            const apellido = partes.length > 1 ? partes.pop() : '';
            const nombre = partes.join(' ');
            const telNuevo = document.getElementById('nuevoClienteTel').value.trim();
            const dirNuevo = capitalizeWords(document.getElementById('nuevoClienteDir').value.trim());
            const emailNuevo = document.getElementById('nuevoClienteEmail').value.trim();

            const resultCliente = await ClientesController.createCliente({
                nombre,
                apellido,
                telefono: telNuevo,
                correo: emailNuevo,
                direccion: dirNuevo
            });

            if (!resultCliente.success) {
                showAlert('Error al registrar el cliente: ' + resultCliente.error, 'error');
                return;
            }

            this.clienteSeleccionado = {
                id_cliente: resultCliente.id,
                nombre,
                apellido,
                telefono: telNuevo,
                correo: emailNuevo,
                direccion: dirNuevo
            };

            // Actualizar lista local de clientes sin volver a adjuntar listeners
            this.clientesData = await ClientesController.getAllClientes();
        }

        const clienteId = this.clienteSeleccionado?.id_cliente || null;
        const clienteNombre = this.clienteSeleccionado
            ? `${this.clienteSeleccionado.nombre} ${this.clienteSeleccionado.apellido}`
            : 'Cliente anónimo';

        const datosVenta = {
            id_cliente: clienteId || null,
            nombre_cliente: clienteNombre,
            id_forma_pago: parseInt(formaPago),
            descuento: descuento
        };

        const result = await VentasController.procesarVenta(datosVenta);

        if (result.success) {
            // Cerrar modal y limpiar inmediatamente
            VentasController.vaciarCarrito();
            this.actualizarCarrito();
            hideModal('modalFinalizarVenta');
            document.getElementById('formFinalizarVenta').reset();
            document.getElementById('clienteNuevoGroup').style.display = 'none';

            // Recargar vestidos para actualizar stock
            await this.buscarVestidos(document.getElementById('buscarVestidoVenta').value || '');

            // Generar y enviar comprobante (después de cerrar el modal)
            try {
                const { venta, detalles } = await VentasController.getVenta(result.idVenta);

                if (opcion === 0) {
                    // Guardar PDF
                    const fileName = `Comprobante_${venta.id_venta}_${Date.now()}.pdf`;
                    const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
                        title: 'Guardar comprobante',
                        defaultPath: fileName,
                        filters: [{ name: 'PDF', extensions: ['pdf'] }]
                    });
                    if (!dialogResult.canceled && dialogResult.filePath) {
                        await PDFGenerator._savePDFToPath(venta, detalles, dialogResult.filePath);
                        showAlert('Venta realizada y comprobante guardado exitosamente', 'success');
                    } else {
                        showAlert('Venta realizada exitosamente', 'success');
                    }
                } else if (opcion === 1) {
                    // Imprimir
                    const downloadsPath = await window.ipcRenderer.invoke('get-downloads-path');
                    const tmpPath = require('path').join(downloadsPath, `tmp_Comprobante_${venta.id_venta}_${Date.now()}.pdf`);
                    await PDFGenerator._savePDFToPath(venta, detalles, tmpPath);
                    await window.ipcRenderer.invoke('print-pdf', tmpPath);
                    showAlert('Venta realizada y comprobante impreso', 'success');
                } else if (opcion === 'email') {
                    // Guardar comprobante y enviar por correo
                    const fileName = `Comprobante_${venta.id_venta}_${Date.now()}.pdf`;
                    let pdfPath;
                    const dialogResult = await window.ipcRenderer.invoke('show-save-dialog', {
                        title: 'Guardar comprobante',
                        defaultPath: fileName,
                        filters: [{ name: 'PDF', extensions: ['pdf'] }]
                    });
                    if (!dialogResult.canceled && dialogResult.filePath) {
                        pdfPath = dialogResult.filePath;
                    } else {
                        const downloadsPath = await window.ipcRenderer.invoke('get-downloads-path');
                        pdfPath = require('path').join(downloadsPath, fileName);
                    }
                    await PDFGenerator._savePDFToPath(venta, detalles, pdfPath);
                    if (emailDest) {
                        await emailService.enviarComprobante(emailDest, venta, detalles, pdfPath);
                        showAlert('Venta realizada y comprobante enviado por correo', 'success');
                    } else {
                        showAlert('Venta realizada y comprobante guardado', 'success');
                    }
                }
            } catch (error) {
                console.error('Error generando comprobante:', error);
                showAlert('Venta realizada pero hubo un error al generar el comprobante', 'warning');
            }
        } else {
            showAlert(result.error, 'error');
        }
    }
};
