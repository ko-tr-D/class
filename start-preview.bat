@echo off
setlocal

cd /d "%~dp0"

set "BUNDLED_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if exist "%BUNDLED_NODE%" (
  "%BUNDLED_NODE%" "apps\web\preview-server.mjs"
) else (
  node "apps\web\preview-server.mjs"
)
