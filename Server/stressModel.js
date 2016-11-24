/**
 * Created by benson on 2016/11/24.
 */

// 這是一個資料管理類別

'use strict'

function helper() {
    this.init = function() {
        //this.settings = [];
        this.settingsId = 1;
        this.settings = [
            {
                'id': this.settingsId++,
                'targetCount': 100,
                'interval': 100,
                'method': 'GuestLogin',
                'ice': true,
                'running': false,
            },
            {
                'id': this.settingsId++,
                'targetCount': 100,
                'interval': 100,
                'method': 'RegisterLogin',
                'ice': true,
                'running': false,
            }
        ];
        this.logInfos = [];
        this.cpuInfos = [];
    };

    this.init();
}

// 取得設定資訊, 非同步方法
helper.prototype.getDefaultSettings = function (callback){
    var val = {
            'id': this.settingsId,
            'targetCount': 100,
            'interval': 100,
            'method': 'GuestLogin',
            'ice': true,
            'running': false,
        };
    callback(null,val);
};

helper.prototype.getSettings = function (id, callback){
    if (id)
    {
        var found = false;
        for (var i=0;i< this.settings.length;i++)
        {
            var setVal = this.settings[i];
            if (setVal.id == id)
            {
                callback(null,setVal);
                found = true;
                break;
            }
        }
        if (found == false) callback(null,{});
    }
    else {
        callback(null,this.settings);
    }
};

// 設定設定資訊, 非同步方法
helper.prototype.setSettings = function (value) {
    // TODO: Benson
    this.settings = value;
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
