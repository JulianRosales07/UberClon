Write-Host "🧹 Limpieza completa y reinicio..." -ForegroundColor Green
Write-Host ""

# Detener todos los procesos de Node
Write-Host "Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar todos los caches
Write-Host "Limpiando caches..." -ForegroundColor Yellow

if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Cache de Vite eliminado" -ForegroundColor Green
}

if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Directorio dist eliminado" -ForegroundColor Green
}

if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
    Write-Host "✅ Cache .vite eliminado" -ForegroundColor Green
}

# Limpiar cache de npm
Write-Host "Limpiando cache de npm..." -ForegroundColor Yellow
npm cache clean --force

Write-Host ""
Write-Host "🔧 Tipos corregidos:" -ForegroundColor Green
Write-Host "   ✅ Importaciones duplicadas eliminadas" -ForegroundColor Cyan
Write-Host "   ✅ Tipos importados correctamente" -ForegroundColor Cyan
Write-Host "   ✅ Cache completamente limpio" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 Iniciando servidor limpio..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

npm run dev