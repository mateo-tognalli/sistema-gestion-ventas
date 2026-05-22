// Dashboard principal
let currentUser = null;
let currentModule = 'inicio';

// Fix bug Electron/Windows: al restaurar la ventana el pipeline de teclado
// se desconecta del renderer. Hacer blur+focus sobre el elemento activo lo
// reconecta sin perder el cursor ni la selección.
window.addEventListener('focus', () => {
    const el = document.activeElement;
    if (el && el !== document.body && el !== document.documentElement) {
        el.blur();
        el.focus();
    }
});

// Fix bug Electron: cuando DevTools está acoplada (docked), Chromium no
// transfiere el foco del teclado al renderer al hacer clic en la app aunque
// el mousedown/click sí se recibe.
document.addEventListener('mousedown', (e) => {
    // Paso 1: pedirle al proceso principal que tome el foco del webContents
    ipcRenderer.send('renderer-mousedown');

    // Paso 2: enfocar el elemento específico clicado después de 2 frames
    const FOCUSABLE = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'];
    let target = e.target;
    while (target && target !== document.body) {
        if (
            FOCUSABLE.includes(target.tagName) ||
            target.isContentEditable ||
            (target.tabIndex >= 0 && target.tabIndex !== -1)
        ) {
            if (!target.disabled) {
                requestAnimationFrame(() => requestAnimationFrame(() => target.focus()));
            }
            break;
        }
        target = target.parentElement;
    }
}, true); // 'true' = fase de captura, tiene prioridad sobre cualquier otro handler

// Interceptar F5 (y Ctrl+R) para recargar manteniendo la sección actual
window.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        // Guardar módulo actual antes de recargar
        localStorage.setItem('lastModule', currentModule);
        location.reload();
    }
});

// Verificar sesión al cargar
window.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay sesión activa
    const sessionData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (!sessionData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(sessionData);
    window.currentUser = currentUser;
    
    // Mostrar información del usuario
    document.getElementById('userName').textContent = currentUser.nombre_usuario;
    document.getElementById('userRole').textContent = currentUser.rol;
    
    // Inicializar reloj
    updateClock();
    setInterval(updateClock, 1000);

    // Registrar listeners ANTES de cargar el módulo para que la UI sea
    // interactiva de inmediato mientras las queries cargan en segundo plano
    setupNavigation();
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Restaurar módulo anterior si existe (de F5), sino cargar inicio
    const lastModule = localStorage.getItem('lastModule');
    const modulosValidos = ['inicio', 'usuarios', 'clientes', 'vestidos', 'operaciones', 'reportes', 'historial'];
    if (lastModule && modulosValidos.includes(lastModule) && (lastModule !== 'usuarios' || currentUser.rol !== 'Empleado') && (lastModule !== 'reportes' || currentUser.rol !== 'Empleado') && (lastModule !== 'historial' || currentUser.rol !== 'Empleado')) {
        loadModule(lastModule);
        localStorage.removeItem('lastModule');
    } else {
        loadModule('inicio');
    }
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const module = this.getAttribute('data-module');
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar módulo (los permisos se verifican dentro de loadModule)
            loadModule(module);
        });
    });
}

async function loadModule(moduleName) {
    // Verificar permisos — fuente única de control
    const modulosRestringidos = ['usuarios', 'reportes', 'historial'];
    if (modulosRestringidos.includes(moduleName) && currentUser.rol === 'Empleado') {
        showAlert('No tienes permisos para acceder a este módulo', 'error');
        return;
    }

    currentModule = moduleName;
    const contentBody = document.getElementById('contentBody');
    const pageTitle = document.getElementById('pageTitle');

    // Actualizar nav item activo de inmediato (antes de queries)
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.toggle('active', nav.getAttribute('data-module') === moduleName);
    });

    // Actualizar título
    const titles = {
        'inicio': 'Inicio',
        'usuarios': 'Gestión de Usuarios',
        'clientes': 'Gestión de Clientes',
        'vestidos': 'Gestión de Vestidos',
        'operaciones': 'Operaciones de Venta',
        'reportes': 'Reportes y Estadísticas',
        'historial': 'Historial de Ventas'
    };

    pageTitle.textContent = titles[moduleName] || 'Dashboard';

    // Cargar vista correspondiente
    try {
        switch(moduleName) {
            case 'inicio':
                contentBody.innerHTML = await InicioView.render();
                await InicioView.init();
                break;
            case 'usuarios':
                contentBody.innerHTML = await UsuariosView.render();
                await UsuariosView.init();
                break;
            case 'clientes':
                contentBody.innerHTML = await ClientesView.render();
                await ClientesView.init();
                break;
            case 'vestidos':
                contentBody.innerHTML = await VestidosView.render();
                await VestidosView.init();
                break;
            case 'operaciones':
                contentBody.innerHTML = await OperacionesView.render();
                await OperacionesView.init();
                break;
            case 'reportes':
                contentBody.innerHTML = await ReportesView.render();
                await ReportesView.init();
                break;
            case 'historial':
                contentBody.innerHTML = await HistorialView.render();
                await HistorialView.init();
                break;
        }
    } catch (error) {
        console.error('Error cargando módulo:', error);
        contentBody.innerHTML = `
            <div class="alert alert-error">
                <span>⚠</span>
                <span>Error al cargar el módulo. Por favor, intenta nuevamente.</span>
            </div>
        `;
    }
}

function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const timeString = now.toLocaleDateString('es-AR', options);
    document.getElementById('currentTime').textContent = timeString;
}

async function logout() {
    try {
        // Registrar cierre de sesión
        await DBHelper.execute(
            'INSERT INTO historial_usuarios (id_usuario, accion, descripcion, usuario_accion) VALUES (?, ?, ?, ?)',
            [currentUser.id_usuario, 'Cierre de sesión', 'Usuario cerró sesión del sistema', currentUser.nombre_usuario]
        );
    } catch (error) {
        console.error('Error al registrar logout:', error);
    }
    
    // Limpiar sesión
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    // Redirigir al login
    window.location.href = 'index.html';
}

// Función helper para recargar módulo actual
function reloadCurrentModule() {
    loadModule(currentModule);
}

// Exponer funciones globalmente
window.reloadCurrentModule = reloadCurrentModule;
window.loadModule = loadModule;
