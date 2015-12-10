cd ~/GitHub/boat-day-app/app/

lessc --clean-css src/less/boatday.less > dist/boatday.min.css
cp -R src/resources dist
node r.js -o build.js

sudo chmod -R 777 .
sudo chown -R Daniel .