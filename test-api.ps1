Write-Host "🧪 Probando API UberClon..." -ForegroundColor Green
Write-Host ""

try {
    Write-Host "1️⃣ Probando ruta raíz..." -ForegroundColor Yellow
    $response1 = Invoke-RestMethod -Uri "http://localhost:3001" -Method GET
    Write-Host "✅ Ruta raíz: $($response1.message)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2️⃣ Probando health check..." -ForegroundColor Yellow
    $response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "✅ Health: $($response2.message)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "3️⃣ Probando búsqueda de ubicaciones..." -ForegroundColor Yellow
    $response3 = Invoke-RestMethod -Uri "http://localhost:3001/api/locations-test/search?query=Pasto&limit=3" -Method GET
    Write-Host "✅ Búsqueda: $($response3.data.Count) resultados encontrados" -ForegroundColor Green
    if ($response3.data.Count -gt 0) {
        Write-Host "   Primer resultado: $($response3.data[0].display_name)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "🎉 ¡Todas las pruebas pasaron!" -ForegroundColor Green
    Write-Host "🔗 La API está funcionando correctamente." -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Error en las pruebas: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que el backend esté ejecutándose en http://localhost:3001" -ForegroundColor Yellow
}