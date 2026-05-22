const mysql = require('mysql2/promise');
const config = require('./mysql-config');

class DatabaseManager {
  constructor() {
    this.pool = null;
    this.initConnection();
  }

  async initConnection() {
    try {
      // Intentar crear el pool directamente con la base de datos
      // Si la BD no existe aún, la creamos con una conexión temporal previa
      this.pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionLimit: config.connectionLimit,
        waitForConnections: config.waitForConnections,
        queueLimit: config.queueLimit,
        timezone: config.timezone,
        charset: config.charset
      });

      // Probar la conexión; si falla por base de datos inexistente, crearla
      try {
        const conn = await this.pool.getConnection();
        conn.release();
      } catch (poolErr) {
        if (poolErr.code === 'ER_BAD_DB_ERROR') {
          await this.pool.end();
          const tempConn = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            charset: config.charset
          });
          await tempConn.query(
            `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
          );
          await tempConn.end();

          this.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            connectionLimit: config.connectionLimit,
            waitForConnections: config.waitForConnections,
            queueLimit: config.queueLimit,
            timezone: config.timezone,
            charset: config.charset
          });
        } else {
          throw poolErr;
        }
      }

      console.log('✓ Conexión a MySQL establecida');

      // Inicializar estructura de base de datos
      await this.initDatabase();
    } catch (error) {
      console.error('✗ Error al conectar con MySQL:', error.message);
      console.error('\nVERIFICA:');
      console.error('1. MySQL Server está ejecutándose');
      console.error('2. La contraseña en mysql-config.js es correcta');
      throw error;
    }
  }

  async initDatabase() {
    const connection = await this.pool.getConnection();
    
    try {
      // Verificar si la base ya fue inicializada comprobando la tabla más completa
      const [tablas] = await connection.query(
        `SELECT COUNT(*) as total FROM information_schema.tables
         WHERE table_schema = ? AND table_name = 'detalles_venta'`,
        [config.database]
      );
      const yaInicializada = tablas[0].total > 0;

      if (!yaInicializada) {
        // Primera vez: crear toda la estructura

        // Grupo 1: Tablas base (sin foreign keys) — en paralelo
        await Promise.all([
          connection.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
              id_usuario INT AUTO_INCREMENT PRIMARY KEY,
              nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
              contraseña VARCHAR(255) NOT NULL,
              correo VARCHAR(100) NOT NULL UNIQUE,
              rol ENUM('Admin', 'Empleado') NOT NULL,
              estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
              fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_usuario (nombre_usuario),
              INDEX idx_rol (rol),
              INDEX idx_estado (estado)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS clientes (
              id_cliente INT AUTO_INCREMENT PRIMARY KEY,
              nombre VARCHAR(100) NOT NULL,
              apellido VARCHAR(100) NOT NULL,
              telefono VARCHAR(20),
              correo VARCHAR(100),
              direccion TEXT,
              fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
              eliminado TINYINT(1) DEFAULT 0,
              INDEX idx_nombre (nombre, apellido)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS categorias (
              id_categoria INT AUTO_INCREMENT PRIMARY KEY,
              nombre VARCHAR(50) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS formas_pago (
              id_forma_pago INT AUTO_INCREMENT PRIMARY KEY,
              nombre VARCHAR(50) NOT NULL UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `)
        ]);

        // Inserts de datos por defecto — en paralelo
        await Promise.all([
          connection.query(`INSERT IGNORE INTO categorias (nombre) VALUES ('Casual'), ('Fiesta'), ('Noche'), ('Formal'), ('Cocktail');`),
          connection.query(`INSERT IGNORE INTO formas_pago (nombre) VALUES ('Efectivo'), ('Transferencia');`)
        ]);

        // Grupo 2: Tablas que dependen del grupo 1 — en paralelo
        await Promise.all([
          connection.query(`
            CREATE TABLE IF NOT EXISTS historial_usuarios (
              id_historial INT AUTO_INCREMENT PRIMARY KEY,
              id_usuario INT NOT NULL,
              accion VARCHAR(100) NOT NULL,
              descripcion TEXT,
              usuario_accion VARCHAR(100) NOT NULL,
              fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
              INDEX idx_fecha (fecha_accion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS historial_clientes (
              id_historial INT AUTO_INCREMENT PRIMARY KEY,
              id_cliente INT NOT NULL,
              accion VARCHAR(100) NOT NULL,
              descripcion TEXT,
              usuario_accion VARCHAR(100) NOT NULL,
              fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
              INDEX idx_fecha (fecha_accion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS vestidos (
              id_vestido INT AUTO_INCREMENT PRIMARY KEY,
              codigo VARCHAR(50) NOT NULL UNIQUE,
              nombre VARCHAR(200) NOT NULL,
              talle VARCHAR(20) NOT NULL,
              id_categoria INT NOT NULL,
              color VARCHAR(50) NOT NULL,
              precio DECIMAL(10,2) NOT NULL CHECK(precio >= 0),
              stock INT NOT NULL DEFAULT 1,
              fecha_carga DATETIME DEFAULT CURRENT_TIMESTAMP,
              eliminado TINYINT(1) DEFAULT 0,
              FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
              INDEX idx_codigo (codigo),
              INDEX idx_categoria (id_categoria),
              INDEX idx_stock (stock)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS recuperacion_contrasena (
              id INT AUTO_INCREMENT PRIMARY KEY,
              id_usuario INT NOT NULL,
              token VARCHAR(10) NOT NULL,
              expiracion DATETIME NOT NULL,
              usado TINYINT(1) NOT NULL DEFAULT 0,
              fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
              INDEX idx_token (token),
              INDEX idx_usuario_recuperacion (id_usuario)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `)
        ]);

        // Grupo 3: Tablas que dependen del grupo 2 — en paralelo
        await Promise.all([
          connection.query(`
            CREATE TABLE IF NOT EXISTS historial_vestidos (
              id_historial INT AUTO_INCREMENT PRIMARY KEY,
              id_vestido INT NOT NULL,
              accion VARCHAR(100) NOT NULL,
              descripcion TEXT,
              usuario_accion VARCHAR(100) NOT NULL,
              fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (id_vestido) REFERENCES vestidos(id_vestido) ON DELETE CASCADE,
              INDEX idx_fecha (fecha_accion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `),
          connection.query(`
            CREATE TABLE IF NOT EXISTS ventas (
              id_venta INT AUTO_INCREMENT PRIMARY KEY,
              id_cliente INT,
              nombre_cliente VARCHAR(200),
              total DECIMAL(10,2) NOT NULL CHECK(total >= 0),
              descuento DECIMAL(5,2) NOT NULL DEFAULT 0,
              devuelta TINYINT(1) NOT NULL DEFAULT 0,
              id_forma_pago INT NOT NULL,
              fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
              usuario_venta VARCHAR(100) NOT NULL,
              correo_enviado TINYINT(1) DEFAULT 0,
              FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE SET NULL,
              FOREIGN KEY (id_forma_pago) REFERENCES formas_pago(id_forma_pago),
              INDEX idx_fecha (fecha_venta),
              INDEX idx_cliente (id_cliente),
              INDEX idx_devuelta (devuelta)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
          `)
        ]);

        // Grupo 4: detalles_venta (depende de ventas y vestidos)
        await connection.query(`
          CREATE TABLE IF NOT EXISTS detalles_venta (
            id_detalle INT AUTO_INCREMENT PRIMARY KEY,
            id_venta INT NOT NULL,
            id_vestido INT NOT NULL,
            codigo_vestido VARCHAR(50) NOT NULL,
            nombre_vestido VARCHAR(200) NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            cantidad INT NOT NULL DEFAULT 1,
            subtotal DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
            FOREIGN KEY (id_vestido) REFERENCES vestidos(id_vestido),
            INDEX idx_venta (id_venta)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Crear usuario admin por defecto
        const [admins] = await connection.query(
          'SELECT COUNT(*) as count FROM usuarios WHERE rol = ?',
          ['Admin']
        );
        if (admins[0].count === 0) {
          await connection.query(`
            INSERT INTO usuarios (nombre_usuario, contraseña, correo, rol, estado)
            VALUES (?, ?, ?, ?, ?)
          `, ['admin', 'admin123', 'admin@luisinavestidos.com', 'Admin', 'activo']);
          console.log('✓ Usuario administrador creado (admin/admin123)');
        }

        console.log('✓ Base de datos inicializada correctamente');
      }

      // Migraciones: siempre corren pero son no-ops si las columnas ya existen
      await Promise.all([
        connection.query(`ALTER TABLE ventas ADD COLUMN descuento DECIMAL(5,2) NOT NULL DEFAULT 0`).catch(() => {}),
        connection.query(`ALTER TABLE ventas ADD COLUMN devuelta TINYINT(1) NOT NULL DEFAULT 0`).catch(() => {}),
        connection.query(`ALTER TABLE ventas ADD INDEX idx_devuelta (devuelta)`).catch(() => {}),
        connection.query(`ALTER TABLE clientes ADD COLUMN estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'`).catch(() => {}),
        connection.query(`ALTER TABLE clientes ADD INDEX idx_estado (estado)`).catch(() => {})
      ]);

    } catch (error) {
      console.error('Error al inicializar base de datos:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Error en query:', error);
      throw error;
    }
  }

  async execute(sql, params = []) {
    try {
      const [result] = await this.pool.execute(sql, params);
      return result;
    } catch (error) {
      console.error('Error en execute:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error en get:', error);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✓ Conexión a MySQL cerrada');
    }
  }
}

module.exports = DatabaseManager;
