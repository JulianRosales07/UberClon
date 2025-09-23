Write-Host "🔄 Reiniciando Frontend con cache limpio..." -ForegroundColor Green
Write-Host ""

# Detener procesos existentes (si los hay)
Write-Host "Deteniendo procesos existentes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar cache
Write-Host "Limpiando cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Cache de Vite eliminado" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Directorio dist eliminado" -ForegroundColor Green
}

# Reinstalar dependencias si es necesario
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🚀 Iniciando servidor limpio..." -ForegroundColor Green
Write-Host "📱 Frontend estará disponible en: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

npm run dev