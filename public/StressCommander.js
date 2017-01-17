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
var filelogger = require("log4js").getLogger("stressFile");

/**
 * 擴充 String.format
 */
if( !String.prototype.format ) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

function Commander(config) {
    this.Config = config;
    this.runIndex = -1;
    this.intervalID = [];    // Timer ID
    this.status = {};
    this.status.id = config.id;
    this.status.running = false;
    this.status.targetCount = config.targetCount;
    this.status.currentCount = 0;
    this.status.loginCount = 0;
    this.status.finishCount = 0;
    this.status.failCount = 0;

    this.preLoginCount = 0;
    this.preFinishCount = 0;
}

// 回報運行狀態
Commander.prototype.report = function() {
    return JSON.stringify(this.status);
};

/**
 *  要測試 Run 的 constructor
 *  必須 Override
 * @returns {Object}
 */
Commander.prototype.createRunner = function() {
    log.error("[Error] you must implement {0}:{1}".format(self.constructor.name, arguments.callee.toString()));
    return undefined;
};

/**
 *  要測試 Run 的 啟動 action
 *  必須 Override
 * @param runner
 */
Commander.prototype.runAction = function(runner) {
    log.error("[Error] you must implement {0}:{1}".format(self.constructor.name, arguments.callee.toString()));
};

// start 測試開始
Commander.prototype.start = function() {
    if( this.status.running ) return;

    // 開始
    this._begin();

    // 啟動第一隻機器人
    this._each();

};

// stop 測試停止
Commander.prototype.stop = function() {
    if( this.status.running == false ) return;

    log.info("StressCommander [STOP]");
    this._stop();
};

// 當 runner 登入成功時呼叫
Commander.prototype.login = function(runner) {
    log.info("StressCommander [LOGIN],{0}#{1}".format("登入成功機器人", runner.runnerIndex));

    this.status.loginCount++;

    log.trace("StressCommander [STATUS]", JSON.stringify(this.status));
};

// 當 runner 斷線時呼叫
Commander.prototype.disconnect = function(runner) {
    log.info("StressCommander [DISCONNECT],{0}#{1}".format("與 gliacer 斷線機器人", runner.runnerIndex));

    this.status.loginCount--;
    if( !runner.doLogout ) {
        this.status.currentCount--;
        this.status.disconnectCount++;
    }

    log.trace("StressCommander [STATUS]", JSON.stringify(this.status));
};

// 當 runner 任務失敗時呼叫
Commander.prototype.fail = function(runner) {
    log.warn("StressCommander [FAIL],{0}#{1}".format("任務失敗機器人", runner.runnerIndex));
    filelogger.warn("StressCommander [FAIL],{0}#{1}".format("任務失敗機器人", runner.runnerIndex));

    this.status.currentCount--;
    this.status.failCount++;

    log.trace("StressCommander [STATUS]", JSON.stringify(this.status));
};

// 當 runner 任務完成時呼叫
Commander.prototype.finish = function(runner) {
    log.info("StressCommander [FINISH],{0}#{1}".format("任務完成機器人", runner.runnerIndex));

    this.status.currentCount--;
    this.status.finishCount++;

    log.trace("StressCommander [STATUS]", JSON.stringify(this.status));
};

// begin() 開始
Commander.prototype._begin = function() {
    log.info("StressCommander [Begin],{0}={1}".format("TargetNumber", this.Config.targetCount));

    this.status.running = true;
    this.status.targetCount = this.Config.targetCount;
    this.status.currentCount = 0;
    this.status.disconnectCount = 0;
    this.status.finishCount = 0;
    this.status.failCount = 0;
    this.runIndex = 0;
    this.intervalID.push(setInterval(this._each.bind(this), this.Config.interval));
    this.intervalID.push(setInterval(this._calculateAvgLogin.bind(this), 10000));
};

// 還沒達到預定數量時，會依照速度設定呼叫
Commander.prototype._each = function() {
    // 檢查是否達到數量
    if( this.status.currentCount < this.status.targetCount ) {
        log.info("StressCommander [Join],{0}#{1}".format("加入機器人", this.runIndex));
        var runner = this.createRunner();
        if( runner != null && runner != undefined ) {
            runner.runnerIndex = this.runIndex;
            this.runIndex++;
            this.status.currentCount++;

            this.runAction(runner);
        }
    }
};

// 停止後處理
Commander.prototype._stop = function() {
    this.intervalID.forEach(id => clearInterval(id));
    this.intervalID = [];

    this.status.running = false;
    this.status.loginPerSecond = 0;

    this.preLoginCount = 0;
    this.preFinishCount = 0;
};

// 計算平均登入數
Commander.prototype._calculateAvgLogin = function() {
    var loginDiff = this.status.loginCount - this.preLoginCount;
    this.preLoginCount = this.status.loginCount;
    var finishDiff = this.status.finishCount - this.preFinishCount;
    this.preFinishCount = this.status.finishCount;
    this.status.loginPerSecond = ((loginDiff + finishDiff < 0) ? 0 : loginDiff + finishDiff) / 10;
};

module.exports = Commander;

