Write-Host "🧪 Probando API Completa de Geolocalización..." -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:8000/api"

try {
    Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ $($health.message)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2️⃣ Búsqueda: Pasto..." -ForegroundColor Yellow
    $pasto = Invoke-RestMethod -Uri "$baseUrl/locations-test/search?query=Pasto&limit=3" -Method GET
    Write-Host "✅ Encontrados: $($pasto.data.Count) resultados" -ForegroundColor Green
    if ($pasto.data.Count -gt 0) {
        Write-Host "   📍 $($pasto.data[0].display_name)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "3️⃣ Búsqueda: Bogotá..." -ForegroundColor Yellow
    $bogota = Invoke-RestMethod -Uri "$baseUrl/locations-test/search?query=Bogotá&limit=3" -Method GET
    Write-Host "✅ Encontrados: $($bogota.data.Count) resultados" -ForegroundColor Green
    if ($bogota.data.Count -gt 0) {
        Write-Host "   📍 $($bogota.data[0].display_name)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "4️⃣ Geocodificación Inversa: Centro de Pasto..." -ForegroundColor Yellow
    $reverse = Invoke-RestMethod -Uri "$baseUrl/locations-test/details/1.223789/-77.283255" -Method GET
    Write-Host "✅ Dirección: $($reverse.data.display_name)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "5️⃣ Cálculo de Distancia: Pasto → Bogotá..." -ForegroundColor Yellow
    $distanceBody = @{
        from = @{ lat = 1.223789; lon = -77.283255 }
        to = @{ lat = 4.7110; lon = -74.0721 }
    } | ConvertTo-Json
    
    $distance = Invoke-RestMethod -Uri "$baseUrl/locations-test/distance" -Method POST -Body $distanceBody -ContentType "application/json"
    Write-Host "✅ Distancia: $($distance.data.distance) km" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "6️⃣ Búsqueda Internacional: Madrid..." -ForegroundColor Yellow
    $madrid = Invoke-RestMethod -Uri "$baseUrl/locations-test/search?query=Madrid&limit=2" -Method GET
    Write-Host "✅ Encontrados: $($madrid.data.Count) resultados" -ForegroundColor Green
    if ($madrid.data.Count -gt 0) {
        Write-Host "   📍 $($madrid.data[0].display_name)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "🎉 ¡Todas las pruebas pasaron!" -ForegroundColor Green
    Write-Host "🌍 La API de geolocalización está funcionando perfectamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Ahora puedes usar el frontend en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔍 Busca cualquier ubicación del mundo en tiempo real" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Asegúrate de que el backend esté corriendo:" -ForegroundColor Yellow
    Write-Host "   cd Back" -ForegroundColor Cyan
    Write-Host "   node simple-server.js" -ForegroundColor Cyan
}