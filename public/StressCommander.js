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

function Commander(config) {
    this.Config = config;
    this.runIndex = -1;
    this.intervalID = undefined;    // Timer ID
    this.status = {};
    this.status.id = config.id;
    this.status.running = false;
    this.status.targetCount = config.targetCount;
    this.status.currentCount = 0;
    this.status.finishCount = 0;
    this.status.failCount = 0;
}

// 回報運行狀態
Commander.prototype.report = function () {
    return JSON.stringify(this.status);
};

/**
 *  要測試 Run 的 constructor
 *  必須 Override
 * @returns {Object}
 */
Commander.prototype.createRunner = function () {
    log.error("[Error] you must implement {0}:{1}".format(self.constructor.name,arguments.callee.toString()));
    return undefined;
};

/**
 *  要測試 Run 的 啟動 action
 *  必須 Override
 * @param runner
 */
Commander.prototype.runAction = function (runner) {
    log.error("[Error] you must implement {0}:{1}".format(self.constructor.name,arguments.callee.toString()));
};

// start 測試開始
Commander.prototype.start = function () {
    if (this.status.running) return;

    // 開始
    this._begin();

    // 啟動第一隻機器人
    this._each();

};

// stop 測試停止
Commander.prototype.stop = function() {
    if (this.status.running == false) return;

    log.info("StressCommander [STOP]");
    this._stop();
};

// 當 runner 任務完成時呼叫
Commander.prototype.success = function (runner) {
    log.info("StressCommander [SUCCESS],{0}#{1}".format("任務完成機器人",runner.runnerIndex));

    this.status.finishCount++;
    this.status.currentCount--;

    log.info("StressCommander [STATUS]", JSON.stringify(this.status));
};

// 當 runner 任務失敗時呼叫
Commander.prototype.fail = function (runner) {
    log.info("StressCommander [FAIL],{0}#{1}".format("任務失敗機器人",runner.runnerIndex));

    this.status.failCount++;
    this.status.currentCount--;

    log.info("StressCommander [STATUS]", JSON.stringify(this.status));
};

// begin() 開始
Commander.prototype._begin = function () {
    log.info("StressCommander [Begin],{0}={1}".format("TargetNumber",this.Config.targetCount));

    this.status.running = true;
    this.status.targetCount = this.Config.targetCount;
    this.status.currentCount = 0;
    this.status.finishCount = 0;
    this.status.failCount = 0;
    this.runIndex = 0;
    this.intervalID = setInterval(this._each.bind(this), this.Config.interval);
};

// 還沒達到預定數量時，會依照速度設定呼叫
Commander.prototype._each = function () {
    // 檢查是否達到數量
    if (this.status.currentCount < this.status.targetCount)
    {
        log.info("StressCommander [Join],{0}#{1}".format("加入機器人",this.runIndex));
        var runner = this.createRunner();
        if (runner !=null && runner != undefined) {
            runner.runnerIndex = this.runIndex;
            this.runAction(runner);
            this.status.currentCount++;
            this.runIndex++;
        }
    }
};

// 停止後處理
Commander.prototype._stop = function () {
    if (this.intervalID != undefined)
    {
        clearInterval(this.intervalID);
        this.intervalID = undefined;
    }
    this.status.running = false;
};

module.exports = Commander;
    
