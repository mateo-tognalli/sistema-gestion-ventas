const { ipcRenderer } = require('electron');

// Verificar si ya hay sesión activa y ocultar splash
window.addEventListener('DOMContentLoaded', () => {
    const savedSession = sessionStorage.getItem('currentUser');
    if (savedSession) {
        window.location.href = 'dashboard.html';
        return;
    }
    // Ocultar splash cuando la página esté lista
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 650);
        }
    }, 1200);
});

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        // Consultar usuario en la base de datos
        const result = await ipcRenderer.invoke('query-db', 
            'SELECT * FROM usuarios WHERE nombre_usuario = ?', 
            [username]
        );
        
        if (result.success && result.data.length > 0) {
            const user = result.data[0];
            
            // Verificar contraseña
            if (user.contraseña === password) {
                // Verificar estado del usuario
                if (user.estado === 'inactivo') {
                    showError('Usuario inactivo. Contacte al administrador.');
                    return;
                }
                
                // Guardar sesión
                const sessionData = {
                    id_usuario: user.id_usuario,
                    nombre_usuario: user.nombre_usuario,
                    correo: user.correo,
                    rol: user.rol
                };
                
                sessionStorage.setItem('currentUser', JSON.stringify(sessionData));

                // Redirigir al dashboard inmediatamente
                window.location.href = 'dashboard.html';

                // Registrar inicio de sesión en historial (sin bloquear la navegación)
                ipcRenderer.invoke('execute-db',
                    'INSERT INTO historial_usuarios (id_usuario, accion, descripcion, usuario_accion) VALUES (?, ?, ?, ?)',
                    [user.id_usuario, 'Inicio de sesión', 'Usuario inició sesión en el sistema', username]
                );
            } else {
                showError('Contraseña incorrecta');
            }
        } else {
            showError('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showError('Error al iniciar sesión. Intente nuevamente.');
    }
});

// Forgot Password Modal
const modal = document.getElementById('recoveryModal');
const forgotPasswordLink = document.getElementById('forgotPassword');
const closeModal = document.querySelector('.close');

function resetModal() {
    document.getElementById('step1').style.display = '';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('recoveryForm').reset();
    document.getElementById('resetForm').reset();
    const msg = document.getElementById('recoveryMessage');
    msg.textContent = '';
    msg.className = 'success-message';
}

forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    resetModal();
    modal.classList.add('show');
});

closeModal.addEventListener('click', () => {
    resetModal();
    modal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        resetModal();
        modal.classList.remove('show');
    }
});

document.getElementById('backToStep1').addEventListener('click', () => {
    resetModal();
});

// Paso 1: Enviar código al correo
document.getElementById('recoveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('recoveryEmail').value.trim();
    const recoveryMessage = document.getElementById('recoveryMessage');
    const btn = e.target.querySelector('button[type="submit"]');

    recoveryMessage.textContent = '';
    recoveryMessage.className = 'success-message';
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const result = await ipcRenderer.invoke('send-recovery-email', email);
        if (result.success) {
            document.getElementById('correoEnviado').textContent = email;
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = '';
        } else {
            recoveryMessage.textContent = result.error || 'Error al enviar el código.';
            recoveryMessage.className = 'error-message show';
        }
    } catch (error) {
        recoveryMessage.textContent = 'Error al procesar la solicitud.';
        recoveryMessage.className = 'error-message show';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Enviar Código';
    }
});

// Paso 2: Validar código y restablecer contraseña
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('recoveryToken').value.trim().toUpperCase();
    const nuevaContrasena = document.getElementById('newPassword').value;
    const confirmarContrasena = document.getElementById('confirmPassword').value;
    const recoveryMessage = document.getElementById('recoveryMessage');
    const btn = e.target.querySelector('button[type="submit"]');

    recoveryMessage.textContent = '';
    recoveryMessage.className = 'success-message';

    if (nuevaContrasena !== confirmarContrasena) {
        recoveryMessage.textContent = 'Las contraseñas no coinciden.';
        recoveryMessage.className = 'error-message show';
        return;
    }
    if (nuevaContrasena.length < 6) {
        recoveryMessage.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        recoveryMessage.className = 'error-message show';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Restableciendo...';

    try {
        const result = await ipcRenderer.invoke('reset-password', { token, nuevaContrasena });
        if (result.success) {
            recoveryMessage.textContent = '✓ Contraseña restablecida exitosamente. Ya podés iniciar sesión.';
            recoveryMessage.className = 'success-message show';
            setTimeout(() => {
                resetModal();
                modal.classList.remove('show');
            }, 3000);
        } else {
            recoveryMessage.textContent = result.error || 'Código inválido o expirado.';
            recoveryMessage.className = 'error-message show';
        }
    } catch (error) {
        recoveryMessage.textContent = 'Error al restablecer la contraseña.';
        recoveryMessage.className = 'error-message show';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Restablecer Contraseña';
    }
});

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 4000);
}
