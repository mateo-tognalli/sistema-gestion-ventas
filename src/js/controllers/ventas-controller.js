const VentasController = {
    carrito: [],

    async getFormasPago() {
        return await DBHelper.query('SELECT * FROM formas_pago ORDER BY nombre ASC');
    },

    agregarAlCarrito(vestido, cantidad = 1) {
        // Validar que el vestido tenga stock
        if (vestido.stock <= 0) {
            throw new Error('Este vestido no tiene stock disponible');
        }
        
        const existe = this.carrito.find(item => item.id_vestido === vestido.id_vestido);
        
        if (existe) {
            // Validar stock considerando lo que ya está en el carrito
            if (existe.cantidad + cantidad > vestido.stock) {
                throw new Error(`Stock insuficiente. Disponible: ${vestido.stock}, en carrito: ${existe.cantidad}`);
            }
            existe.cantidad += cantidad;
            existe.subtotal = existe.cantidad * existe.precio_unitario;
        } else {
            if (cantidad > vestido.stock) {
                throw new Error(`Stock insuficiente. Disponible: ${vestido.stock}`);
            }
            this.carrito.push({
                id_vestido: vestido.id_vestido,
                codigo_vestido: vestido.codigo,
                nombre_vestido: vestido.nombre,
                color: vestido.color || '',
                talle: vestido.talle || '',
                precio_unitario: vestido.precio,
                cantidad: cantidad,
                subtotal: vestido.precio * cantidad,
                stock_disponible: vestido.stock
            });
        }
    },

    quitarDelCarrito(idVestido) {
        this.carrito = this.carrito.filter(item => item.id_vestido !== idVestido);
    },

    restarDelCarrito(idVestido) {
        const item = this.carrito.find(i => i.id_vestido === idVestido);
        if (!item) return;
        if (item.cantidad <= 1) {
            this.carrito = this.carrito.filter(i => i.id_vestido !== idVestido);
        } else {
            item.cantidad -= 1;
            item.subtotal = item.cantidad * item.precio_unitario;
        }
    },

    vaciarCarrito() {
        this.carrito = [];
    },

    calcularTotal() {
        return this.carrito.reduce((total, item) => total + item.subtotal, 0);
    },

    async procesarVenta(datosVenta) {
        try {
            if (this.carrito.length === 0) {
                throw new Error('El carrito está vacío');
            }

            // Insertar venta
            const descuento = datosVenta.descuento || 0;
            const totalConDescuento = Math.round(this.calcularTotal() * (1 - descuento / 100));
            const ventaResult = await DBHelper.insert('ventas', {
                id_cliente: datosVenta.id_cliente || null,
                nombre_cliente: datosVenta.nombre_cliente || null,
                total: totalConDescuento,
                descuento: descuento,
                devuelta: 0,
                id_forma_pago: datosVenta.id_forma_pago,
                usuario_venta: getCurrentUserName(),
                correo_enviado: 0
            });

            const idVenta = ventaResult.insertId;

            // Insertar detalles y actualizar stock
            for (const item of this.carrito) {
                await DBHelper.insert('detalles_venta', {
                    id_venta: idVenta,
                    id_vestido: item.id_vestido,
                    codigo_vestido: item.codigo_vestido,
                    nombre_vestido: item.nombre_vestido,
                    precio_unitario: item.precio_unitario,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal
                });

                // Actualizar stock del vestido
                await VestidosController.actualizarStock(item.id_vestido, item.cantidad);
            }

            return { success: true, idVenta: idVenta };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getVenta(idVenta) {
        const venta = await DBHelper.get(
            `SELECT v.*, fp.nombre as forma_pago
             FROM ventas v
             LEFT JOIN formas_pago fp ON v.id_forma_pago = fp.id_forma_pago
             WHERE v.id_venta = ?`,
            [idVenta]
        );

        const detalles = await DBHelper.query(
            'SELECT * FROM detalles_venta WHERE id_venta = ?',
            [idVenta]
        );

        return { venta, detalles };
    },

    async getAllVentas(filtros = {}) {
        let sql = `
            SELECT v.*, fp.nombre as forma_pago
            FROM ventas v
            LEFT JOIN formas_pago fp ON v.id_forma_pago = fp.id_forma_pago
            WHERE 1=1
        `;
        const params = [];

        if (filtros.fechaInicio) {
            sql += ' AND DATE(v.fecha_venta) >= DATE(?)';
            params.push(filtros.fechaInicio);
        }

        if (filtros.fechaFin) {
            sql += ' AND DATE(v.fecha_venta) <= DATE(?)';
            params.push(filtros.fechaFin);
        }

        if (filtros.formaPago) {
            sql += ' AND v.id_forma_pago = ?';
            params.push(filtros.formaPago);
        }

        if (filtros.busqueda) {
            sql += ' AND (v.nombre_cliente LIKE ? OR v.id_venta LIKE ?)';
            params.push(`%${filtros.busqueda}%`, `%${filtros.busqueda}%`);
        }

        sql += ' ORDER BY v.fecha_venta DESC';

        const limiteNum = Number(filtros.limit) || 10;
        const offsetNum = Number(filtros.offset) || 0;
        sql += ` LIMIT ${limiteNum} OFFSET ${offsetNum}`;

        return await DBHelper.query(sql, params);
    },

    async countVentas(filtros = {}) {
        let sql = `
            SELECT COUNT(*) as total
            FROM ventas v
            WHERE 1=1
        `;
        const params = [];

        if (filtros.fechaInicio) {
            sql += ' AND DATE(v.fecha_venta) >= DATE(?)';
            params.push(filtros.fechaInicio);
        }

        if (filtros.fechaFin) {
            sql += ' AND DATE(v.fecha_venta) <= DATE(?)';
            params.push(filtros.fechaFin);
        }

        if (filtros.formaPago) {
            sql += ' AND v.id_forma_pago = ?';
            params.push(filtros.formaPago);
        }

        if (filtros.busqueda) {
            sql += ' AND (v.nombre_cliente LIKE ? OR v.id_venta LIKE ?)';
            params.push(`%${filtros.busqueda}%`, `%${filtros.busqueda}%`);
        }

        const result = await DBHelper.query(sql, params);
        return result[0].total;
    },

    async getVentasConDetallesParaReporte(filtros = {}) {
        let sql = `
            SELECT
                v.id_venta,
                COALESCE(v.nombre_cliente, 'Cliente anónimo') as nombre_cliente,
                v.total,
                fp.nombre as forma_pago,
                v.usuario_venta,
                v.fecha_venta,
                dv.codigo_vestido,
                dv.nombre_vestido,
                dv.cantidad
            FROM ventas v
            LEFT JOIN formas_pago fp ON v.id_forma_pago = fp.id_forma_pago
            LEFT JOIN detalles_venta dv ON v.id_venta = dv.id_venta
            WHERE 1=1
        `;
        const params = [];

        if (filtros.fechaInicio) {
            sql += ' AND DATE(v.fecha_venta) >= DATE(?)';
            params.push(filtros.fechaInicio);
        }

        if (filtros.fechaFin) {
            sql += ' AND DATE(v.fecha_venta) <= DATE(?)';
            params.push(filtros.fechaFin);
        }

        sql += ' ORDER BY v.fecha_venta DESC, v.id_venta ASC';
        return await DBHelper.query(sql, params);
    },

    async devolverVenta(idVenta) {
        try {
            const venta = await DBHelper.get('SELECT * FROM ventas WHERE id_venta = ?', [idVenta]);
            if (!venta) return { success: false, error: 'Venta no encontrada' };
            if (venta.devuelta) return { success: false, error: 'Esta venta ya fue devuelta anteriormente' };

            const detalles = await DBHelper.query('SELECT * FROM detalles_venta WHERE id_venta = ?', [idVenta]);

            // Marcar venta como devuelta
            await DBHelper.update('ventas', { devuelta: 1 }, 'id_venta = ?', [idVenta]);

            // Restaurar stock de cada vestido
            for (const detalle of detalles) {
                const vestido = await VestidosController.getVestidoById(detalle.id_vestido);
                if (vestido) {
                    const nuevoStock = vestido.stock + detalle.cantidad;
                    await DBHelper.update('vestidos', { stock: nuevoStock }, 'id_vestido = ?', [detalle.id_vestido]);
                    await DBHelper.registrarHistorial(
                        'vestidos',
                        detalle.id_vestido,
                        'Devolución',
                        `Stock restaurado de ${vestido.stock} a ${nuevoStock} por devolución de venta #${idVenta}`,
                        getCurrentUserName()
                    );
                }
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};