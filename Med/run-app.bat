@echo off
setlocal
set "ROOT=%~dp0"

echo Iniciando backend...
start "Backend" cmd /k "cd /d "%ROOT%server" & if not exist node_modules npm install & npm run dev"

echo Iniciando frontend...
start "Frontend" cmd /k "cd /d "%ROOT%client" & if not exist node_modules npm install & npm run dev"

echo.
echo Listo. Se abrieron dos ventanas: Backend y Frontend.
echo Para cerrar, cierre ambas ventanas.
endlocal
