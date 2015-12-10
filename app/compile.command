cd ~/GitHub/boat-day-app/app/

VERSION="3.3.1"
DIST=dist/$VERSION

if [ -d $DIST ]
then
    rm -rf $DIST
fi

mkdir $DIST
mkdir $DIST/resources

lessc --clean-css src/less/boatday.less > $DIST/boatday.min.css
cp -R src/resources $DIST
node r.js -o build.js out=$DIST/boatday.min.js

sudo chmod -R 777 .
sudo chown -R Daniel .