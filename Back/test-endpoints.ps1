# Script de PowerShell para probar los endpoints de ubicaciones

Write-Host "🧪 Probando endpoints de ubicaciones..." -ForegroundColor Green
Write-Host ""

# Prueba 1: Buscar ubicaciones
Write-Host "1️⃣ Probando búsqueda de ubicaciones..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/locations-test/search?query=Miraflores Lima&limit=3" -Method GET
    Write-Host "✅ Encontradas $($searchResponse.data.Count) ubicaciones:" -ForegroundColor Green
    for ($i = 0; $i -lt $searchResponse.data.Count; $i++) {
        $location = $searchResponse.data[$i]
        Write-Host "   $($i + 1). $($location.display_name)" -ForegroundColor White
        Write-Host "      Coordenadas: $($location.lat), $($location.lon)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Guardar primera ubicación para la siguiente prueba
    $firstLocation = $searchResponse.data[0]
} catch {
    Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
}

# Prueba 2: Obtener detalles de ubicación
if ($firstLocation) {
    Write-Host "2️⃣ Probando obtener detalles de ubicación..." -ForegroundColor Yellow
    try {
        $detailsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/locations-test/details/$($firstLocation.lat)/$($firstLocation.lon)" -Method GET
        Write-Host "✅ Detalles: $($detailsResponse.data.display_name)" -ForegroundColor Green
        Write-Host "   Ciudad: $($detailsResponse.data.address.city)" -ForegroundColor White
        Write-Host "   País: $($detailsResponse.data.address.country)" -ForegroundColor White
        Write-Host ""
    } catch {
        Write-Host "❌ Error en detalles: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Prueba 3: Calcular distancia
Write-Host "3️⃣ Probando cálculo de distancia..." -ForegroundColor Yellow
try {
    $distanceBody = @{
        originLat = -12.0464
        originLon = -77.0428
        destLat = -12.1200
        destLon = -77.0300
    } | ConvertTo-Json

    $distanceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/locations-test/distance" -Method POST -Body $distanceBody -ContentType "application/json"
    Write-Host "✅ Distancia: $($distanceResponse.data.distance) $($distanceResponse.data.unit)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error en distancia: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Pruebas completadas!" -ForegroundColor Green