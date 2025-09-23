Write-Host "🔄 Reiniciando Frontend con API de Geolocalización..." -ForegroundColor Green
Write-Host ""

# Verificar que el backend esté corriendo
Write-Host "Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET -TimeoutSec 3
    Write-Host "✅ Backend funcionando: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no está corriendo en puerto 8000" -ForegroundColor Red
    Write-Host "💡 Inicia el backend primero:" -ForegroundColor Yellow
    Write-Host "   cd ..\..\Back" -ForegroundColor Cyan
    Write-Host "   node simple-server.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Presiona cualquier tecla para continuar de todos modos..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Limpiar cache
Write-Host "Limpiando cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "✅ Cache de Vite eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando frontend con API real..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌍 API de Geolocalización: ACTIVADA" -ForegroundColor Green
Write-Host ""

npm run dev