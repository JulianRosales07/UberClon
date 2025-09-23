Write-Host "🚀 Iniciando Frontend UberClon..." -ForegroundColor Green
Write-Host ""

# Verificar si el backend está corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 2
    Write-Host "✅ Backend detectado en http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend no detectado. Asegúrate de iniciarlo primero:" -ForegroundColor Yellow
    Write-Host "   cd ..\..\Back" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Iniciando servidor de desarrollo..." -ForegroundColor Yellow
npm run dev