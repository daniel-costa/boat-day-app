
var exec = cordova.require('cordova/exec');

var BDHelperNotifications = function() {
    
    this._handlers = { 
        'registration': [],
        'error': []
    };

    var that = this;
    var success = function(result) {
        if (result && typeof result.tokenId !== 'undefined') {
            that.emit('registration', result);
        }
    };

    var fail = function(msg) {
        that.emit('error', new Error(msg));
    };

    setTimeout(function() {
        exec(success, fail, 'BDHelper', 'init');
    }, 10);
};

BDHelperNotifications.prototype.on = function(eventName, callback) {
    if (this._handlers.hasOwnProperty(eventName)) {
        this._handlers[eventName].push(callback);
    }
};

BDHelperNotifications.prototype.emit = function() {
    var args = Array.prototype.slice.call(arguments);
    var eventName = args.shift();

    if (!this._handlers.hasOwnProperty(eventName)) {
        return false;
    }

    for (var i = 0, length = this._handlers[eventName].length; i < length; i++) {
        this._handlers[eventName][i].apply(undefined,args);
    }

    return true;
};

module.exports = {

    init: function() {
        return new BDHelperNotifications();
    },

    BDHelperNotifications: BDHelperNotifications
};