const UsuariosView = {
    paginaActual: 1,
    itemsPorPagina: 5,
    totalPaginas: 1,
    usuariosFiltrados: [],
    
    async render() {
        return `
            <div class="module-container">
                <div class="card">
                    <div class="tabs">
                        <button class="tab-button active" data-tab="listar">Gestionar Usuarios</button>
                        <button class="tab-button" data-tab="crear">Crear Usuario</button>
                    </div>

                    <!-- Tab Crear Usuario -->
                    <div class="tab-content" id="tab-crear">
                        <h3 style="margin-bottom: 20px; color: #ffffff;">Nuevo Usuario</h3>
                        <form id="formCrearUsuario">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label for="nuevoUsuario">Nombre de Usuario *</label>
                                    <input type="text" id="nuevoUsuario" required>
                                </div>
                                <div class="form-group">
                                    <label for="nuevoCorreo">Correo Electrónico *</label>
                                    <input type="email" id="nuevoCorreo" required>
                                </div>
                                <div class="form-group">
                                    <label for="nuevaContraseña">Contraseña *</label>
                                    <input type="password" id="nuevaContraseña" required minlength="6">
                                </div>
                                <div class="form-group">
                                    <label for="nuevoRol">Rol *</label>
                                    <select id="nuevoRol" required>
                                        <option value="">Seleccionar...</option>
                                        <option value="Admin">Administrador</option>
                                        <option value="Empleado">Empleado</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="clearForm('formCrearUsuario')">Limpiar</button>
                                <button type="submit" class="btn btn-primary">Crear Usuario</button>
                            </div>
                        </form>
                    </div>

                    <!-- Tab Gestionar Usuarios -->
                    <div class="tab-content active" id="tab-listar">
                        <div class="form-grid" style="margin-bottom: 25px; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Buscar</label>
                                <input type="text" id="buscarUsuario" placeholder="Usuario o correo..." style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Rol</label>
                                <select id="filtroRol" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="">Todos los roles</option>
                                    <option value="Admin">Administrador</option>
                                    <option value="Empleado">Empleado</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Estado</label>
                                <select id="filtroEstado" style="padding: 12px 10px; font-size: 13px;">
                                    <option value="activo" selected>Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Fecha inicio</label>
                                <input type="date" id="filtroFechaInicio" style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="margin-bottom: 4px; font-size: 12px;">Fecha fin</label>
                                <input type="date" id="filtroFechaFin" style="padding: 12px 10px; font-size: 13px;">
                            </div>
                            <div class="form-group" style="display: flex; align-items: flex-end; margin-bottom: 0;">
                                <button id="btnLimpiarFiltros" class="btn btn-secondary" style="padding: 13px 15px; font-size: 12px; white-space: nowrap;">🧹 Limpiar</button>
                            </div>
                        </div>

                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Estado</th>
                                        <th>Fecha Creación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="usuariosTableBody">
                                    <tr><td colspan="6" class="text-center">Cargando...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="paginacionUsuarios" style="margin-top: 10px; text-align: center;"></div>
                    </div>

                </div>
            </div>

            <!-- Modal Editar Usuario -->
            <div id="modalEditarUsuario" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Editar Usuario</h3>
                        <button class="modal-close" onclick="hideModal('modalEditarUsuario')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarUsuario">
                            <input type="hidden" id="editIdUsuario">
                            <div class="form-group">
                                <label for="editUsuario">Nombre de Usuario</label>
                                <input type="text" id="editUsuario" required>
                            </div>
                            <div class="form-group">
                                <label for="editCorreo">Correo Electrónico</label>
                                <input type="email" id="editCorreo" required>
                            </div>
                            <div class="form-group">
                                <label for="editRol">Rol</label>
                                <select id="editRol" required>
                                    <option value="Admin">Administrador</option>
                                    <option value="Empleado">Empleado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editContraseña">Nueva Contraseña (dejar vacío para no cambiar)</label>
                                <input type="password" id="editContraseña">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="hideModal('modalEditarUsuario')">Cancelar</button>
                        <button class="btn btn-primary" onclick="UsuariosView.guardarEdicion()">Guardar Cambios</button>
                    </div>
                </div>
            </div>

            <!-- Modal Historial -->
            <div id="modalHistorial" class="modal">
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h3 class="modal-title">Historial de Usuario</h3>
                        <button class="modal-close" onclick="hideModal('modalHistorial')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Acción</th>
                                        <th>Descripción</th>
                                        <th>Usuario</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody id="historialTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        `;
    },

    async init() {
        this.setupTabs();
        this.setupEventListeners();
        await this.cargarUsuarios();
    },

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                document.getElementById(`tab-${tabName}`).classList.add('active');
            });
        });
    },

    setupEventListeners() {
        // Form crear usuario
        document.getElementById('formCrearUsuario').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.crearUsuario();
        });

        // Búsqueda y filtros
        document.getElementById('buscarUsuario').addEventListener('input', () => this.filtrarUsuarios());
        document.getElementById('filtroRol').addEventListener('change', () => this.filtrarUsuarios());
        document.getElementById('filtroEstado').addEventListener('change', () => this.filtrarUsuarios());
        document.getElementById('filtroFechaInicio').addEventListener('change', () => this.filtrarUsuarios());
        document.getElementById('filtroFechaFin').addEventListener('change', () => this.filtrarUsuarios());
        document.getElementById('btnLimpiarFiltros').addEventListener('click', () => this.limpiarFiltros());
    },

    async crearUsuario() {
        const data = {
            nombre_usuario: document.getElementById('nuevoUsuario').value.trim(),
            correo: document.getElementById('nuevoCorreo').value.trim(),
            contraseña: document.getElementById('nuevaContraseña').value,
            rol: document.getElementById('nuevoRol').value
        };

        if (!validateEmail(data.correo)) {
            showAlert('Correo electrónico inválido', 'error');
            return;
        }

        const result = await UsuariosController.createUsuario(data);
        
        if (result.success) {
            showAlert('Usuario creado exitosamente', 'success');
            clearForm('formCrearUsuario');
            await this.cargarUsuarios();
        } else {
            showAlert(result.error, 'error');
        }
    },

    limpiarFiltros() {
        document.getElementById('buscarUsuario').value = '';
        document.getElementById('filtroRol').value = '';
        document.getElementById('filtroEstado').value = 'activo';
        document.getElementById('filtroFechaInicio').value = '';
        document.getElementById('filtroFechaFin').value = '';
        this.filtrarUsuarios();
    },

    async cargarUsuarios() {
        const usuarios = await UsuariosController.getAllUsuarios();
        this.usuariosData = usuarios;
        this.paginaActual = 1;
        this.filtrarUsuarios();
    },

    calcularTotalPaginas() {
        this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina);
        if (this.totalPaginas === 0) this.totalPaginas = 1;
    },

    renderUsuarios() {
        const tbody = document.getElementById('usuariosTableBody');
        const usuarios = this.usuariosFiltrados;
        
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
            document.getElementById('paginacionUsuarios').innerHTML = '';
            return;
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        const usuariosPagina = usuarios.slice(inicio, fin);

        tbody.innerHTML = usuariosPagina.map(usuario => `
            <tr>
                <td>${usuario.nombre_usuario || 'N/A'}</td>
                <td>${usuario.correo || 'N/A'}</td>
                <td><span class="badge badge-info">${usuario.rol || 'N/A'}</span></td>
                <td>
                    <span class="badge ${usuario.estado === 'activo' ? 'badge-success' : 'badge-danger'}">
                        ${usuario.estado || 'N/A'}
                    </span>
                </td>
                <td>${usuario.fecha_creacion ? formatDate(usuario.fecha_creacion) : 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-small btn-primary" onclick="UsuariosView.abrirEditar(${usuario.id_usuario})">✏️ Editar</button>
                        <button class="btn btn-small btn-warning" onclick="UsuariosView.cambiarEstado(${usuario.id_usuario}, '${usuario.estado === 'activo' ? 'inactivo' : 'activo'}')">
                            ${usuario.estado === 'activo' ? '🔒 Desactivar' : '✅ Activar'}
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="UsuariosView.verHistorial(${usuario.id_usuario})">📜 Historial</button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.actualizarPaginacion();
    },

    actualizarPaginacion() {
        const paginacion = document.getElementById('paginacionUsuarios');
        if (!paginacion) return;
        const soloUna = this.totalPaginas <= 1;
        paginacion.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="UsuariosView.cambiarPagina(1)"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''} title="Primera p\u00e1gina">\u23ee</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="UsuariosView.cambiarPagina(${this.paginaActual - 1})"
                    ${this.paginaActual === 1 || soloUna ? 'disabled' : ''}>Anterior</button>
                <span style="margin: 0 8px; font-weight: bold; font-size: 13px; color: #e2e8f0;">
                    ${this.paginaActual} de ${this.totalPaginas}
                </span>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="UsuariosView.cambiarPagina(${this.paginaActual + 1})"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''}>Siguiente</button>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;"
                    onclick="UsuariosView.irUltimaPagina()"
                    ${this.paginaActual === this.totalPaginas || soloUna ? 'disabled' : ''} title="\u00daltima p\u00e1gina">\u23ed</button>
                <select onchange="UsuariosView.cambiarItemsPorPagina(this.value)" style="padding: 4px 8px; background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 4px; font-size: 12px;">
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
        this.renderUsuarios();
    },

    cambiarItemsPorPagina(valor) {
        this.itemsPorPagina = parseInt(valor);
        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderUsuarios();
    },

    cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
        this.paginaActual = nuevaPagina;
        this.renderUsuarios();
    },

    filtrarUsuarios() {
        const busqueda = document.getElementById('buscarUsuario').value.toLowerCase();
        const filtroRol = document.getElementById('filtroRol').value;
        const filtroEstado = document.getElementById('filtroEstado').value;
        const fechaInicio = document.getElementById('filtroFechaInicio').value;
        const fechaFin = document.getElementById('filtroFechaFin').value;

        this.usuariosFiltrados = this.usuariosData;

        if (busqueda) {
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => 
                (u.nombre_usuario && u.nombre_usuario.toLowerCase().includes(busqueda)) ||
                (u.correo && u.correo.toLowerCase().includes(busqueda))
            );
        }

        if (filtroRol) {
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => u.rol === filtroRol);
        }

        if (filtroEstado) {
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => u.estado === filtroEstado);
        }

        if (fechaInicio) {
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => {
                if (!u.fecha_creacion) return false;
                const fechaReg = new Date(u.fecha_creacion);
                const yyyy = fechaReg.getFullYear();
                const mm = String(fechaReg.getMonth() + 1).padStart(2, '0');
                const dd = String(fechaReg.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}` >= fechaInicio;
            });
        }

        if (fechaFin) {
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => {
                if (!u.fecha_creacion) return false;
                const fechaReg = new Date(u.fecha_creacion);
                const yyyy = fechaReg.getFullYear();
                const mm = String(fechaReg.getMonth() + 1).padStart(2, '0');
                const dd = String(fechaReg.getDate()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd}` <= fechaFin;
            });
        }

        this.paginaActual = 1;
        this.calcularTotalPaginas();
        this.renderUsuarios();
    },

    async abrirEditar(id) {
        const usuario = await UsuariosController.getUsuarioById(id);
        if (!usuario) return;

        document.getElementById('editIdUsuario').value = usuario.id_usuario;
        document.getElementById('editUsuario').value = usuario.nombre_usuario;
        document.getElementById('editCorreo').value = usuario.correo;
        document.getElementById('editRol').value = usuario.rol;
        document.getElementById('editContraseña').value = '';

        showModal('modalEditarUsuario');
    },

    async guardarEdicion() {
        const id = document.getElementById('editIdUsuario').value;
        const data = {
            nombre_usuario: document.getElementById('editUsuario').value.trim(),
            correo: document.getElementById('editCorreo').value.trim(),
            rol: document.getElementById('editRol').value
        };

        const nuevaContraseña = document.getElementById('editContraseña').value;
        if (nuevaContraseña) {
            data.contraseña = nuevaContraseña;
        }

        const result = await UsuariosController.updateUsuario(id, data);
        
        if (result.success) {
            showAlert('Usuario actualizado exitosamente', 'success');
            hideModal('modalEditarUsuario');
            await this.cargarUsuarios();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async cambiarEstado(id, nuevoEstado) {
        const result = await UsuariosController.cambiarEstado(id, nuevoEstado);
        
        if (result.success) {
            showAlert(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`, 'success');
            await this.cargarUsuarios();
        } else {
            showAlert(result.error, 'error');
        }
    },

    async verHistorial(id) {
        const historial = await UsuariosController.getHistorial(id);
        const tbody = document.getElementById('historialTableBody');

        if (historial.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay historial disponible</td></tr>';
        } else {
            tbody.innerHTML = historial.map(registro => `
                <tr>
                    <td><span class="badge badge-info">${registro.accion}</span></td>
                    <td>${registro.descripcion}</td>
                    <td>${registro.usuario_accion}</td>
                    <td>${formatDate(registro.fecha_accion)}</td>
                </tr>
            `).join('');
        }

        showModal('modalHistorial');
    }
};
