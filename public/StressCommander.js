/**
 * Created by benson on 2016/11/8.
 */

// 設計一個 Stress Commander, 來 Command Target
// interface
// before() 前置作業
// begin() 開始
// each() 還沒達到預定數量時，會依照速度設定呼叫
// end() 結束
// method
// success()，每一個單位完成時呼叫
// fail(), 每一個單位失敗時呼叫
// 另外使用 Promise 方式 Callback

var log = require("log4js").getLogger("stress");
var Ice = require("ice").Ice;

/**
 * 擴充 String.format
 */
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

var commander = Ice.Class({
    Config : {},
    Targets : new Array(),
    status : {
        running : false,
        targetCount : 0,
        finishCount : 0,
        failCount : 0,
    },

    __init__: function (config) {
        this.Config = config;
        this.runIndex = -1;
        this.intervalID = undefined;
    },

    // 回報運行狀態
    report : function () {
        return JSON.stringify(this.status);
    },
    /**
     *  要測試 Run 的 constructor
     *  必須 Override
     * @returns {Object}
     */
    createRunner : function () {
        log.error("[Error] you must implement {0}:{1}".format(self.constructor.name,arguments.callee.toString()));
        return undefined;
    },

    /**
     *  要測試 Run 的 啟動 action
     *  必須 Override
     * @param runner
     */
    runAction : function (runner) {
        log.error("[Error] you must implement {0}:{1}".format(self.constructor.name,arguments.callee.toString()));
    },


    // start 測試開始
    start: function () {
        if (this.status.running) return;

        log.info("StressCommander [Before],{0}={1}".format("TargetNumber",this.Config.targetCount));
        for (var i=0; i<this.Config.targetCount; i++)
        {
            var runner = this.createRunner();
            runner.runnerIndex = i;
            this.Targets.push(runner);
        }
        // 開始
        this._begin();
    },

    // stop 測試停止
    stop: function() {
        if (this.status.running == false) return;

        log.info("StressCommander [STOP]");
        this._stop;
    },

    // 當 runner 任務完成時呼叫
    success: function (runner) {
        this.status.finishCount++;
        log.info("StressCommander [SUCCESS],{0}#{1}".format("任務完成機器人",runner.runnerIndex));
        if (this.status.finishCount == this.status.targetCount) {
            this._finish();
        }
    },

    // 當 runner 任務失敗時呼叫
    fail: function (runner) {
        this.status.failCount++;
        log.info("StressCommander [FAIL],{0}#{1}".format("任務失敗機器人",runner.runnerIndex));
    },

    // begin() 開始
    _begin : function () {
        log.info("StressCommander [Begin],{0}={1}".format("TargetNumber",this.Config.targetCount));
        this.status.running = true;
        this.status.targetCount = this.Config.targetCount;
        this.status.finishCount = 0;
        this.status.failCount = 0;
        this.runIndex = 0;
        this.intervalID = setInterval(this._each.bind(this), this.Config.interval);
    },

    // 還沒達到預定數量時，會依照速度設定呼叫
    _each : function () {
        if (this.runIndex < this.Targets.length)
        {
            var runner = this.Targets[this.runIndex];
            log.info("StressCommander [Join],{0}#{1}".format("加入機器人",this.runIndex));
            this.runAction(runner);
            this.runIndex++;
        }
        else {
            // 停掉 Timer
            clearInterval(this.intervalID);
        }
    },

    // 測試完成
    _finish : function () {
        log.info("StressCommander [End],{0}={1}".format("TargetNumber",this.Config.targetCount));
        this._stop();
    },

    // 停止後處理
    _stop : function () {
        if (this.intervalID != undefined)
        {
            clearInterval(this.intervalID);
            this.intervalID = undefined;
        }
        // Empty Targets
        this.status.running = false;
        this.Targets.length = 0;
    },
});

module.exports = commander;
    
