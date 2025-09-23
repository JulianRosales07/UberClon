@echo off
echo Iniciando UberClon en modo desarrollo...
echo.

echo Iniciando Backend...
start "UberClon Backend" cmd /k "cd Back && npm run dev"

echo Esperando 3 segundos...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend...
start "UberClon Frontend" cmd /k "cd Front/UberClon && npm run dev"

echo.
echo ✅ UberClon iniciado!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3001
echo 🧪 Probar API: powershell -ExecutionPolicy Bypass -File test-api.ps1
echo.
pause