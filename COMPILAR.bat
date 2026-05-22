@echo off
echo ========================================
echo  COMPILAR EJECUTABLE PORTABLE
echo  Luisina Vestidos
echo ========================================
echo.
echo Este proceso compilara la aplicacion en un
echo archivo ejecutable portable (.exe)
echo.
echo El archivo se generara en la carpeta: dist\
echo.
pause

echo.
echo Compilando aplicacion...
echo Esto puede tomar varios minutos...
echo.

call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Hubo un problema compilando la aplicacion
    pause
    exit /b 1
)

echo.
echo ========================================
echo  COMPILACION COMPLETADA
echo ========================================
echo.
echo El ejecutable portable se encuentra en:
echo dist\LuisinaVestidos-Portable.exe
echo.
echo Puedes copiar este archivo a cualquier computadora
echo y ejecutarlo sin necesidad de instalacion.
echo.
pause
