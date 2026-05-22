const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Database = require('./src/database/db');

// Evitar errores de GPU cache en Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0d1520',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: true,
    icon: path.join(__dirname, 'src/imagenes/logoLuisinaVestidos.png'),
    show: false
  });

  mainWindow.maximize();

  // Mostrar la ventana solo cuando el HTML y CSS estén completamente cargados (evita deformación)
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Fix bug Electron/Windows: inputs dejan de responder tras minimizar/restaurar
  // o tras interactuar con las DevTools (consola).
  const refocusRenderer = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.focus();
    }
  };
  mainWindow.on('focus', refocusRenderer);
  mainWindow.on('restore', refocusRenderer);

  // Al salir de la consola DevTools (cerrarla o hacer clic fuera), devolver
  // el foco al renderer para que los inputs vuelvan a responder.
  mainWindow.webContents.on('devtools-blur', () => {
    setImmediate(refocusRenderer);
  });
  mainWindow.webContents.on('devtools-closed', () => {
    setImmediate(refocusRenderer);
  });

  // El renderer avisa que hubo un mousedown: forzar foco del webContents
  // desde el proceso principal ANTES de que el renderer intente enfocar
  // el input específico. Necesario cuando DevTools está acoplada (docked).
  ipcMain.on('renderer-mousedown', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.webContents.focus();
    }
  });
}

app.whenReady().then(() => {
  // Crear ventana y cargar login directamente (el splash está dentro del login)
  createWindow();
  mainWindow.loadFile('src/index.html');

  // Inicializar BD en paralelo sin bloquear la UI
  try {
    db = new Database();
    global.db = db;
  } catch (error) {
    console.error('Error al iniciar la base de datos:', error);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin') {
    if (db) await db.close();
    app.quit();
  }
});

// IPC Handlers para comunicación con el renderer (MySQL es asíncrono)
ipcMain.handle('query-db', async (event, sql, params) => {
  try {
    const data = await db.query(sql, params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-db', async (event, sql, params) => {
  try {
    const data = await db.execute(sql, params);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handler para obtener ruta de descargas
ipcMain.handle('get-downloads-path', async () => {
  return app.getPath('downloads');
});

// Handler para diálogo de guardar archivo
ipcMain.handle('show-save-dialog', async (event, options) => {
  return await dialog.showSaveDialog(mainWindow, options);
});

// Handler para preguntar qué hacer con el comprobante
ipcMain.handle('show-comprobante-options', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Comprobante de venta',
    message: '¿Qué desea hacer con el comprobante?',
    buttons: ['Guardar PDF', 'Imprimir', 'Cancelar'],
    defaultId: 0,
    cancelId: 2
  });
  return result.response; // 0=Guardar, 1=Imprimir, 2=Cancelar
});

// Handler para comprobante cuando se va a enviar por correo (sin opción Imprimir)
ipcMain.handle('show-comprobante-email-options', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Comprobante de venta',
    message: '¿Qué desea hacer con el comprobante?',
    buttons: ['Guardar comprobante y enviar por correo', 'Cancelar'],
    defaultId: 0,
    cancelId: 1
  });
  return result.response; // 0=Guardar y enviar, 1=Cancelar
});

// Handler para diálogos de confirmación (reemplaza window.confirm() para
// evitar que el pipeline de teclado del renderer se rompa en Windows).
ipcMain.handle('show-confirm-dialog', async (event, message) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Confirmar',
    message: message,
    buttons: ['Cancelar', 'Aceptar'],
    defaultId: 1,
    cancelId: 0
  });
  // Restaurar foco al renderer inmediatamente después de cerrar el diálogo
  setImmediate(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.webContents.focus();
    }
  });
  return result.response === 1; // true = Aceptar, false = Cancelar
});

// Handler para elegir formato de exportación (PDF o Excel)
ipcMain.handle('show-export-format-dialog', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Exportar reporte',
    message: '¿En qué formato desea exportar?',
    buttons: ['PDF', 'Excel', 'Cancelar'],
    defaultId: 0,
    cancelId: 2
  });
  return result.response; // 0=PDF, 1=Excel, 2=Cancelar
});

// Handler para imprimir un PDF con el diálogo nativo de Windows
ipcMain.handle('print-pdf', async (event, filePath) => {
  return new Promise((resolve) => {
    const fileUrl = require('url').pathToFileURL(filePath).toString();

    const printWindow = new BrowserWindow({
      show: false, // nunca se muestra — solo carga el PDF para enviarlo a la impresora
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        plugins: true
      }
    });

    printWindow.setMenu(null);
    printWindow.loadURL(fileUrl);

    printWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        printWindow.webContents.print({ silent: false }, (success) => {
          printWindow.destroy();
          const fs = require('fs');
          try { fs.unlinkSync(filePath); } catch (e) {}
          resolve({ success });
        });
      }, 1500);
    });

    printWindow.on('closed', () => {
      resolve({ success: false });
    });
  });
});

// Handler para enviar código de recuperación de contraseña por email
ipcMain.handle('send-recovery-email', async (event, correo) => {
  try {
    const usuarios = await db.query(
      'SELECT * FROM usuarios WHERE correo = ? AND estado = "activo"',
      [correo]
    );
    if (!usuarios || usuarios.length === 0) {
      return { success: false, error: 'Correo no encontrado en el sistema.' };
    }
    const usuario = usuarios[0];

    // Invalidar tokens anteriores
    await db.execute(
      'UPDATE recuperacion_contrasena SET usado = 1 WHERE id_usuario = ?',
      [usuario.id_usuario]
    );

    // Generar código de 6 caracteres
    const crypto = require('crypto');
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Usar DATE_ADD(NOW(), INTERVAL 24 HOUR) para evitar problemas de zona horaria
    await db.execute(
      'INSERT INTO recuperacion_contrasena (id_usuario, token, expiracion) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [usuario.id_usuario, token]
    );

    // Enviar email con el código
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ropa.ll100@gmail.com',
        pass: 'pwpbqxrmvandknok'
      }
    });

    await transporter.sendMail({
      from: '"Luisina Vestidos" <ropa.ll100@gmail.com>',
      to: correo,
      subject: 'Recuperación de contraseña - Luisina Vestidos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin:0;">LUISINA VESTIDOS</h1>
            <p style="margin:5px 0 0;">Recuperación de Contraseña</p>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hola <strong>${usuario.nombre_usuario}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Ingresá el siguiente código en la aplicación:</p>
            <div style="background: #f8f9fa; border: 2px dashed #764ba2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #764ba2;">${token}</span>
            </div>
            <p style="color: #666; font-size: 14px;">⏰ Este código expira en <strong>24 horas</strong>.</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, podés ignorar este mensaje.</p>
          </div>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error('Error en send-recovery-email:', error);
    return { success: false, error: 'Error al enviar el correo. Verificá la configuración de email.' };
  }
});

// Handler para validar código y restablecer contraseña
ipcMain.handle('reset-password', async (event, { token, nuevaContrasena }) => {
  try {
    const rows = await db.query(
      'SELECT * FROM recuperacion_contrasena WHERE token = ? AND usado = 0 AND expiracion > NOW()',
      [token.toUpperCase().trim()]
    );
    if (!rows || rows.length === 0) {
      return { success: false, error: 'Código inválido o expirado.' };
    }
    const recovery = rows[0];

    await db.execute(
      'UPDATE usuarios SET contraseña = ? WHERE id_usuario = ?',
      [nuevaContrasena, recovery.id_usuario]
    );

    await db.execute(
      'UPDATE recuperacion_contrasena SET usado = 1 WHERE id = ?',
      [recovery.id]
    );

    return { success: true };
  } catch (error) {
    console.error('Error en reset-password:', error);
    return { success: false, error: error.message };
  }
});
