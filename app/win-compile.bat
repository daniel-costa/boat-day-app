cd C:\xampp\htdocs\BoatDayProjects\boat-day-app\app\

set VERSION=3.3.1
set DIST=dist\%VERSION%

IF EXIST "%DIST%" (
 rmdir /Q /S "%DIST%"
)

mkdir "%DIST%"
mkdir "%DIST%\resources"

call lessc --clean-css "src/less/boatday.less" "%DIST%\boatday.min.css"
xcopy /E /I /Y /H /R "src\resources\*" "%DIST%\resources"
node r.js -o "build.js" out="%DIST%\boatday.min.js"