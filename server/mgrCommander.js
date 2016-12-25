/**
 * Created by benson on 2016/12/9.
 */

// 這是一個管理 Commander類別
// 管理並對應每一組設定 (Id 對應)
// <> 初始化, setWebsite
// <> get/set/del (設定), 並對應 Id 記錄起來, 並更新 Commander

'use strict'

// 開發測試用
//var Commander = require('../server/stressTestCommander');

// 正常用
var Commander = require('../server/stressLoginCommander');

function helper() {
    this.init = function() {
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
helper.prototype.setWebsite = function (url) {
    // 初始化
    this._settings.Website = url;
};


helper.prototype.get = function (id, callback){
    // 有指定 id 則查詢
    if (id)
    {
        if (this.model.hasOwnProperty(id))
        {
            var value = this.model[id];
            if (callback instanceof Function) callback(null,value);
        }
        else
        {
            if (callback instanceof Function) callback(new Error('Not Found Error!'),null);
        }
    }
    // 無指定 id 則, 全部提供
    else {
        if (callback instanceof Function) callback(null,Object.values(this.model));
    }
};

// 設定設定資訊, 非同步方法
helper.prototype.set = function (id, value, callback){
    // 必須指定 id
    if (id)
    {
        this.model[id] = value;

        if (this._commanders.hasOwnProperty(id) == false) {
            // 新增 Commander , value 為 config
            this._commanders[id] = new Commander(value);
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

        if (callback instanceof Function) callback(null,value);
    }
    else {
        if (callback instanceof Function) callback(new Error("No provide id Error!"),null);
    }
};

// 刪除設定資訊, 非同步方法
helper.prototype.del = function (id, callback){
    // 必須指定 id
    if (id)
    {
        if (this.model.hasOwnProperty(id))
        {
            delete this.model[id];
            var cmder = this._commanders[id];
            cmder.stop();
            delete this._commanders[id];

            if (callback instanceof Function) callback(null,null);
        }
        else
        {
            if (callback instanceof Function) callback(new Error('Not Found Error!'),null);
        }
    }
    else {
        if (callback instanceof Function) callback(new Error("No provide id Error!"),null);
    }
};


helper.prototype.getCommanders = function () {
    var values = [];

    for (var k in this._commanders){
        if (this._commanders.hasOwnProperty(k)) {
            console.log("Key is " + k + ", value is " + this._commanders[k].status.id);
            values.push(this._commanders[k].status);
        }
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
    }
    return this.instance;
}

module.exports = helper.getInstance();
