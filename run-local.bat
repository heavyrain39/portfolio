@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "EXISTING_URL="

for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue; $checked = @{}; foreach ($connection in $connections) { $port = $connection.LocalPort; if ($port -lt 3000 -or $port -gt 3099 -or $checked[$port]) { continue }; $checked[$port] = $true; try { $url = 'http://localhost:' + $port + '/portfolio/'; $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3; if ($response.Content -match 'TARGETS TERMINATED') { Write-Output $url; break } } catch {} }"`) do set "EXISTING_URL=%%U"

if defined EXISTING_URL (
    echo Portfolio dev server is already running.
    echo Opening %EXISTING_URL%
    start "" "%EXISTING_URL%"
    exit /b 0
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found. Install Node.js and try again.
    pause
    exit /b 1
)

if exist ".next\dev\lock" (
    echo Removing stale Next.js lock...
    del /f /q ".next\dev\lock" >nul 2>nul
)

set "PORT="
for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "$used = @{}; $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue; foreach ($connection in $connections) { $used[$connection.LocalPort] = $true }; for ($candidate = 3025; $candidate -le 3099; $candidate++) { if (-not $used[$candidate]) { Write-Output $candidate; break } }"`) do set "PORT=%%P"

if not defined PORT (
    echo No free local port was found between 3025 and 3099.
    pause
    exit /b 1
)

set "URL=http://localhost:%PORT%/portfolio/"

echo Starting Portfolio at %URL%
echo This window must stay open while testing.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "$url = '%URL%'; for ($i = 0; $i -lt 60; $i++) { try { $null = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; Start-Process $url; exit } catch { Start-Sleep -Seconds 1 } }"

call npm run dev -- --port %PORT%

echo.
echo The development server has stopped.
pause
