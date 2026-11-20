@echo off
setlocal
 title SaharaMedCare - Frontend Client Dev Server
cd /d "%~dp0"
set "PORT=5173"
echo ========================================================
echo   SaharaMedCare - Cong Thong Tin Can Lam Sang va AI Clinician
echo   Starting Vite Dev Server at http://localhost:%PORT%/
echo ========================================================

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo [OK] Using Node.js directly.
  node "%~dp0node_modules\vite\bin\vite.js" --host 0.0.0.0 --port %PORT% %*
  goto :done
)

if exist "%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
  echo [WARN] Node.js was not found in PATH. Falling back to VS Code Electron.
  echo [INFO] If the page is blank, open DevTools with F12 and inspect the Console tab.
  set ELECTRON_RUN_AS_NODE=1
  "%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\Code.exe" "%~dp0node_modules\vite\bin\vite.js" --host 0.0.0.0 --port %PORT% %*
  goto :done
)

echo [ERROR] Neither Node.js nor the VS Code fallback was found.
:done
pause
endlocal

