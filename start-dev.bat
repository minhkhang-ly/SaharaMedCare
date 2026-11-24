@echo off
title SaharaMedCare Launchpad
echo ========================================================
echo   SaharaMedCare - Fullstack Dev Launchpad
echo   Backend API : http://localhost:5000
echo   Frontend UI : http://localhost:5173
echo ========================================================

echo [1/2] Starting Backend API Server (Port 5000)...
start "SaharaMedCare - Backend API Server" /D "%~dp0server" cmd /k "(if not exist node_modules call npm install) & npm run dev"

echo [2/2] Starting Frontend Client (Port 5173)...
cd /d "%~dp0client"
call run-dev.bat
