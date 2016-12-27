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
    var self = this;
    var Ice = require("Ice").Ice;
    var BravoLogin = require('../public/bravoLogin').BravoLogin;
    var isGuestLogin = (self.Config.method == 'GuestLogin');
    var deviceID;
    var runner = null;

    // 快速登入
    if (isGuestLogin) {
        deviceID = Ice.generateUUID().toString();
        runner = new BravoLogin(deviceID);
    }
    else {
        var user = require('../server/modelUser');
        var fastLoginInfo = user.getOffline();
        if (fastLoginInfo) {
            deviceID = fastLoginInfo.DeviceId;
            runner = new BravoLogin(deviceID);
            runner.loginInfo = fastLoginInfo;
        }
        else {
            console.warn('FastLogin 無可用帳號!!');
        }
    }

    if (runner) {
        runner.setWebsite(self._settings.Website);
    }
    return runner;
};

method.runAction = function (runner) {
    var self = this;
    var Ice = require("Ice").Ice;
    var user = require('../server/modelUser');
    var isGuestLogin = (self.Config.method == 'GuestLogin');
    var stayTime = self.Config.stayTime * 1000;
    var setting = self.Config;

    runner.createSession(isGuestLogin).then(
        function () {
            // 登入成功
            console.log("登入成功，開始註冊回呼");

            // 登入失敗處理 function
            var _loginfailed = function (msg) {
                console.log(msg);
                self.fail(runner);
            };

            runner.registerAllFunctionalListener().then(function () {
                console.log("回呼註冊成功");

                Ice.Promise.delay(stayTime).then(function () {
                    // 登出
                    //console.log("登出");
                    runner.logout();
                    self.success(runner);

                    // 修改狀態，並存檔
                    setting.running = false;
                    setting.save();

                    // 記錄 快速登入的  資訊
                    var fastLoginInfo = {
                        "MemberId": runner.loginInfo.MemberId,
                        "LoginToken": runner.loginInfo.LoginToken,
                        "DeviceId": runner.DeviceId,
                    };
                    //console.log("快速登入可用的資訊", JSON.stringify(fastLoginInfo));

                    // 加入 DB
                    user.add(fastLoginInfo);
                    // 加入 Offine User Array
                    user.addOffline(fastLoginInfo);
                }).exception(_loginfailed);
            }, _loginfailed);
        },
        function () {
            // 登入失敗
            console.error("登入失敗");
            self.fail(runner);

            // 快速登入
            if (isGuestLogin) {

            }
            else {
                // 將快速登入資訊回收
                // 記錄 快速登入的  資訊
                var fastLoginInfo = {
                    "MemberId": runner.loginInfo.MemberId,
                    "LoginToken": runner.loginInfo.LoginToken,
                    "DeviceId": runner.DeviceId,
                };
                user.addOffline(fastLoginInfo);
            }
        }
    );
};

module.exports = Commander;