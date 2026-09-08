@echo off
echo Installing npm packages...
call npm install
echo Dependencies installed.
echo Launching local development environment...
call npm run dev
pause