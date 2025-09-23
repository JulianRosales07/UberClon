Write-Host "🧹 Limpiando cache de Vite..." -ForegroundColor Yellow

# Detener cualquier proceso de desarrollo
Write-Host "Deteniendo procesos..." -ForegroundColor Yellow

# Limpiar cache de node_modules
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Cache de Vite eliminado" -ForegroundColor Green
}

# Limpiar cache de dist
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Directorio dist eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando servidor limpio..." -ForegroundColor Green
npm run dev