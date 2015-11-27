cd ~/GitHub/boat-day-app/
sudo cordova plugin rm com.boat.day.BDHelper
sudo cordova plugin add pluginsBase/com.boat.day.BDHelper --variable PARSE_APP_ID="LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU" --variable PARSE_CLIENT_KEY="IoaOpxqSlbkcff3v0X9mEBfGTYKpIJK9YzVuujR5" --variable PARSE_JAVASCRIPT_KEY="kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU"
sudo chmod -R 777 .
sudo chown -R Daniel .
sudo cordova build ios