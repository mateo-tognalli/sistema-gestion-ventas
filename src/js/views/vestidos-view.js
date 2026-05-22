const VestidosView = {
    paginaActual: 1,
    itemsPorPagina: 5,
    totalPaginas: 1,
    vestidosFiltrados: [],
    
    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="listar">Inventario</button>
                        <button class="tab-button" data-tab="crear">Cargar Vestido</button>
                    </div>

                    <div class="tab-content" id="tab-crear">
                        <h3 style="margin-bottom: 20px; color: #ffffff;">Nuevo Vestido</h3>
                        <form id="formCrearVestido">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nombreVestido">Nombre *</label>
                                    <input type="text" id="nombreVestido" required oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label for="codigoVestido">Código *</label>
                                    <input type="text" id="codigoVestido" required>
                                    <button type="button" class="btn btn-small btn-secondary" style="margin-top: 5px;" onclick="VestidosView.generarCodigo()">Generar Automático</button>
                                </div>
                                <div class="form-group">
                                    <label for="talleVestido">Talle *</label>
                                    <input type="text" id="talleVestido" required placeholder="XS, S, M, L, XL" oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label for="categoriaVestido">Categoría *</label>
                                    <select id="categoriaVestido" required>
                                        <option value="">Seleccionar...</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="colorVestido">Color *</label>
                                    <input type="text" id="colorVestido" required oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label for="precioVestido">Precio *</label>
                                    <input type="number" id="precioVestido" step="500" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label for="stockVestido">Stock *</label>
                                    <input type="number" id="stockVestido" value="1" min="0" required>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="clearForm('formCrearVestido')">Limpiar</button>
                                <button type="submit" class="btn btn-primary">Cargar Vestido</button>
                            </div>
                        </form>
                    </div>

                    <div class="tab-content active" id="tab-listar">
                        <div class="form-grid" style="margin-bottom: 25px; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Buscar</label>
                                <input type="text" id="buscarVestido" placeholder="Nombre, código o color..." style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Categoría</label>
                                <select id="filtroCategoria" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="">Todas las categorías</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Talle</label>
                                <select id="filtroTalle" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="">Todos los talles</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Stock</label>
                                <select id="filtroStock" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="con" selected>Con stock</option>
                                    <option value="sin">Sin stock</option>
                                </select>
                            </div>
                            <div class="form-group" style="display: flex; align-items: flex-end; margin-bottom: 0;">
                                <button id="btnLimpiarFiltrosVestidos" class="btn btn-secondary" style="padding: 13px 15px; font-size: 12px; white-space: nowrap;">🧹 Limpiar</button>
                            </div>
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Talle</th>
                                        <th>Categoría</th>
                                        <th>Color</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="vestidosTableBody">
                                    <tr><td colspan="8">Cargando...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="paginacionVestidos" style="margin-top: 10px; text-align: center;"></div>
                    </div>
                </div>
            </div>

            <div id="modalEditarVestido" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Editar Vestido</h3>
                        <button class="modal-close" onclick="hideModal('modalEditarVestido')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarVestido">
                            <input type="hidden" id="editIdVestido">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nombre *</label>
                                    <input type="text" id="editNombreVestido" required oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label>Código *</label>
                                    <input type="text" id="editCodigoVestido" required>
                                </div>
                                <div class="form-group">
                                    <label>Talle *</label>
                                    <input type="text" id="editTalleVestido" required oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label>Categoría *</label>
                                    <select id="editCategoriaVestido" required></select>
                                </div>
                                <div class="form-group">
                                    <label>Color *</label>
                                    <input type="text" id="editColorVestido" required oninput="this.value=this.value.replace(/[0-9]/g,'')">
                                </div>
                                <div class="form-group">
                                    <label>Precio *</label>
                                    <input type="number" id="editPrecioVestido" step="500" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Stock *</label>
                                    <input type="number" id="editStockVestido" min="0" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="hideModal('modalEditarVestido')">Cancelar</button>
                        <button class="btn btn-primary" onclick="VestidosView.guardarEdicion()">Guardar</button>
                    </div>
                </div>
            </div>

            <div id="modalHistorialVestido" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Historial de Vestido</h3>
                        <button class="modal-close" onclick="hideModal('modalHistorialVestido')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr><th>Acción</th><th>Descripción</th><th>Usuario</th><th>Fecha</th></tr>
                                </thead>
                                <tbody id="historialVestidoTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        this.setupTabs();
        await this.cargarCategorias();
        document.getElementById('formCrearVestido').addEventListener('submit', (e) => {
            e.preventDefault();
            this.crearVestido();
        });
        document.getElementById('buscarVestido').addEventListener('input', () => this.filtrarVestidos());
        document.getElementById('filtroCategoria').addEventListener('change', () => this.filtrarVestidos());
        document.getElementById('filtroTalle').addEventListener('change', () => this.filtrarVestidos());
        document.getElementById('filtroStock').addEventListener('change', () => this.filtrarVestidos());
        document.getElementById('btnLimpiarFiltrosVestidos').addEventListener('click', () => this.limpiarFiltros());
        await this.cargarVestidos();
    },

    esAdmin() {
        if (window.currentUser) return window.currentUser.rol === 'Admin';
        const sessionData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (sessionData) return JSON.parse(sessionData).rol === 'Admin';
        return false;
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

    async cargarCategorias() {
        const categorias = await VestidosController.getCategorias();
        const select1 = document.getElementById('categoriaVestido');
        const select2 = document.getElementById('filtroCategoria');
        const select3 = document.getElementById('editCategoriaVestido');
        
        categorias.forEach(cat => {
            select1.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
            select2.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
            if (select3) select3.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
        });
    },

    generarCodigo() {
        const numeros = Math.floor(1000000 + Math.random() * 9000000);
        const codigo = 'V' + numeros;
        document.getElementById('codigoVestido').value = codigo;
    },

    async crearVestido() {
        const toTitleCase = str => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        const nombreRaw = document.getElementById('nombreVestido').value.trim();

        if (!/^[a-zA-Zà-ÿÀ-ß\s]+$/.test(nombreRaw)) {
            showAlert('El nombre del vestido solo puede contener letras', 'error');
            return;
        }

        const data = {
            nombre: toTitleCase(nombreRaw),
            codigo: document.getElementById('codigoVestido').value.trim().toUpperCase(),
            talle: document.getElementById('talleVestido').value.trim().toUpperCase(),
            id_categoria: document.getElementById('categoriaVestido').value,
            color: toTitleCase(document.getElementById('colorVestido').value.trim()),
            precio: parseFloat(document.getElementById('precioVestido').value),
            stock: parseInt(document.getElementById('stockVestido').value)
        };

        const result = await VestidosController.createVestido(data);
        if (result.success) {
            showAlert('Vestido cargado exitosamente', 'success');
            clearForm('formCrearVestido');
            await this.cargarVestidos();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async cargarVestidos() {
        const vestidos = await VestidosController.getAllVestidos();
        vestidos.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
        this.vestidosData = vestidos;

        const talles = [...new Set(vestidos.map(v => v.talle).filter(Boolean))].sort();
        const selectTalle = document.getElementById('filtroTalle');
        selectTalle.innerHTML = '<option value="">Todos los talles</option>' +
            talles.map(t => `<option value="${t}">${t}</option>`).join('');

        this.paginaActual = 1;
        this.filtrarVestidos();
    },

    calcularTotalPaginas() {
        this.totalPaginas = Math.ceil(this.vestidosFiltrados.length / this.itemsPorPagina);
        if (this.totalPaginas === 0) this.totalPaginas = 1;
    },

    renderVestidos() {
        const tbody = document.getElementById('vestidosTableBody');
        const vestidos = this.vestidosFiltrados;
        
        if (vestidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No hay vestidos en el inventario</td></tr>';
            document.getElementById('paginacionVestidos').innerHTML = '';
            return;
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        const vestidosPagina = vestidos.slice(inicio, fin);

        tbody.innerHTML = vestidosPagina.map(v => `
            <tr>
                <td><strong>${v.codigo}</strong></td>
                <td>${v.nombre}</td>
                <td>${v.talle}</td>
                <td><span class="badge badge-info">${v.categoria_nombre}</span></td>
                <td>${v.color}</td>
                <td>${formatCurrency(v.precio)}</td>
                <td><span class="badge ${v.stock > 0 ? 'badge-success' : 'badge-danger'}">${v.stock}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-small btn-primary" onclick="VestidosView.abrirEditar(${v.id_vestido})">✏️</button>
                        <button class="btn btn-small btn-secondary" onclick="VestidosView.verHistorial(${v.id_vestido})">📜</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.actualizarPaginacion();
    },

    actualizarPaginacion() {
        const paginacion = document.getElementById('paginacionVestidos');
        if (!paginacion) return;
        const soloUna = this.totalPaginas <= 1;
        paginacion.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="VestidosView.cambiarPagina(1)"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''} title="Primera p\u00e1gina">\u23ee</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="VestidosView.cambiarPagina(${this.paginaActual - 1})"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 8px; font-weight: bold; font-size: 13px; color: #e2e8f0;">
                    ${this.paginaActual} de ${this.totalPaginas}
                </span>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="VestidosView.cambiarPagina(${this.paginaActual + 1})"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''}>Siguiente</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="VestidosView.irUltimaPagina()"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''} title="\u00daltima p\u00e1gina">\u23ed</button>
                <select onchange="VestidosView.cambiarItemsPorPagina(this.value)" style="padding: 4px 8px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; font-size: 12px;">
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
        this.renderVestidos();
    },

    cambiarItemsPorPagina(valor) {
        this.itemsPorPagina = parseInt(valor);
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderVestidos();
    },

    cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
        this.paginaActual = nuevaPagina;
        this.renderVestidos();
    },

    filtrarVestidos() {
        const busqueda = document.getElementById('buscarVestido').value.toLowerCase();
        const categoria = document.getElementById('filtroCategoria').value;
        const talle = document.getElementById('filtroTalle').value;
        const stock = document.getElementById('filtroStock').value;

        this.vestidosFiltrados = this.vestidosData;

        if (busqueda) {
            this.vestidosFiltrados = this.vestidosFiltrados.filter(v =>
                v.nombre.toLowerCase().includes(busqueda) ||
                v.codigo.toLowerCase().includes(busqueda) ||
                v.color.toLowerCase().includes(busqueda)
            );
        }
        if (categoria) {
            this.vestidosFiltrados = this.vestidosFiltrados.filter(v => v.id_categoria == categoria);
        }
        if (talle) {
            this.vestidosFiltrados = this.vestidosFiltrados.filter(v => v.talle === talle);
        }
        if (stock === 'con') {
            this.vestidosFiltrados = this.vestidosFiltrados.filter(v => v.stock > 0);
        } else if (stock === 'sin') {
            this.vestidosFiltrados = this.vestidosFiltrados.filter(v => !v.stock || v.stock === 0);
        }

        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderVestidos();
    },

    limpiarFiltros() {
        document.getElementById('buscarVestido').value = '';
        document.getElementById('filtroCategoria').value = '';
        document.getElementById('filtroTalle').value = '';
        document.getElementById('filtroStock').value = 'con';
        this.filtrarVestidos();
    },

    async abrirEditar(id) {
        const vestido = await VestidosController.getVestidoById(id);
        if (!vestido) return;
        document.getElementById('editIdVestido').value = vestido.id_vestido;
        document.getElementById('editNombreVestido').value = vestido.nombre;
        document.getElementById('editCodigoVestido').value = vestido.codigo;
        document.getElementById('editTalleVestido').value = vestido.talle;
        document.getElementById('editCategoriaVestido').value = String(vestido.id_categoria);
        document.getElementById('editColorVestido').value = vestido.color;
        document.getElementById('editPrecioVestido').value = parseFloat(vestido.precio);
        document.getElementById('editStockVestido').value = vestido.stock;

        const esAdmin = this.esAdmin();
        const precioEdit = document.getElementById('editPrecioVestido');
        const stockEdit = document.getElementById('editStockVestido');
        precioEdit.readOnly = !esAdmin;
        precioEdit.style.background = esAdmin ? '' : '#334155';
        precioEdit.style.color = esAdmin ? '' : '#94a3b8';
        precioEdit.title = esAdmin ? '' : 'Solo los administradores pueden modificar el precio';
        stockEdit.readOnly = !esAdmin;
        stockEdit.style.background = esAdmin ? '' : '#334155';
        stockEdit.style.color = esAdmin ? '' : '#94a3b8';
        stockEdit.title = esAdmin ? '' : 'Solo los administradores pueden modificar el stock';

        showModal('modalEditarVestido');
    },

    async guardarEdicion() {
        const toTitleCase = str => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        const id = document.getElementById('editIdVestido').value;
        const vestidoActual = await VestidosController.getVestidoById(id);
        const data = {
            nombre: toTitleCase(document.getElementById('editNombreVestido').value.trim()),
            codigo: document.getElementById('editCodigoVestido').value.trim().toUpperCase(),
            talle: document.getElementById('editTalleVestido').value.trim().toUpperCase(),
            id_categoria: document.getElementById('editCategoriaVestido').value,
            color: toTitleCase(document.getElementById('editColorVestido').value.trim()),
            precio: this.esAdmin() ? parseFloat(document.getElementById('editPrecioVestido').value) : parseFloat(vestidoActual.precio),
            stock: this.esAdmin() ? parseInt(document.getElementById('editStockVestido').value) : parseInt(vestidoActual.stock)
        };

        const result = await VestidosController.updateVestido(id, data);
        if (result.success) {
            showAlert('Vestido actualizado', 'success');
            hideModal('modalEditarVestido');
            await this.cargarVestidos();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async verHistorial(id) {
        const historial = await VestidosController.getHistorial(id);
        const tbody = document.getElementById('historialVestidoTableBody');
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
        showModal('modalHistorialVestido');
    }
};
