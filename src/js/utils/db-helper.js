const { ipcRenderer } = require('electron');

// Hacer ipcRenderer disponible globalmente para otros módulos
if (typeof window !== 'undefined') {
    window.ipcRenderer = ipcRenderer;
}

// Clase helper para manejo de base de datos
class DBHelper {
    static async query(sql, params = []) {
        try {
            const result = await ipcRenderer.invoke('query-db', sql, params);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error en query:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error en DBHelper.query:', error);
            throw error;
        }
    }

    static async execute(sql, params = []) {
        try {
            const result = await ipcRenderer.invoke('execute-db', sql, params);
            if (result.success) {
                return result.data;
            } else {
                console.error('Error en execute:', result.error);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error en DBHelper.execute:', error);
            throw error;
        }
    }

    static async get(sql, params = []) {
        const results = await this.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }

    // Métodos específicos para operaciones comunes
    static async insert(table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        return await this.execute(sql, values);
    }

    static async update(table, data, where, whereParams = []) {
        const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        
        const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`;
        return await this.execute(sql, values);
    }

    static async softDelete(table, idColumn, id) {
        const sql = `UPDATE ${table} SET eliminado = 1 WHERE ${idColumn} = ?`;
        return await this.execute(sql, [id]);
    }

    // Registrar en historial
    static async registrarHistorial(tabla, idRegistro, accion, descripcion, usuario) {
        const tablaHistorial = `historial_${tabla}`;
        const idColumna = `id_${tabla.slice(0, -1)}`; // usuarios -> usuario
        
        const sql = `INSERT INTO ${tablaHistorial} (${idColumna}, accion, descripcion, usuario_accion) 
                     VALUES (?, ?, ?, ?)`;
        
        return await this.execute(sql, [idRegistro, accion, descripcion, usuario]);
    }
}

// Función helper para obtener el usuario actual de forma segura
function getCurrentUserName() {
    try {
        if (window.currentUser && window.currentUser.nombre_usuario) {
            return window.currentUser.nombre_usuario;
        }
        
        // Intentar obtener de sessionStorage/localStorage
        const sessionData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (sessionData) {
            const userData = JSON.parse(sessionData);
            return userData.nombre_usuario || 'Sistema';
        }
        
        return 'Sistema';
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return 'Sistema';
    }
}

// Funciones utilitarias

// Devuelve la fecha local en formato YYYY-MM-DD sin conversión UTC
function fechaLocalStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${type === 'success' ? '✓' : '⚠'}</span>
        <span>${message}</span>
    `;

    // Insertar en document.body para evitar que overflow-y: auto del
    // contentBody recorte o bloquee el z-index del elemento position:fixed
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 4000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Capitaliza la primera letra de cada palabra.
 * Ej: "juan pérez" → "Juan Pérez" | "MATEO FABRIZIO" → "Mateo Fabrizio"
 */
function capitalizeWords(str) {
    if (!str) return str;
    return str.replace(/\S+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '';
        });
    }
}