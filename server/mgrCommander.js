/**
 * Created by benson on 2016/12/9.
 */

// 這是一個管理 Commander類別
// 管理並對應每一組設定 (Id 對應)
// <> 初始化, setWebsite
// <> get/set/del (設定), 並對應 Id 記錄起來, 並更新 Commander

'use strict'

var helper = require('../server/ModelHelper');
var StressLoginCommander = require('../public/StressCommander');

StressLoginCommander.prototype.createRunner = function () {
    var self = this;
    var Ice = require("Ice").Ice;
    var BravoLogin = require('../public/bravoLogin').BravoLogin;
    var isGuestLogin = (self.Config.method == 'GuestLogin') ? true : false;
    var runner = null;

    // 快速登入
    if (isGuestLogin) {
        var deviceID = Ice.generateUUID().toString();
        runner = new BravoLogin(deviceID);
    }
    else {
        var user = require('../server/modelUser');
        var fastLoginInfo = user.getOffline();
        if (fastLoginInfo) {
            var deviceID = fastLoginInfo.DeviceId;
            runner = new BravoLogin(deviceID);
            runner.loginInfo = fastLoginInfo;
        }
        else {
            console.warn('FastLogin 無可用帳號!!');
        }
    }

    if (runner) {
        runner.setWebsite(helper.getInstance()._settings.Website);
    }
    return runner;
};

StressLoginCommander.prototype.runAction = function (runner) {
    var self = this;
    var Ice = require("Ice").Ice;
    var user = require('../server/modelUser');
    var isGuestLogin = (self.Config.method == 'GuestLogin') ? true : false;
    var stayTime = self.Config.stayTime * 1000;
    var setting = self.Config;

    runner.createSession(isGuestLogin).then(
        function () {
            // 登入成功
            console.log("登入成功，開始註冊回呼");

            // 登入失敗
            var _loginfailed = function (msg) {
                console.log(msg);
                self.fail(runner);
            };

            runner.registerAllFunctionalListener().then(function () {
                console.log("回呼註冊成功");

                Ice.Promise.delay(stayTime).then(function () {
                    // 登出
                    console.log("登出");
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

/**
 *  初始化
 *  設定要登入的 Website URL
 * @param url
 */
helper.prototype.setWebsite = function (url) {
    // 初始化
    this._settings.Website = url;
};

// 備分 setter, 複寫 setter
helper.prototype.modelSetter = helper.prototype.set;
helper.prototype.set = function (id, value, callback) {
    var self = this;
    self.modelSetter(id, value, function (err, obj) {
        // 錯誤則不處理
        if (err) {
            if (callback instanceof Function) callback(err, obj);
        }
        // 成功, 檢查異動
        else {
            var cmder;

            if (self._commanders.hasOwnProperty(id)) {
                cmder = self._commanders[id];
            }
            else {
                // 新增,處理
                cmder = new StressLoginCommander(value);
                self._commanders[id] = cmder;
            }

            if (obj.running == true && cmder.status.running == false) {
                // 啟動處理
                cmder.start();
            }
            else if (obj.running == false && cmder.status.running == true) {
                // 停止處理
                cmder.stop();
            }
            if (callback instanceof Function) callback(err, obj);
        }
    });
};

// 備分 deleter, 複寫 deleter
helper.prototype.modelDeleter = helper.prototype.del;
// 刪除設定資訊, 非同步方法
helper.prototype.del = function (id, callback) {
    var self = this;
    this.modelDeleter(id, function (err, obj) {
        if (err == null) {
            var cmder = self._commanders[id];
            cmder.stop();
            delete self._commanders[id];
        }
        if (callback instanceof Function) callback(err, obj);
    });
};

helper.prototype.getCommanders = function () {
    var self = this;
    var values = [];

    for(var key in self._commanders) {
        values.push(self._commanders[key]);
    }
    return values;
};
/* ************************************************************************
 SINGLETON CLASS DEFINITION
 ************************************************************************ */
helper.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
helper.getInstance = function () {
    if (this.instance === null) {
        this.instance = new helper();
        this.instance._settings = {};
        this.instance._commanders = {};
    }
    return this.instance;
}

module.exports = helper.getInstance();
