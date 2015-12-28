cd C:\xampp\htdocs\BoatDayProjects\boat-day-app\app\

bower install
.\win-compile.bat

cd C:\xampp\htdocs\BoatDayProjects\boat-day-app\

copy config.base.xml config.xml

cordova platform add android
cordova platform update android@5.0.0
cordova build android