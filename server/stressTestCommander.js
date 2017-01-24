/**
 * Created by benson on 2016/12/24.
 */

const _super = require('../public/StressCommander').prototype;

var method = Commander.prototype = Object.create(_super);

function Commander() {
    _super.constructor.apply(this, arguments);
    this._settings = {};
}

method.setWebsite = function (url) {
    this._settings.Website = url;
};

method.createRunner = function () {
    //var self = this;

    var Ice = require("ice").Ice;
    var runner = new Ice.Promise();

    return runner;
};

method.runAction = function (runner) {
    var self = this;
    //var Ice = require("ice").Ice;
    //var isGuestLogin = (self.Config.method == 'GuestLogin') ? true : false;
    var stayTime = self.Config.stayTime * 1000;
    //var setting = self.Config;

    var timerID = setInterval(function () {
        runner.succeed();
        self.finish(runner);
        clearInterval(timerID);
    }, stayTime);
};

module.exports = Commander;