/**
 * Created by benson on 2016/11/24.
 */

// 這是一個資料(model)類別
'use strict'

// ORM - Sequelize
var Sequelize = require('sequelize');

function helper() {
    this.isInit = false;
    this.tb_Settings = {};

    this.init = function () {
        var self = this;

        // // 測試用資料
        // this.model = [
        //     {
        //         'targetCount': 2,
        //         'interval': 100,
        //         'stayTime' : 60,
        //         'method': 'GuestLogin',
        //         'ice': true,
        //         'logout': true,
        //         'running': false,
        //     },
        //     {
        //         'targetCount': 5,
        //         'interval': 100,
        //         'stayTime' : 60,
        //         'method': 'FastLogin',
        //         'ice': true,
        //         'logout': true,
        //         'running': false,
        //     }
        // ];

        self.sequelizeDB = new Sequelize('database', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },

            // disable logging; default: console.log
            logging: false,

            // SQLite only
            storage: 'DB/project.sqlite',
        });

        self.tb_Settings = this.sequelizeDB.define('StressSettings', {
            id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, unique: true},
            targetCount: {type: Sequelize.INTEGER, allowNull: false},
            interval: {type: Sequelize.INTEGER, allowNull: false},
            stayTime: {type: Sequelize.INTEGER, allowNull: false},
            method: {type: Sequelize.STRING, allowNull: false},
            ice: {type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false},
            logout: {type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false},
            running: {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false},
            // running: {type: Sequelize.VIRTUAL, defaultValue: false, allowNull: false,
            //     get : function() {this.getDataValue('running') ? this.getDataValue('running') : false}
            // },
        });

        self.tb_Settings.sync().then(function () {
            // 將所有 running 狀態設為 false
            self.tb_Settings.update({running:false},{where: {running:true}}).then(
                function () {
                    self.isInit = true;
                }
            );
        });
    };

    this.init();
}

helper.prototype.get = function (id, callback) {
    if (id) {
        this.tb_Settings.find({where: {id: id}}).then(
            function (obj) {
                if (obj) callback(null, obj);
                else callback(null, {});
            });
    }
    else {
        this.tb_Settings.findAll().then(
            function (array) {
                if (array) callback(null, array);
                else callback(null, {});
            });
    }
};

// 設定設定資訊, 非同步方法
helper.prototype.set = function (id, value, callback) {
    if (id) {
        this.tb_Settings.findOrCreate({where: {id: id}}).spread(function (obj) {
            for (var vKey in value) {
                obj.setDataValue(vKey, value[vKey]);
            }
            obj.save().then(function () {
                    if (callback instanceof Function) callback(null, obj);
                }
            );
        });
    }
};

// 新增資料, 非同步方法
helper.prototype.add = function (value, callback) {
    this.tb_Settings.create(value).then(function (obj) {
        if (callback instanceof Function) callback(null, obj);
    });
};

// 刪除設定資訊, 非同步方法
helper.prototype.del = function (id, callback) {
    this.tb_Settings.destroy({where: {id: id}}).then(function () {
        if (callback instanceof Function) callback(null, null);
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
    }
    return this.instance;
}

module.exports = helper.getInstance();
