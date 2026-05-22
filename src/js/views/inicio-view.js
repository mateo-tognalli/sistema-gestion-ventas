const InicioView = {
    async render() {
        return `
            <div class="module-container">
                <div class="stats-container" id="statsContainer">
                    <div class="stat-card">
                        <div class="stat-icon purple">👥</div>
                        <div class="stat-info">
                            <h3>Usuarios Activos</h3>
                            <p id="statUsuarios">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon blue">👤</div>
                        <div class="stat-info">
                            <h3>Clientes Registrados</h3>
                            <p id="statClientes">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon green">👗</div>
                        <div class="stat-info">
                            <h3>Vestidos en Stock</h3>
                            <p id="statVestidos">0</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon orange">💰</div>
                        <div class="stat-info">
                            <h3>Ventas de Hoy</h3>
                            <p id="statVentas">0</p>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Ingresos de Hoy</h2>
                    </div>
                    <div class="stats-container">
                        <div class="stat-card">
                            <div class="stat-icon green">📈</div>
                            <div class="stat-info">
                                <h3>Total de Hoy</h3>
                                <p id="statIngresosMes">$0</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon blue">📊</div>
                            <div class="stat-info">
                                <h3>Promedio por Venta</h3>
                                <p id="statPromedio">$0</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Ventas de Hoy</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>N° Venta</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Forma de Pago</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody id="ultimasVentasBody">
                                <tr>
                                    <td colspan="5" class="text-center">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Accesos Rápidos</h2>
                    </div>
                    <div class="stats-container">
                        <div class="stat-card" style="cursor: pointer;" onclick="loadModule('operaciones')">
                            <div class="stat-icon purple">💳</div>
                            <div class="stat-info">
                                <h3>Nueva Venta</h3>
                                <p style="font-size: 14px;">Iniciar operación</p>
                            </div>
                        </div>
                        <div class="stat-card" style="cursor: pointer;" onclick="loadModule('clientes')">
                            <div class="stat-icon blue">➕</div>
                            <div class="stat-info">
                                <h3>Nuevo Cliente</h3>
                                <p style="font-size: 14px;">Registrar cliente</p>
                            </div>
                        </div>
                        <div class="stat-card" style="cursor: pointer;" onclick="loadModule('vestidos')">
                            <div class="stat-icon green">👗</div>
                            <div class="stat-info">
                                <h3>Nuevo Vestido</h3>
                                <p style="font-size: 14px;">Cargar vestido</p>
                            </div>
                        </div>
                        ${window.currentUser && window.currentUser.rol !== 'Empleado' ? `
                        <div class="stat-card" style="cursor: pointer;" onclick="loadModule('reportes')">
                            <div class="stat-icon orange">📊</div>
                            <div class="stat-info">
                                <h3>Ver Reportes</h3>
                                <p style="font-size: 14px;">Estadísticas</p>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await this.cargarEstadisticas();
    },

    async cargarEstadisticas() {
        try {
            const hoy = fechaLocalStr(new Date());

            // Ejecutar todas las consultas en paralelo para mayor velocidad
            const [usuarios, clientes, vestidos, ventasHoy, ventasDeHoy] = await Promise.all([
                DBHelper.query(
                    'SELECT COUNT(*) as total FROM usuarios WHERE estado = ?',
                    ['activo']
                ),
                DBHelper.query(
                    'SELECT COUNT(*) as total FROM clientes WHERE eliminado = 0'
                ),
                DBHelper.query(
                    'SELECT COUNT(*) as total FROM vestidos WHERE eliminado = 0 AND stock > 0'
                ),
                DBHelper.query(
                    `SELECT COUNT(*) as total, SUM(total) as ingresos, AVG(total) as promedio
                     FROM ventas
                     WHERE DATE(fecha_venta) = ?`,
                    [hoy]
                ),
                DBHelper.query(
                    `SELECT v.id_venta, v.nombre_cliente, v.total, fp.nombre as forma_pago, v.fecha_venta
                     FROM ventas v
                     LEFT JOIN formas_pago fp ON v.id_forma_pago = fp.id_forma_pago
                     WHERE DATE(v.fecha_venta) = ?
                     ORDER BY v.fecha_venta DESC
                     LIMIT 5`,
                    [hoy]
                )
            ]);

            document.getElementById('statUsuarios').textContent = usuarios[0].total;
            document.getElementById('statClientes').textContent = clientes[0].total;
            document.getElementById('statVestidos').textContent = vestidos[0].total;
            document.getElementById('statVentas').textContent = ventasHoy[0].total || 0;
            document.getElementById('statIngresosMes').textContent = formatCurrency(ventasHoy[0].ingresos || 0);
            document.getElementById('statPromedio').textContent = formatCurrency(ventasHoy[0].promedio || 0);

            const tbody = document.getElementById('ultimasVentasBody');
            if (ventasDeHoy.length > 0) {
                tbody.innerHTML = ventasDeHoy.map(venta => `
                    <tr>
                        <td>#${venta.id_venta}</td>
                        <td>${venta.nombre_cliente || 'Cliente anónimo'}</td>
                        <td>${formatCurrency(venta.total)}</td>
                        <td>${venta.forma_pago}</td>
                        <td>${formatDate(venta.fecha_venta)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas registradas hoy</td></tr>';
            }

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    }
};
