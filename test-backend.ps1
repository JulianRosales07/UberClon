Write-Host "Probando Backend UberClon..." -ForegroundColor Green
Write-Host ""

try {
    Write-Host "1. Probando ruta raiz..." -ForegroundColor Yellow
    $response1 = Invoke-RestMethod -Uri "http://localhost:3001" -Method GET
    Write-Host "OK: $($response1.message)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "2. Probando health check..." -ForegroundColor Yellow
    $response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "OK: $($response2.message)" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "3. Probando busqueda de ubicaciones..." -ForegroundColor Yellow
    $response3 = Invoke-RestMethod -Uri "http://localhost:3001/api/locations-test/search?query=Pasto&limit=3" -Method GET
    Write-Host "OK: $($response3.data.Count) resultados encontrados" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Backend funcionando correctamente!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegurate de que el backend este corriendo en puerto 3001" -ForegroundColor Yellow
}