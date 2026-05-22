# Luisina Vestidos - Sistema de Gestión de Ventas

Sistema profesional de gestión de ventas de vestidos desarrollado con Electron, JavaScript y MySQL.

## 🎯 Características Principales

### Gestión de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Roles: Administrador y Empleado
- ✅ Sistema de permisos
- ✅ Gestión de estados (activo/inactivo)
- ✅ Papelera con restauración
- ✅ Historial de auditoría completo
- ✅ Recuperación de contraseña por correo

### Gestión de Clientes
- ✅ Registro completo de clientes
- ✅ Edición y eliminación
- ✅ Historial de acciones
- ✅ Búsqueda avanzada

### Gestión de Vestidos
- ✅ Inventario completo
- ✅ Códigos únicos autogenerados
- ✅ Categorías predefinidas
- ✅ Control de stock
- ✅ Historial de movimientos
- ✅ Filtros por categoría y búsqueda

### Operaciones de Venta
- ✅ Sistema de carrito de compras
- ✅ Múltiples formas de pago (Efectivo, Débito, Crédito, Transferencia)
- ✅ Generación automática de comprobantes PDF
- ✅ Envío de comprobantes por correo electrónico (opcional)
- ✅ Actualización automática de stock
- ✅ Venta a clientes registrados o anónimos

### Reportes y Estadísticas
- ✅ Cliente más frecuente
- ✅ Vestido más vendido
- ✅ Filtros por fecha (día, mes, año)
- ✅ Total de ingresos con estadísticas
- ✅ Ventas por forma de pago
- ✅ Top 10 vestidos más vendidos
- ✅ Top 10 mejores clientes
- ✅ Exportación a PDF de todos los reportes

### Historial de Ventas
- ✅ Registro completo de todas las ventas
- ✅ Detalle de productos vendidos
- ✅ Filtros avanzados
- ✅ Reimpresión de comprobantes

## 🗄️ Base de Datos

Sistema de base de datos **MySQL** normalizado a la **Tercera Forma Normal (3FN)** con:

- ✅ Claves primarias y foráneas correctamente definidas
- ✅ Validaciones de integridad de datos
- ✅ Relaciones entre entidades
- ✅ Historial de auditoría para usuarios, clientes y vestidos
- ✅ Sistema de papelera para usuarios

### Entidades Principales:
- `usuarios` - Gestión de usuarios del sistema
- `clientes` - Registro de clientes
- `vestidos` - Inventario de productos
- `ventas` - Registro de ventas
- `detalles_venta` - Detalles de productos vendidos
- `categorias` - Categorías de vestidos
- `formas_pago` - Formas de pago disponibles
- `historial_usuarios` - Auditoría de usuarios
- `historial_clientes` - Auditoría de clientes
- `historial_vestidos` - Auditoría de vestidos
- `papelera_usuarios` - Usuarios eliminados con posibilidad de restaurar

## 🏗️ Arquitectura

El sistema sigue una arquitectura **MVC (Modelo-Vista-Controlador)** con separación clara de responsabilidades:

### Estructura de Carpetas:
```
sistema-ventas/
├── main.js                    # Proceso principal de Electron
├── package.json               # Configuración del proyecto
├── src/
│   ├── index.html            # Página de login
│   ├── dashboard.html        # Dashboard principal
│   ├── database/
│   │   ├── db.js            # Gestor de base de datos MySQL
│   │   └── mysql-config.js  # Configuración de conexión MySQL
│   ├── css/
│   │   ├── login.css        # Estilos del login
│   │   ├── dashboard.css    # Estilos del dashboard
│   │   └── modules.css      # Estilos de módulos
│   ├── js/
│   │   ├── auth/
│   │   │   └── login.js     # Lógica de autenticación
│   │   ├── controllers/     # Controladores (lógica de negocio)
│   │   │   ├── usuarios-controller.js
│   │   │   ├── clientes-controller.js
│   │   │   ├── vestidos-controller.js
│   │   │   ├── ventas-controller.js
│   │   │   └── reportes-controller.js
│   │   ├── views/          # Vistas (interfaz)
│   │   │   ├── inicio-view.js
│   │   │   ├── usuarios-view.js
│   │   │   ├── clientes-view.js
│   │   │   ├── vestidos-view.js
│   │   │   ├── operaciones-view.js
│   │   │   ├── reportes-view.js
│   │   │   └── historial-view.js
│   │   ├── utils/          # Utilidades
│   │   │   ├── db-helper.js
│   │   │   ├── pdf-generator.js
│   │   │   └── email-service.js
│   │   └── dashboard.js    # Coordinador principal
│   └── imagenes/
│       ├── imagenLuisina.jpg
│       └── logoLuisinaVestidos.png
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm (viene con Node.js)
- **MySQL Server** (versión 5.7 o superior)
  - Descargar desde: https://dev.mysql.com/downloads/mysql/
  - Instalar y configurar con usuario y contraseña

### Pasos de Instalación

1. **Descomprimir el proyecto** en la ubicación deseada

2. **Crear la base de datos en MySQL**:
   - Abre MySQL Workbench o línea de comandos MySQL
   - Ejecuta:
   ```sql
   CREATE DATABASE luisina_vestidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Configurar la conexión MySQL**:
   - Edita el archivo `src/database/mysql-config.js`
   - Configura tu usuario, contraseña y host de MySQL:
   ```javascript
   host: 'localhost',
   user: 'root',
   password: 'tu_contraseña_mysql',
   database: 'luisina_vestidos'
   ```

4. **Instalar dependencias**:
   ```bash
   npm install
   ```

5. **Iniciar la aplicación**:
   ```bash
   npm start
   ```
   
   La aplicación creará automáticamente todas las tablas necesarias en la base de datos.

### Credenciales por Defecto
- **Usuario:** admin
- **Contraseña:** admin123

⚠️ **Importante:** Cambiar estas credenciales después del primer inicio de sesión.

## 📦 Generar Ejecutable Portable

Para compilar la aplicación en un ejecutable portable (.exe) que puedas compartir:

```bash
npm run build
```

El ejecutable se generará en la carpeta `dist/` con el nombre `LuisinaVestidos-Portable.exe`

### Trasladar a Otra Computadora

**Opción 1: Con MySQL ya instalado**
1. Instala MySQL Server en la computadora destino
2. Exporta tu base de datos actual:
   ```bash
   mysqldump -u root -p luisina_vestidos > backup.sql
   ```
3. En la otra computadora, importa los datos:
   ```sql
   CREATE DATABASE luisina_vestidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   mysql -u root -p luisina_vestidos < backup.sql
   ```
4. Copia el proyecto completo
5. Configura `mysql-config.js` con las credenciales de la nueva máquina

**Opción 2: Sin datos previos**
1. Instala MySQL Server en la computadora destino
2. Copia el proyecto completo
3. Crea la base de datos `luisina_vestidos`
4. Configura `mysql-config.js`
5. Ejecuta la aplicación (las tablas se crearán automáticamente)

## 🎨 Diseño y Experiencia de Usuario

- ✅ Interface moderna y profesional
- ✅ Diseño responsive
- ✅ Paleta de colores personalizada (gradientes morados/azules)
- ✅ Imagen de fondo personalizada
- ✅ Logo corporativo
- ✅ Animaciones suaves
- ✅ Feedback visual en todas las acciones
- ✅ Interfaz intuitiva y fácil de usar

## 🔒 Seguridad

- ✅ Sistema de autenticación
- ✅ Roles y permisos
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Auditoría completa de acciones

## 📊 Funcionalidades Técnicas

### CRUD Implementado
- **Usuarios**: Crear, Leer, Actualizar, Eliminar (con papelera)
- **Clientes**: Crear, Leer, Actualizar, Eliminar
- **Vestidos**: Crear, Leer, Actualizar, Eliminar
- **Ventas**: Crear, Leer (con detalles completos)

### Validaciones
- ✅ Validación de correos electrónicos
- ✅ Validación de códigos únicos
- ✅ Validación de stock
- ✅ Validación de integridad de datos
- ✅ Manejo de errores y excepciones

### Reportes
- ✅ Visualización en pantalla
- ✅ Exportación a PDF
- ✅ Filtros personalizables
- ✅ Estadísticas en tiempo real

## 🛠️ Tecnologías Utilizadas

- **Electron** 28.0.0 - Framework para aplicaciones de escritorio
- **MySQL** (mysql2) - Base de datos relacional
- **PDFKit** - Generación de PDFs
- **Nodemailer** - Envío de correos electrónicos
- **HTML5/CSS3** - Interfaz de usuario
- **JavaScript ES6+** - Lógica de la aplicación

## 📝 Notas Importantes

### Configuración de Correo Electrónico

Para habilitar el envío real de correos electrónicos:

1. Edita el archivo `src/js/utils/email-service.js`
2. Cambia de `EmailServiceMock` a `EmailService`
3. Configura las credenciales SMTP en el constructor:
   ```javascript
   auth: {
       user: 'tu_correo@gmail.com',
       pass: 'tu_contraseña_de_aplicacion'
   }
   ```
4. Para Gmail, usa una "Contraseña de Aplicación" (no tu contraseña normal)

### Backup de Datos

Para hacer backup de tu base de datos MySQL:

**Desde línea de comandos:**
```bash
mysqldump -u root -p luisina_vestidos > backup_luisina_$(date +%Y%m%d).sql
```

**Desde MySQL Workbench:**
1. Server → Data Export
2. Selecciona la base de datos `luisina_vestidos`
3. Elige ubicación y formato
4. Click en "Start Export"

**Para restaurar:**
```bash
mysql -u root -p luisina_vestidos < backup_luisina_YYYYMMDD.sql
```

## 🤝 Soporte

Para soporte o consultas:
- Revisa la documentación en este README
- Verifica los logs de la aplicación (Menú > Ver > Consola de Desarrollador)

## 📄 Licencia

Este proyecto es de uso privado para Luisina Vestidos.

---

**Desarrollado con ❤️ para Luisina Vestidos**

*Sistema Profesional de Gestión de Ventas v1.0.0*
