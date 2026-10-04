@echo off
title טקטיק - מנהל משימות וביצועים
echo ========================================================
echo  טקטיק - אפליקציית משימות עצמאית ואופליין
echo ========================================================
echo  מפעיל את האפליקציה בחלון שולחן עבודה מקומי...
echo.

:: Check if dist exists, if not build it
if not exist "dist\index.html" (
    echo בונה קבצים מקומיים...
    call npm run build
)

:: Launch in native window via msedge or chrome app mode
start msedge --app="%~dp0dist\index.html" 2>nul || start chrome --app="%~dp0dist\index.html" 2>nul || start "" "%~dp0dist\index.html"

exit
