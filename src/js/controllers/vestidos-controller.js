const VestidosController = {
    async getAllVestidos() {
        return await DBHelper.query(
            `SELECT v.*, c.nombre as categoria_nombre 
             FROM vestidos v
             LEFT JOIN categorias c ON v.id_categoria = c.id_categoria
             WHERE v.eliminado = 0 
             ORDER BY v.fecha_carga DESC`
        );
    },

    async getVestidoById(id) {
        return await DBHelper.get(
            `SELECT v.*, c.nombre as categoria_nombre 
             FROM vestidos v
             LEFT JOIN categorias c ON v.id_categoria = c.id_categoria
             WHERE v.id_vestido = ? AND v.eliminado = 0`,
            [id]
        );
    },

    async getCategorias() {
        return await DBHelper.query('SELECT * FROM categorias ORDER BY nombre ASC');
    },

    async createVestido(data) {
        try {
            // Verificar si el código ya existe
            const existe = await DBHelper.query(
                'SELECT * FROM vestidos WHERE codigo = ? AND eliminado = 0',
                [data.codigo]
            );

            if (existe.length > 0) {
                throw new Error('El código de vestido ya existe');
            }

            // Verificar si ya existe un vestido con misma combinación nombre+color+talle+categoría
            const duplicado = await DBHelper.query(
                'SELECT * FROM vestidos WHERE nombre = ? AND color = ? AND talle = ? AND id_categoria = ? AND eliminado = 0',
                [data.nombre, data.color, data.talle, data.id_categoria]
            );

            if (duplicado.length > 0) {
                throw new Error('Ya existe un vestido con el mismo nombre, color, talle y categoría');
            }

            const result = await DBHelper.insert('vestidos', data);

            await DBHelper.registrarHistorial(
                'vestidos',
                result.insertId,
                'Creación',
                `Vestido ${data.nombre} (${data.codigo}) cargado al inventario`,
                getCurrentUserName()
            );

            return { success: true, id: result.insertId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async updateVestido(id, data) {
        try {
            const anterior = await this.getVestidoById(id);

            const etiquetas = {
                nombre: 'Nombre', codigo: 'Código', talle: 'Talle',
                id_categoria: 'Categoría', color: 'Color',
                precio: 'Precio', stock: 'Stock'
            };

            const camposNumericos = new Set(['precio', 'stock', 'id_categoria']);

            // Resolver nombre de la nueva categoría si cambió
            let nuevaCategoriaNombre = anterior.categoria_nombre;
            if (data.id_categoria && parseFloat(data.id_categoria) !== parseFloat(anterior.id_categoria)) {
                const cat = await DBHelper.get('SELECT nombre FROM categorias WHERE id_categoria = ?', [data.id_categoria]);
                if (cat) nuevaCategoriaNombre = cat.nombre;
            }

            const cambios = Object.keys(data)
                .filter(key => {
                    if (camposNumericos.has(key)) {
                        return parseFloat(data[key]) !== parseFloat(anterior[key]);
                    }
                    return String(data[key]) !== String(anterior[key]);
                })
                .map(key => {
                    if (key === 'id_categoria') {
                        return `Categoría: "${anterior.categoria_nombre}" → "${nuevaCategoriaNombre}"`;
                    }
                    return `${etiquetas[key] || key}: "${anterior[key]}" → "${data[key]}"`;
                })
                .join(', ');

            await DBHelper.update('vestidos', data, 'id_vestido = ?', [id]);

            await DBHelper.registrarHistorial(
                'vestidos',
                id,
                'Modificación',
                cambios ? `Cambios: ${cambios}` : 'Sin cambios detectados',
                getCurrentUserName()
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async actualizarStock(id, cantidad) {
        try {
            const vestido = await this.getVestidoById(id);
            if (!vestido) {
                throw new Error('Vestido no encontrado');
            }

            const nuevoStock = vestido.stock - cantidad;
            if (nuevoStock < 0) {
                throw new Error('Stock insuficiente');
            }

            await DBHelper.update('vestidos', { stock: nuevoStock }, 'id_vestido = ?', [id]);

            await DBHelper.registrarHistorial(
                'vestidos',
                id,
                'Actualización de stock',
                `Stock actualizado de ${vestido.stock} a ${nuevoStock} unidades`,
                getCurrentUserName()
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getHistorial(idVestido) {
        return await DBHelper.query(
            `SELECT * FROM historial_vestidos 
             WHERE id_vestido = ? 
             ORDER BY fecha_accion DESC`,
            [idVestido]
        );
    },

    async buscarVestidos(termino) {
        return await DBHelper.query(
            `SELECT v.*, c.nombre as categoria_nombre 
             FROM vestidos v
             LEFT JOIN categorias c ON v.id_categoria = c.id_categoria
             WHERE v.eliminado = 0 
             AND (v.nombre LIKE ? OR v.codigo LIKE ? OR v.color LIKE ?)
             ORDER BY v.nombre ASC`,
            [`%${termino}%`, `%${termino}%`, `%${termino}%`]
        );
    }
};
