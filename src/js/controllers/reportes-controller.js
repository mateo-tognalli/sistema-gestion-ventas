const ReportesController = {
    async getClienteMasFrecuente(fechaInicio, fechaFin) {
        const resultado = await DBHelper.query(`
            SELECT 
                MAX(c.nombre) as nombre, 
                MAX(c.apellido) as apellido, 
                COUNT(v.id_venta) as total_compras, 
                SUM(v.total) as total_gastado
            FROM ventas v
            INNER JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.id_cliente IS NOT NULL
            AND (v.devuelta = 0 OR v.devuelta IS NULL)
            AND DATE(v.fecha_venta) BETWEEN ? AND ?
            GROUP BY v.id_cliente
            ORDER BY total_compras DESC
            LIMIT 1
        `, [fechaInicio, fechaFin]);
        return resultado.length > 0 ? resultado[0] : null;
    },

    async getVestidoMasVendido(fechaInicio, fechaFin) {
        const resultado = await DBHelper.query(`
            SELECT 
                MAX(v.nombre) as nombre, 
                MAX(v.codigo) as codigo, 
                SUM(dv.cantidad) as total_vendido, 
                SUM(dv.subtotal) as total_ingresos
            FROM detalles_venta dv
            INNER JOIN vestidos v ON dv.id_vestido = v.id_vestido
            INNER JOIN ventas ve ON dv.id_venta = ve.id_venta
            WHERE DATE(ve.fecha_venta) BETWEEN ? AND ?
            AND (ve.devuelta = 0 OR ve.devuelta IS NULL)
            GROUP BY dv.id_vestido
            ORDER BY total_vendido DESC
            LIMIT 1
        `, [fechaInicio, fechaFin]);
        return resultado.length > 0 ? resultado[0] : null;
    },

    async getIngresosPorPeriodo(fechaInicio, fechaFin) {
        const resultado = await DBHelper.query(`
            SELECT 
                COUNT(*) as total_ventas,
                SUM(total) as total_ingresos,
                AVG(total) as promedio_venta,
                MIN(total) as venta_minima,
                MAX(total) as venta_maxima
            FROM ventas
            WHERE DATE(fecha_venta) BETWEEN ? AND ?
            AND (devuelta = 0 OR devuelta IS NULL)
        `, [fechaInicio, fechaFin]);
        return resultado[0];
    },

    async getVentasPorFormaPago(fechaInicio, fechaFin) {
        return await DBHelper.query(`
            SELECT 
                MAX(fp.nombre) as forma_pago,
                COUNT(v.id_venta) as cantidad_ventas,
                CAST(SUM(v.total) AS DECIMAL(10,2)) as total_ingresos
            FROM ventas v
            INNER JOIN formas_pago fp ON v.id_forma_pago = fp.id_forma_pago
            WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
            AND (v.devuelta = 0 OR v.devuelta IS NULL)
            GROUP BY v.id_forma_pago
            ORDER BY total_ingresos DESC
        `, [fechaInicio, fechaFin]);
    },

    async getTopVestidosMasVendidos(fechaInicio, fechaFin, limite = 10) {
        const limiteNum = Number(limite) || 10;
        const params = [];
        let whereExtra = '';
        if (fechaInicio && fechaFin) {
            whereExtra = ' AND DATE(ve.fecha_venta) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return await DBHelper.query(`
            SELECT 
                MAX(v.nombre) as nombre,
                MAX(v.codigo) as codigo,
                COALESCE(MAX(c.nombre), 'Sin categoría') as categoria_nombre,
                SUM(dv.cantidad) as total_vendido,
                SUM(dv.subtotal) as total_ingresos
            FROM detalles_venta dv
            INNER JOIN vestidos v ON dv.id_vestido = v.id_vestido
            LEFT JOIN categorias c ON v.id_categoria = c.id_categoria
            INNER JOIN ventas ve ON dv.id_venta = ve.id_venta
            WHERE (ve.devuelta = 0 OR ve.devuelta IS NULL)${whereExtra}
            GROUP BY dv.id_vestido
            ORDER BY total_vendido DESC
            LIMIT ${limiteNum}
        `, params);
    },

    async getTopClientes(fechaInicio, fechaFin, limite = 10) {
        const limiteNum = Number(limite) || 10;
        const params = [];
        let whereExtra = '';
        if (fechaInicio && fechaFin) {
            whereExtra = ' AND DATE(v.fecha_venta) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return await DBHelper.query(`
            SELECT 
                MAX(c.nombre) as nombre,
                MAX(c.apellido) as apellido,
                MAX(c.correo) as correo,
                COUNT(v.id_venta) as total_compras,
                SUM(v.total) as total_gastado
            FROM ventas v
            INNER JOIN clientes c ON v.id_cliente = c.id_cliente
            WHERE v.id_cliente IS NOT NULL
            AND (v.devuelta = 0 OR v.devuelta IS NULL)${whereExtra}
            GROUP BY v.id_cliente
            ORDER BY total_gastado DESC
            LIMIT ${limiteNum}
        `, params);
    },

    async getVentasPorDia(fechaInicio, fechaFin) {
        return await DBHelper.query(`
            SELECT 
                DATE(fecha_venta) as fecha,
                COUNT(*) as cantidad_ventas,
                SUM(total) as total_ingresos
            FROM ventas
            WHERE DATE(fecha_venta) BETWEEN ? AND ?
            AND (devuelta = 0 OR devuelta IS NULL)
            GROUP BY DATE(fecha_venta)
            ORDER BY fecha DESC
        `, [fechaInicio, fechaFin]);
    },

    async getTopVendedores(fechaInicio, fechaFin, limite = 10) {
        const limiteNum = Number(limite) || 10;
        const params = [];
        let whereExtra = '';
        if (fechaInicio && fechaFin) {
            whereExtra = ' AND DATE(fecha_venta) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return await DBHelper.query(`
            SELECT 
                usuario_venta,
                COUNT(id_venta) as total_ventas,
                SUM(total) as total_ingresos
            FROM ventas
            WHERE (devuelta = 0 OR devuelta IS NULL)${whereExtra}
            GROUP BY usuario_venta
            ORDER BY total_ventas DESC
            LIMIT ${limiteNum}
        `, params);
    }
};
