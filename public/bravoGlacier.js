(function (module, require, exports) {
    var Ice = require('Ice').Ice;

    // Bravo Casino Glacier
    var BravoGlacier = Ice.Class({

        /**
         *  初始化建構式
         * @param loginInfo , 登入需要的資訊, 由 Web Login 取得
         * @private
         */
        __init__: function (loginInfo) {
            if (loginInfo) {
                this.loginInfo = loginInfo;

                // 取 loginInfo.GlacierConnectionString (連線字串), 為 Default router
                this.GlacierConnectionString = loginInfo.GlacierConnectionString;

                //
                // Initialize the communicator with the Ice.Default.Router property
                //
                var initData = new Ice.InitializationData();
                initData.properties = Ice.createProperties();
                initData.properties.setProperty("Ice.Default.Router", this.GlacierConnectionString);

                // Active connection management
                initData.properties.setProperty("Ice.ACM.Close", "0"); // CloseOff
                initData.properties.setProperty("Ice.ACM.Heartbeat", "3"); // HeartbeatAlways
                initData.properties.setProperty("Ice.ACM.Timeout", "30");
                // Invoke timeout
                initData.properties.setProperty("Ice.Default.InvocationTimeout", "10000");
                initData.properties.setProperty("Ice.RetryIntervals", "-1");

                this.communicator = Ice.initialize(initData);
            }
            else {
                throw new Error("new bravo.Glacier must have a loginInfo with constructor!!");
            }
        },
        /**
         *  與 Glacier 連線驗證
         * @returns {*} SGTech.AtlanticCity.MemberCenter.RouterSessionPrx
         */
        createSession: function () {
            var self = this;

            return Glacier2.RouterPrx.checkedCast(self.communicator.getDefaultRouter()).then(
                function (router) {
                    self.router = router;
                    var connection = router.ice_getCachedConnection();
                    connection.setCallback({
                        closed: function()
                        {
                            console.error("Connection lost!!");
                        }
                    });

                    // 設定登入資訊
                    var context = new Ice.HashMap();
                    var RequestContract = require('RequestContract').SGTech.AtlanticCity.RequestContract;
                    context.set(RequestContract.Context_Platform, "Android");
                    context.set(RequestContract.Context_Product, "Robot");
                    context.set(RequestContract.Context_Language, "zh_TW");
                    context.set(RequestContract.Context_WebSessionId, self.loginInfo.AuthCode);
                    context.set(RequestContract.Context_MemberId, self.loginInfo.MemberId);

                    console.log('createSession() createSessionFromSecureConnection');
                    return router.createSessionFromSecureConnection(context).then(
                        function (session) {
                            console.log('createSession() uncheckedCast');
                            var MemberCenter = require('RouterSession').SGTech.AtlanticCity.MemberCenter;
                            self.session = MemberCenter.RouterSessionPrx.uncheckedCast(session);
                            return self.session;
                        }
                    );
                }
            ).exception(
                function (ex) {
                    //
                    // Handle any exceptions that occurred during session creation.
                    //
                    if (ex instanceof Glacier2.PermissionDeniedException) {
                        console.error("permission denied:\n" + ex.reason);
                    } else if (ex instanceof Glacier2.CannotCreateSessionException) {
                        console.error("cannot create session:\n" + ex.reason);
                    } else if (ex instanceof Ice.ConnectFailedException) {
                        console.error("connection to server failed");
                    } else {
                        console.error(ex);
                    }
                    if (self.communicator) {
                        self.communicator.destroy();
                    }

                    throw ex;
                }
            );
        },

        /**
         *  Get MemberID
         * @returns {*}  Ice.AsyncResult
         */
        getMemberID : function () {
            return this.session.GetMemberId();
        }
    });
    exports.BravoGlacier = BravoGlacier;
    
}(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
