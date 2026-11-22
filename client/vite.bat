@echo off
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" "%~dp0node_modules\vite\bin\vite.js" %*
  exit /b %ERRORLEVEL%
)
if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
  set ELECTRON_RUN_AS_NODE=1
  "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" "%~dp0node_modules\vite\bin\vite.js" %*
  exit /b %ERRORLEVEL%
)
if exist "C:\Users\lymin\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
  set ELECTRON_RUN_AS_NODE=1
  "C:\Users\lymin\AppData\Local\Programs\Microsoft VS Code\Code.exe" "%~dp0node_modules\vite\bin\vite.js" %*
  exit /b %ERRORLEVEL%
)
node "%~dp0node_modules\vite\bin\vite.js" %*
