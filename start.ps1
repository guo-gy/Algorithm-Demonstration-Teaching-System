# Startup script for Algorithm Demonstration Teaching System

Write-Host "Starting Algorithm Demonstration Teaching System..." -ForegroundColor Cyan

# Start Backend
Write-Host "1. Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

# Start Frontend
Write-Host "2. Starting Frontend Dev Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "Project is starting! Check the new windows for progress." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
