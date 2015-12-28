cd ~/GitHub/boat-day-app/app/

bower install
sudo osx-compile.command

cd ~/GitHub/boat-day-app/

cp config.base.xml config.xml

sudo cordova platform add ios
sudo cordova platform add android
sudo cordova platform update android@5.0.0
sudo cordova build

sudo chmod -R 777 .
sudo chown -R Daniel .