cd ~/GitHub/boat-day-app/app/

lessc --clean-css src/less/boatday.less > dist/boatday.min.css

cp src/dist.ios.html dist/index.ios.html
cp src/dist.android.html dist/index.android.html
cp src/scripts/vendor/requirejs/require.js dist

cp -R src/resources dist
cp -R src/cordova/ios dist
cp -R src/cordova/android dist

node r.js -o build.js
