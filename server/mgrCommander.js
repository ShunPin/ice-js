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
    var Ice = require("Ice").Ice;
    var BravoLogin = require('../public/bravoLogin').BravoLogin;
    var deviceID = Ice.generateUUID().toString();
    var runner = new BravoLogin(deviceID);
    runner.setWebsite(helper.getInstance()._settings.Website);
    return runner;
};

StressLoginCommander.prototype.runAction = function (runner) {
    var isGuestLogin = (this.Config.method == 'GuestLogin') ? true : false;
    runner.createSession(isGuestLogin).then(
        function () {
            // 登入成功
            console.log("登入成功");
            this.success(runner);
        },
        function (msg) {
            // 登入失敗
            console.log(msg);
            this.fail(runner);
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
    // 取出原設定, 判斷試 new or update
    var changeTo;
    this.get(id,function (err,obj) {
        if (obj) {
            // 要啟動
            if (value.running == true && obj.running == false)
            {
                changeTo = true;
            }
            // 要停止
            else if (value.running == false && obj.running == true)
            {
                changeTo = false;
            }
        }

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
                    cmder = new StressLoginCommander(obj);
                    self._commanders[id] = cmder;
                }

                // 異動處理
                if (changeTo == true){
                    // 啟動處理
                    cmder.start();
                }
                else if (changeTo == false)
                {
                    // 停止處理
                    cmder.stop();
                }
                if (callback instanceof Function) callback(err,obj);
            }
        })
    });
};

// 備分 deleter, 複寫 deleter
helper.prototype.modelDeleter = helper.prototype.del;
// 刪除設定資訊, 非同步方法
helper.prototype.del = function (id, callback){
    var self = this;
    this.modelDeleter(id,function(err,obj) {
        if (err == null)
        {
            var cmder = self._commanders[id];
            cmder.stop();
            delete self._commanders[id];
        }
        if (callback instanceof Function) callback(err,obj);
    });
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
