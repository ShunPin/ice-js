/**
 * Created by benson on 2016/12/9.
 */

// 這是一個管理 Commander類別
'use strict'

function helper() {
    this.init = function() {
        this.model = {};
    };

    this.init();
}

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

module.exports = helper;