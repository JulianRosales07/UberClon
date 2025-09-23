Write-Host "🔧 Arreglando errores de importación y reiniciando..." -ForegroundColor Green
Write-Host ""

# Detener procesos existentes
Write-Host "Deteniendo procesos..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar cache de Vite
Write-Host "Limpiando cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Cache de Vite eliminado" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Directorio dist eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando frontend con tipos corregidos..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

npm run dev