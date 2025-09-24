#!/usr/bin/env pwsh

Write-Host "🚀 Iniciando UberClon..." -ForegroundColor Green
Write-Host ""

# Cambiar al directorio raíz del proyecto
Set-Location "../.."

Write-Host "📦 Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Back; npm run dev" -WindowStyle Normal

Write-Host "⏳ Esperando 3 segundos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Front/UberClon; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ UberClon iniciado exitosamente!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")