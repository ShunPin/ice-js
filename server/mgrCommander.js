/**
 * Created by benson on 2016/12/9.
 */

// 這是一個管理 Commander類別
// 管理並對應每一組設定 (Id 對應)
// <> 初始化, setWebsite
// <> get/set/del (設定), 並對應 Id 記錄起來, 並更新 Commander

'use strict';

// 開發測試用
//var Commander = require('../server/stressTestCommander');

// 正常用
var Commander = require('../server/stressLoginCommander');

function ClassHelper() {
    this.init = function () {
        this.model = {};
        this._settings = {};
        this._commanders = {};
    };

    this.init();
}

/**
 *  初始化
 *  設定要登入的 Website URL
 * @param url
 */
ClassHelper.prototype.setWebsite = function (url) {
    // 初始化
    this._settings.Website = url;
};


ClassHelper.prototype.get = function (id, callback) {
    // 有指定 id 則查詢
    if (id) {
        if (this.model.hasOwnProperty(id)) {
            var value = this.model[id];
            if (callback instanceof Function) callback(null, value);
        }
        else {
            if (callback instanceof Function) callback(new Error('Not Found Error!'), null);
        }
    }
    // 無指定 id 則, 全部提供
    else {
        if (callback instanceof Function) callback(null, Object.values(this.model));
    }
};

// 設定設定資訊, 非同步方法
ClassHelper.prototype.set = function (id, value, callback) {
    // 必須指定 id
    if (id) {
        this.model[id] = value;

        if (this._commanders.hasOwnProperty(id) == false) {
            // 新增 Commander , value 為 config
            this._commanders[id] = new Commander(value);
            this._commanders[id].setWebsite(this._settings.Website);
        }
        var cmder = this._commanders[id];

        if (value.running == true && cmder.status.running == false) {
            // 啟動處理
            cmder.start();
        }
        else if (value.running == false && cmder.status.running == true) {
            // 停止處理
            cmder.stop();
        }

        if (callback instanceof Function) callback(null, value);
    }
    else {
        if (callback instanceof Function) callback(new Error("No provide id Error!"), null);
    }
};

// 刪除設定資訊, 非同步方法
ClassHelper.prototype.del = function (id, callback) {
    // 必須指定 id
    if (id) {
        if (this.model.hasOwnProperty(id)) {
            delete this.model[id];
            var cmder = this._commanders[id];
            cmder.stop();
            delete this._commanders[id];

            if (callback instanceof Function) callback(null, null);
        }
        else {
            if (callback instanceof Function) callback(new Error('Not Found Error!'), null);
        }
    }
    else {
        if (callback instanceof Function) callback(new Error("No provide id Error!"), null);
    }
};


ClassHelper.prototype.getCommanders = function () {
    var values = [];

    for (var k in this._commanders) {
        if (this._commanders.hasOwnProperty(k)) {
            //console.log("Key is " + k + ", value is " + this._commanders[k].status.id);
            values.push(this._commanders[k].status);
        }
    }

    return values;
};

/* ************************************************************************
 SINGLETON CLASS DEFINITION
 ************************************************************************ */
ClassHelper.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
ClassHelper.getInstance = function () {
    if (this.instance === null) {
        this.instance = new ClassHelper();
    }
    return this.instance;
};

module.exports = ClassHelper.getInstance();
