/**
 * Created by benson on 2016/11/2.
 */

var express = require('express');
var router = express.Router();
var path = require('path');
var log = require("log4js").getLogger("stress");
var Ice = require("Ice").Ice;
var Commander = require('../public/StressCommander');
var BravoLogin = require('../public/bravoLogin').BravoLogin;

var mgrCommander = {};
/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.resolve(__dirname, '../views/stress.html'));

    // TODO:  整合  Kibana  view
});

router.get('/test',function (req, res, next) {
    /**
     *  generateUUID 測試
     */
    // var DeviceId = Ice.generateUUID().toString();
    // log.debug(DeviceId);
    // res.send(DeviceId);

    // 初始化
    mgrCommander = require('../server/MgrCommander');
    mgrCommander.setWebsite('https://www.rd2.atcity.dev');

    res.send('Setting OK')
    res.status(200).end();
});

router.get('/test/:id', function (req, res, next) {    //res.send('respond with a resource');
    // 測試將 id 內狀態改變 ( Stop <-> Run )
    var id = req.params.id;
    mgrCommander.get(id,function (err,obj) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: {}
            });
        }
        else {
            //console.log(results);
            // clone obj
            var newObj = JSON.parse(JSON.stringify(obj));
            newObj.running = !obj.running;
            mgrCommander.set(id,newObj);
            res.status(200).end();
        }
    });
});

router.get('/run',function (req, res, next) {

    var websiteURL = 'https://www.rd2.atcity.dev';
    //var websiteURL = req.body.websiteURL;

    var config = {};
    config.targetCount = 5;
    config.interval = 1000;
    config.isGuestLogin = true;
    config.Ice = true;
    // 要壓測的參數
    // 數量
    // 速度 (ms)
    // 登入方式 (註冊登入 / 訪客登入)
    // 是否登入 Ice
    // 額外行為

    // TODO : Parse req.body to config
    log.info('Login Test Start...',config);

    var commander = new Commander(config);
    commander.createRunner = function () {
        var runner = new BravoLogin(Ice.generateUUID().toString());
        runner.setWebsite(websiteURL);
        return runner;
    };
    commander.runAction = function (runner) {
        runner.createSession(config.isGuestLogin).then(
            function () {
                // 登入成功
                console.log("登入成功");
                commander.success(runner);
            },
            function (msg) {
                // 登入失敗
                console.log(msg);
                commander.fail(runner);
            }
        );
    };

    // 開始壓測
    commander.start();
    res.send('preTest Start...');
});

// 壓力測試 :: 登入
router.get('/login', function(req, res, next) {
    // 登入 Brave Web Site

    // TODO: 修改成帶參數
    var websiteURL = 'https://www.rd2.atcity.dev';
    //var websiteURL = req.body.websiteURL;
    var config = {};
    config.targetCount = 100;
    config.interval = 100;
    config.Method = "Guest";
    config.Ice = true;

    // 要壓測的參數
    // 數量
    // 速度 (ms)
    // 登入方式 (註冊登入 / 訪客登入)
    // 是否登入 Ice
    // 額外行為

    // TODO : Parse req.body to config
    log.info('Login Test Start...',config);

    var commander = new Commander(config);
    commander.createRunner = function () {
        return new BravoLogin(Ice.generateUUID().toString());
    };
    commander.runAction = function (runner) {
        runner.createSession(true).then(
            function () {
                localStorage.setItem("loginInfo", JSON.stringify(runner.loginInfo));
                // 登入成功
                console.log("登入成功");
            },
            function (msg) {
                console.log(msg);
                // 登入失敗
            }
        );
    };

    // TODO: 設計
    // 設計一個 Stress Runner, 來 Run to Target
    // interface
    // before() 前置作業
    // begin() 開始
    // each() 還沒達到預定數量時，會依照速度設定呼叫
    // end() 結束
    // method
    // success()，每一個單位完成時呼叫
    // fail(), 每一個單位失敗時呼叫
    // 另外使用 Promise 方式 Callback


    // Service, 使用 Timer

    // TODO: Generate DeviceID with uuid
    var DeviceId = "Benson's Nodejs";

    var bravoLogin = new BravoLogin(DeviceId);
    bravoLogin.setWebsite(websiteURL);
    bravoLogin.createSession(true).then(
        function () {
            localStorage.setItem("loginInfo", JSON.stringify(bravoLogin.loginInfo));
            // 登入成功
            console.log("登入成功");
        },
        function (msg) {
            console.log(msg);
            // 登入失敗
        }
    );

    console.log(BravoLogin);
    res.send("login to"+websiteURL);
});

module.exports = router;