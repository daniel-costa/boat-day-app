cd ~/GitHub/boat-day-app/
sudo cordova plugin rm com.boat.day.BDHelper
sudo cordova plugin add pluginsBase/com.boat.day.BDHelper --variable PARSE_APP_ID="8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv" --variable PARSE_CLIENT_KEY="V5c09oUVGu92HOvsxyUqYqgjOo1c8oguJ9yiVLqo" --variable PARSE_JAVASCRIPT_KEY="FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp"
sudo chmod -R 777 .
sudo chown -R Daniel .
sudo cordova build android
