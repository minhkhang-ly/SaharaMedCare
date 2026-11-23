@echo off
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" %*
  exit /b %ERRORLEVEL%
)
if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
  set ELECTRON_RUN_AS_NODE=1
  "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" %*
  exit /b %ERRORLEVEL%
)
if exist "C:\Users\lymin\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
  set ELECTRON_RUN_AS_NODE=1
  "C:\Users\lymin\AppData\Local\Programs\Microsoft VS Code\Code.exe" %*
  exit /b %ERRORLEVEL%
)
"C:\Program Files\nodejs\node.exe" %*
