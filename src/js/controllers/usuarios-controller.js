const UsuariosController = {
    async getAllUsuarios() {
        return await DBHelper.query(
            `SELECT id_usuario, nombre_usuario, correo, rol, estado, fecha_creacion 
             FROM usuarios ORDER BY fecha_creacion DESC`
        );
    },

    async getUsuarioById(id) {
        return await DBHelper.get(
            'SELECT * FROM usuarios WHERE id_usuario = ?',
            [id]
        );
    },

    async createUsuario(data) {
        try {
            // Verificar si ya existe el usuario o correo
            const existe = await DBHelper.query(
                'SELECT * FROM usuarios WHERE (nombre_usuario = ? OR correo = ?)',
                [data.nombre_usuario, data.correo]
            );

            if (existe.length > 0) {
                throw new Error('El nombre de usuario o correo ya existe');
            }

            const result = await DBHelper.insert('usuarios', {
                nombre_usuario: data.nombre_usuario,
                contraseña: data.contraseña,
                correo: data.correo,
                rol: data.rol,
                estado: 'activo'
            });

            // Registrar en historial
            await DBHelper.registrarHistorial(
                'usuarios',
                result.insertId,
                'Creación',
                `Usuario ${data.nombre_usuario} creado con rol ${data.rol}`,
                getCurrentUserName()
            );

            return { success: true, id: result.insertId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async updateUsuario(id, data) {
        try {
            const anterior = await this.getUsuarioById(id);
            if (!anterior) {
                throw new Error('Usuario no encontrado');
            }

            const etiquetas = {
                nombre_usuario: 'Usuario', correo: 'Correo',
                rol: 'Rol', estado: 'Estado'
            };

            const camposNumericos = new Set(['estado']);

            const cambios = Object.keys(data)
                .filter(key => {
                    if (camposNumericos.has(key)) {
                        return parseFloat(data[key]) !== parseFloat(anterior[key]);
                    }
                    return String(data[key]) !== String(anterior[key]);
                })
                .map(key => `${etiquetas[key] || key}: "${anterior[key]}" → "${data[key]}"`)
                .join(', ');

            await DBHelper.update('usuarios', data, 'id_usuario = ?', [id]);

            await DBHelper.registrarHistorial(
                'usuarios',
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

    async cambiarEstado(id, nuevoEstado) {
        try {
            await DBHelper.update('usuarios', { estado: nuevoEstado }, 'id_usuario = ?', [id]);
            
            await DBHelper.registrarHistorial(
                'usuarios',
                id,
                'Cambio de estado',
                `Estado cambiado a: ${nuevoEstado}`,
                getCurrentUserName()
            );

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getHistorial(idUsuario) {
        return await DBHelper.query(
            `SELECT * FROM historial_usuarios 
             WHERE id_usuario = ? 
             ORDER BY fecha_accion DESC`,
            [idUsuario]
        );
    }
};
