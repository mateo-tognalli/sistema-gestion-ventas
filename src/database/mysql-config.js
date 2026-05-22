/**
 * ============================================================
 *  CONFIGURACIÓN DE CONEXIÓN MySQL — Luisina Vestidos
 * ============================================================
 *
 *  REQUISITO PREVIO:
 *    Tener MySQL Server instalado y en ejecución.
 *    Descarga: https://dev.mysql.com/downloads/mysql/
 *
 *  LA BASE DE DATOS SE CREA AUTOMÁTICAMENTE al iniciar el sistema.
 *  Solo debés completar tu contraseña de MySQL abajo.
 */

module.exports = {
  host:     'localhost',           // No cambiar si MySQL está en tu misma PC
  port:     3306,                  // Puerto por defecto de MySQL
  user:     '',                // Usuario MySQL (normalmente 'root')

  // ↓↓↓  CONTRASEÑA DE MYSQL  ↓↓↓
  // Poné acá la contraseña que elegiste al instalar MySQL.
  // Si instalaste MySQL sin contraseña dejá los apostrofes vacíos: ''
  password: '',

  database: 'luisina_vestidos',    // Nombre de la BD (se crea sola, no tocar)

  // Opciones avanzadas (no es necesario modificar)
  connectionLimit:  10,
  waitForConnections: true,
  queueLimit:       0,
  timezone:         '-03:00',      // Zona horaria Argentina (GMT-3)
  charset:          'utf8mb4'
};
