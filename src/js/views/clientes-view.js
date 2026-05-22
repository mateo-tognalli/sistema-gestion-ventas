const ClientesView = {
    paginaActual: 1,
    itemsPorPagina: 5,
    totalPaginas: 1,
    clientesFiltrados: [],
    
    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="listar">Gestionar Clientes</button>
                        <button class="tab-button" data-tab="crear">Nuevo Cliente</button>
                    </div>

                    <div class="tab-content" id="tab-crear">
                        <h3 style="margin-bottom: 20px; color: #ffffff;">Registrar Cliente</h3>
                        <form id="formCrearCliente">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nombreCliente">Nombre *</label>
                                    <input type="text" id="nombreCliente" required oninput="this.value=this.value.replace(/[0-9]/g,'')" onblur="this.value=capitalizeWords(this.value)">
                                </div>
                                <div class="form-group">
                                    <label for="apellidoCliente">Apellido *</label>
                                    <input type="text" id="apellidoCliente" required oninput="this.value=this.value.replace(/[0-9]/g,'')" onblur="this.value=capitalizeWords(this.value)">
                                </div>
                                <div class="form-group">
                                    <label for="telefonoCliente">Teléfono</label>
                                    <input type="tel" id="telefonoCliente" inputmode="numeric" maxlength="12" placeholder="" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,12)">
                                </div>
                                <div class="form-group">
                                    <label for="correoCliente">Correo Electrónico *</label>
                                    <input type="email" id="correoCliente" required>
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label for="direccionCliente">Dirección</label>
                                    <textarea id="direccionCliente" rows="2" onblur="this.value=capitalizeWords(this.value)"></textarea>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="clearForm('formCrearCliente')">Limpiar</button>
                                <button type="submit" class="btn btn-primary">Registrar Cliente</button>
                            </div>
                        </form>
                    </div>

                    <div class="tab-content active" id="tab-listar">
                        <div class="form-grid" style="margin-bottom: 25px; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Buscar</label>
                                <input type="text" id="buscarCliente" placeholder="Nombre, teléfono, correo..." style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Estado</label>
                                <select id="filtroEstadoCliente" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="activo" selected>Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Fecha inicio</label>
                                <input type="date" id="filtroFechaInicioCliente" style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Fecha fin</label>
                                <input type="date" id="filtroFechaFinCliente" style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="display: flex; align-items: flex-end; margin-bottom: 0;">
                                <button id="btnLimpiarFiltrosCliente" class="btn btn-secondary" style="padding: 13px 15px; font-size: 12px; white-space: nowrap;">🧹 Limpiar</button>
                            </div>
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Teléfono</th>
                                        <th>Correo</th>
                                        <th>Dirección</th>
                                        <th>Estado</th>
                                        <th>Fecha Registro</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="clientesTableBody">
                                    <tr><td colspan="7">Cargando...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="paginacionClientes" style="margin-top: 10px; text-align: center;"></div>
                    </div>
                </div>
            </div>

            <div id="modalEditarCliente" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Editar Cliente</h3>
                        <button class="modal-close" onclick="hideModal('modalEditarCliente')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarCliente">
                            <input type="hidden" id="editIdCliente">
                            <div class="form-group">
                                <label>Nombre *</label>
                                <input type="text" id="editNombreCliente" required oninput="this.value=this.value.replace(/[0-9]/g,'')" onblur="this.value=capitalizeWords(this.value)">
                            </div>
                            <div class="form-group">
                                <label>Apellido *</label>
                                <input type="text" id="editApellidoCliente" required oninput="this.value=this.value.replace(/[0-9]/g,'')" onblur="this.value=capitalizeWords(this.value)">
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="editTelefonoCliente" inputmode="numeric" maxlength="12" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,12)">
                            </div>
                            <div class="form-group">
                                <label>Correo *</label>
                                <input type="email" id="editCorreoCliente" required>
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
                                <textarea id="editDireccionCliente" rows="2" onblur="this.value=capitalizeWords(this.value)"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="hideModal('modalEditarCliente')">Cancelar</button>
                        <button class="btn btn-primary" onclick="ClientesView.guardarEdicion()">Guardar</button>
                    </div>
                </div>
            </div>

            <div id="modalHistorialCliente" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Historial de Cliente</h3>
                        <button class="modal-close" onclick="hideModal('modalHistorialCliente')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr><th>Acción</th><th>Descripción</th><th>Usuario</th><th>Fecha</th></tr>
                                </thead>
                                <tbody id="historialClienteTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.setupTabs();
        document.getElementById('formCrearCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearCliente();
        });
        document.getElementById('buscarCliente').addEventListener('input', () => this.filtrarClientes());
        document.getElementById('filtroEstadoCliente').addEventListener('change', () => this.filtrarClientes());
        document.getElementById('filtroFechaInicioCliente').addEventListener('change', () => this.filtrarClientes());
        document.getElementById('filtroFechaFinCliente').addEventListener('change', () => this.filtrarClientes());
        document.getElementById('btnLimpiarFiltrosCliente').addEventListener('click', () => this.limpiarFiltros());
        await this.cargarClientes();
    },

    setupTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(`tab-${tabName}`).classList.add('active');
            });
        });
    },

    async crearCliente() {
        const nombre = capitalizeWords(document.getElementById('nombreCliente').value.trim());
        const apellido = capitalizeWords(document.getElementById('apellidoCliente').value.trim());
        const correo = document.getElementById('correoCliente').value.trim();
        const direccion = capitalizeWords(document.getElementById('direccionCliente').value.trim());

        if (!/^[a-zA-Zà-ÿÀ-ß\s]+$/.test(nombre)) {
            showAlert('El nombre solo puede contener letras', 'error');
            return;
        }
        if (!/^[a-zA-Zà-ÿÀ-ß\s]+$/.test(apellido)) {
            showAlert('El apellido solo puede contener letras', 'error');
            return;
        }
        if (!correo) {
            showAlert('El correo electrónico es obligatorio', 'error');
            return;
        }
        if (!validateEmail(correo)) {
            showAlert('El correo no tiene un formato válido', 'error');
            return;
        }
        if (direccion && (!/[a-zA-Zà-ÿÀ-ß]/.test(direccion) || !/[0-9]/.test(direccion))) {
            showAlert('La dirección debe incluir letras y números (ej: San Martín 456)', 'error');
            return;
        }

        const data = {
            nombre,
            apellido,
            telefono: document.getElementById('telefonoCliente').value.trim(),
            correo,
            direccion
        };

        const result = await ClientesController.createCliente(data);
        if (result.success) {
            showAlert('Cliente registrado exitosamente', 'success');
            clearForm('formCrearCliente');
            await this.cargarClientes();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async cargarClientes() {
        const clientes = await ClientesController.getAllClientes();
        this.clientesData = clientes;
        this.paginaActual = 1;
        this.filtrarClientes();
    },

    calcularTotalPaginas() {
        this.totalPaginas = Math.ceil(this.clientesFiltrados.length / this.itemsPorPagina);
        if (this.totalPaginas === 0) this.totalPaginas = 1;
    },

    renderClientes() {
        const tbody = document.getElementById('clientesTableBody');
        const clientes = this.clientesFiltrados;

        if (clientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No hay clientes registrados</td></tr>';
            document.getElementById('paginacionClientes').innerHTML = '';
            return;
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        const clientesPagina = clientes.slice(inicio, fin);

        tbody.innerHTML = clientesPagina.map(c => `
            <tr>
                <td>${c.nombre} ${c.apellido}</td>
                <td>${c.telefono || '-'}</td>
                <td>${c.correo || '-'}</td>
                <td>${c.direccion || '-'}</td>
                <td>
                    <span class="badge ${c.estado === 'activo' ? 'badge-success' : 'badge-danger'}">
                        ${c.estado || 'activo'}
                    </span>
                </td>
                <td>${formatDate(c.fecha_registro)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-small btn-primary" onclick="ClientesView.abrirEditar(${c.id_cliente})">✏️</button>
                        <button class="btn btn-small btn-warning" onclick="ClientesView.cambiarEstado(${c.id_cliente}, '${c.estado === 'activo' ? 'inactivo' : 'activo'}')">
                            ${c.estado === 'activo' ? '🔒 Desactivar' : '✅ Activar'}
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="ClientesView.verHistorial(${c.id_cliente})">📜</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.actualizarPaginacion();
    },

    actualizarPaginacion() {
        const paginacion = document.getElementById('paginacionClientes');
        if (!paginacion) return;
        const soloUna = this.totalPaginas <= 1;
        paginacion.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="ClientesView.cambiarPagina(1)"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''} title="Primera p\u00e1gina">\u23ee</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="ClientesView.cambiarPagina(${this.paginaActual - 1})"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 8px; font-weight: bold; font-size: 13px; color: #e2e8f0;">
                    ${this.paginaActual} de ${this.totalPaginas}
                </span>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="ClientesView.cambiarPagina(${this.paginaActual + 1})"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''}>Siguiente</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="ClientesView.irUltimaPagina()"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''} title="\u00daltima p\u00e1gina">\u23ed</button>
                <select onchange="ClientesView.cambiarItemsPorPagina(this.value)" style="padding: 4px 8px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; font-size: 12px;">
                    <option value="5" ${this.itemsPorPagina === 5 ? 'selected' : ''}>5/p\u00e1g.</option>
                    <option value="10" ${this.itemsPorPagina === 10 ? 'selected' : ''}>10/p\u00e1g.</option>
                    <option value="15" ${this.itemsPorPagina === 15 ? 'selected' : ''}>15/p\u00e1g.</option>
                    <option value="20" ${this.itemsPorPagina === 20 ? 'selected' : ''}>20/p\u00e1g.</option>
                </select>
            </div>
        `;
    },

    irUltimaPagina() {
        this.paginaActual = this.totalPaginas;
        this.renderClientes();
    },

    cambiarItemsPorPagina(valor) {
        this.itemsPorPagina = parseInt(valor);
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderClientes();
    },

    cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
        this.paginaActual = nuevaPagina;
        this.renderClientes();
    },

    filtrarClientes() {
        const busqueda = document.getElementById('buscarCliente').value.toLowerCase();
        const filtroEstado = document.getElementById('filtroEstadoCliente').value;
        const fechaInicio = document.getElementById('filtroFechaInicioCliente').value;
        const fechaFin = document.getElementById('filtroFechaFinCliente').value;

        this.clientesFiltrados = this.clientesData.filter(c => {
            const matchBusqueda =
                c.nombre.toLowerCase().includes(busqueda) ||
                c.apellido.toLowerCase().includes(busqueda) ||
                (c.telefono && c.telefono.includes(busqueda)) ||
                (c.correo && c.correo.toLowerCase().includes(busqueda)) ||
                (c.direccion && c.direccion.toLowerCase().includes(busqueda));

            if (!matchBusqueda) return false;

            // Filtrar por estado (clientes sin estado se consideran 'activo' por defecto)
            if (filtroEstado) {
                const estadoCliente = c.estado || 'activo';
                if (estadoCliente !== filtroEstado) return false;
            }

            if (fechaInicio || fechaFin) {
                if (!c.fecha_registro) return false;
                const d = new Date(c.fecha_registro);
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const fechaLocal = `${yyyy}-${mm}-${dd}`;
                if (fechaInicio && fechaLocal < fechaInicio) return false;
                if (fechaFin && fechaLocal > fechaFin) return false;
            }

            return true;
        });

        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderClientes();
    },

    limpiarFiltros() {
        document.getElementById('buscarCliente').value = '';
        document.getElementById('filtroEstadoCliente').value = 'activo';
        document.getElementById('filtroFechaInicioCliente').value = '';
        document.getElementById('filtroFechaFinCliente').value = '';
        this.filtrarClientes();
    },

    async abrirEditar(id) {
        const cliente = await ClientesController.getClienteById(id);
        if (!cliente) return;
        document.getElementById('editIdCliente').value = cliente.id_cliente;
        document.getElementById('editNombreCliente').value = cliente.nombre;
        document.getElementById('editApellidoCliente').value = cliente.apellido;
        document.getElementById('editTelefonoCliente').value = cliente.telefono || '';
        document.getElementById('editCorreoCliente').value = cliente.correo || '';
        document.getElementById('editDireccionCliente').value = cliente.direccion || '';
        showModal('modalEditarCliente');
    },

    async guardarEdicion() {
        const id = document.getElementById('editIdCliente').value;
        const nombre = capitalizeWords(document.getElementById('editNombreCliente').value.trim());
        const apellido = capitalizeWords(document.getElementById('editApellidoCliente').value.trim());
        const correo = document.getElementById('editCorreoCliente').value.trim();
        const direccion = capitalizeWords(document.getElementById('editDireccionCliente').value.trim());

        if (!/^[a-zA-Zà-ÿÀ-ß\s]+$/.test(nombre)) {
            showAlert('El nombre solo puede contener letras', 'error');
            return;
        }
        if (!/^[a-zA-Zà-ÿÀ-ß\s]+$/.test(apellido)) {
            showAlert('El apellido solo puede contener letras', 'error');
            return;
        }
        if (!correo) {
            showAlert('El correo electrónico es obligatorio', 'error');
            return;
        }
        if (!validateEmail(correo)) {
            showAlert('El correo no tiene un formato válido', 'error');
            return;
        }
        if (direccion && (!/[a-zA-Zà-ÿÀ-ß]/.test(direccion) || !/[0-9]/.test(direccion))) {
            showAlert('La dirección debe incluir letras y números (ej: San Martín 456)', 'error');
            return;
        }

        const data = {
            nombre,
            apellido,
            telefono: document.getElementById('editTelefonoCliente').value.trim(),
            correo,
            direccion
        };

        const result = await ClientesController.updateCliente(id, data);
        if (result.success) {
            showAlert('Cliente actualizado', 'success');
            hideModal('modalEditarCliente');
            await this.cargarClientes();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async verHistorial(id) {
        const historial = await ClientesController.getHistorial(id);
        const tbody = document.getElementById('historialClienteTableBody');
        tbody.innerHTML = historial.length === 0 ?
            '<tr><td colspan="4">Sin historial</td></tr>' :
            historial.map(h => `
                <tr>
                    <td><span class="badge badge-info">${h.accion}</span></td>
                    <td>${h.descripcion}</td>
                    <td>${h.usuario_accion}</td>
                    <td>${formatDate(h.fecha_accion)}</td>
                </tr>
            `).join('');
        showModal('modalHistorialCliente');
    },

    async cambiarEstado(id, nuevoEstado) {
        const result = await ClientesController.cambiarEstado(id, nuevoEstado);

        if (result.success) {
            showAlert(`Cliente ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`, 'success');
            await this.cargarClientes();
        } else {
            showAlert(result.error, 'error');
        }
    }
};
