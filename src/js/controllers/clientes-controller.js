const ClientesController = {
    async getAllClientes() {
        return await DBHelper.query(
            'SELECT * FROM clientes WHERE eliminado = 0 ORDER BY fecha_registro DESC'
        );
    },

    async getClienteById(id) {
        return await DBHelper.get(
            'SELECT * FROM clientes WHERE id_cliente = ? AND eliminado = 0',
            [id]
        );
    },

    async createCliente(data) {
        try {
            // Validar teléfono y correo duplicados
            if (data.telefono) {
                const dupTel = await DBHelper.get(
                    'SELECT id_cliente FROM clientes WHERE telefono = ? AND eliminado = 0',
                    [data.telefono]
                );
                if (dupTel) return { success: false, error: 'Ya existe un cliente con ese número de teléfono.' };
            }
            if (data.correo) {
                const dupCorreo = await DBHelper.get(
                    'SELECT id_cliente FROM clientes WHERE correo = ? AND eliminado = 0',
                    [data.correo]
                );
                if (dupCorreo) return { success: false, error: 'Ya existe un cliente con ese correo electrónico.' };
            }

            // Agregar estado 'activo' por defecto
            data.estado = 'activo';

            const result = await DBHelper.insert('clientes', data);

            await DBHelper.registrarHistorial(
                'clientes',
                result.insertId,
                'Creación',
                `Cliente ${data.nombre} ${data.apellido} registrado`,
                getCurrentUserName()
            );

            return { success: true, id: result.insertId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async updateCliente(id, data) {
        try {
            const anterior = await this.getClienteById(id);

            // Validar teléfono y correo duplicados (excluyendo el cliente actual)
            if (data.telefono) {
                const dupTel = await DBHelper.get(
                    'SELECT id_cliente FROM clientes WHERE telefono = ? AND eliminado = 0 AND id_cliente != ?',
                    [data.telefono, id]
                );
                if (dupTel) return { success: false, error: 'Ya existe un cliente con ese número de teléfono.' };
            }
            if (data.correo) {
                const dupCorreo = await DBHelper.get(
                    'SELECT id_cliente FROM clientes WHERE correo = ? AND eliminado = 0 AND id_cliente != ?',
                    [data.correo, id]
                );
                if (dupCorreo) return { success: false, error: 'Ya existe un cliente con ese correo electrónico.' };
            }

            const etiquetas = {
                nombre: 'Nombre', apellido: 'Apellido',
                telefono: 'Teléfono', correo: 'Correo', direccion: 'Dirección',
                notas: 'Notas'
            };

            const cambios = Object.keys(data)
                .filter(key => String(data[key] ?? '') !== String(anterior[key] ?? ''))
                .map(key => `${etiquetas[key] || key}: "${anterior[key]}" → "${data[key]}"`)
                .join(', ');

            await DBHelper.update('clientes', data, 'id_cliente = ?', [id]);

            await DBHelper.registrarHistorial(
                'clientes',
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

    async getHistorial(idCliente) {
        return await DBHelper.query(
            `SELECT * FROM historial_clientes
             WHERE id_cliente = ?
             ORDER BY fecha_accion DESC`,
            [idCliente]
        );
    },

    async cambiarEstado(id, nuevoEstado) {
        try {
            await DBHelper.update('clientes', { estado: nuevoEstado }, 'id_cliente = ?', [id]);

            await DBHelper.registrarHistorial(
                'clientes',
                id,
                'Cambio de estado',
                `Estado cambiado a: ${nuevoEstado}`,
                getCurrentUserName()
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};
