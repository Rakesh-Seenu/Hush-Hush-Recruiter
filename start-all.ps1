$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process -FilePath 'python' -ArgumentList '-m backend.api' -WorkingDirectory $root
Start-Process -FilePath 'npm' -ArgumentList 'start' -WorkingDirectory $root

Write-Host 'Started backend and frontend in separate windows.'
