/**
 * Created by benson on 2016/12/24.
 */

var logger = require("log4js").getLogger("stress");
var filelogger = require("log4js").getLogger("stressFile");
var ClientFacadeCommand = require("../public/bravoLogin").BravoLogin.ClientFacadeCommand;

const _super = require('../public/StressCommander').prototype;

var method = Commander.prototype = Object.create(_super);

function Commander() {
    _super.constructor.apply(this, arguments);
    this._settings = {};
}

method.setWebsite = function(url) {
    this._settings.Website = url;
};

method.createRunner = function() {
    var self = this;
    var Ice = require("Ice").Ice;
    var BravoLogin = require('../public/bravoLogin').BravoLogin;
    var isGuestLogin = (self.Config.method == 'GuestLogin');
    var deviceID;
    var runner = null;

    // 快速登入
    if( isGuestLogin ) {
        deviceID = Ice.generateUUID().toString();
        runner = new BravoLogin(deviceID);
    }
    else {
        var user = require('../server/modelUser');
        var fastLoginInfo = user.getOffline();
        if( fastLoginInfo ) {
            deviceID = fastLoginInfo.DeviceId;
            runner = new BravoLogin(deviceID);
            runner.loginInfo = fastLoginInfo;
        }
        else {
            logger.warning('FastLogin 無可用帳號!!');
        }
    }

    if( runner ) {
        runner.setWebsite(self._settings.Website);
    }
    return runner;
};

method.runAction = function(runner) {
    var self = this;
    var Ice = require("Ice").Ice;
    var user = require('../server/modelUser');
    var isGuestLogin = (self.Config.method == 'GuestLogin');
    var stayTime = self.Config.stayTime * 1000;
    var setting = self.Config;
    runner.doLogout = false;

    runner.setConnectionListener((method, data) => {
        switch( method ) {
            case ClientFacadeCommand.Disconnect:
                if( !runner.doLogout ) {
                    logger.debug("斷線通知，機器人#" + runner.runnerIndex);
                    logger.warn(data);
                    filelogger.error(data);

                    runner.logout();
                }

                self.disconnect(runner);
                break;
        }
    });

    runner.createSession(isGuestLogin).then(
        function() {
            // 登入成功
            self.login(runner);

            // runner.registerAllFunctionalListener().then(function() {
            //     logger.debug("回呼註冊成功");

                Ice.Promise.delay(stayTime).then(function() {
                    logger.debug("任務結束，執行登出機器人#" + runner.runnerIndex);
                    // 登出
                    runner.doLogout = true;
                    runner.logout();
                    self.finish(runner);
                    self.disconnect(runner);

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
                });
            // }, function(error) {
            //     logger.debug("回呼註冊失敗");
            //     if( !self.doLogout ) {
            //         logger.warn(error);
            //         filelogger.error(error);
            //
            //         runner.logout();
            //     }
            //
            //     self.fail(runner);
            // });
        },
        function(error) {
            // 登入失敗
            // filelogger.error("登入失敗");
            throw "runner.createSession::登入失敗::[" + error + "]";

            // Lune: 失敗應該不用記錄資訊吧？ ..
            // // 快速登入
            // if( isGuestLogin ) {
            //
            // }
            // else {
            //     // 將快速登入資訊回收
            //     // 記錄 快速登入的  資訊
            //     var fastLoginInfo = {
            //         "MemberId": runner.loginInfo.MemberId,
            //         "LoginToken": runner.loginInfo.LoginToken,
            //         "DeviceId": runner.DeviceId,
            //     };
            //     user.addOffline(fastLoginInfo);
            // }
        }
    ).exception(function(error) {
        logger.error(error);
        filelogger.error(error);

        self.fail(runner);
    });
};

module.exports = Commander;