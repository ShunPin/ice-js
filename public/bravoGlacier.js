(function (module, require, exports) {
    var Ice = require('Ice').Ice;
    var Glacier2 = require("Ice").Glacier2;
    var RequestContract = require('../public/RequestContract').SGTech.AtlanticCity.RequestContract;
    var MemberCenter = require('../public/RouterSession').SGTech.AtlanticCity.MemberCenter;
    //var ClientFacade = require('../public/ClientDynamicInvoke').SGTech.AtlanticCity.ClientFacade;

    // Bravo Casino Glacier
    var BravoGlacier = Ice.Class({

        ClientFacade: {
            Login: "Login",
            LoginError: "LoginError",
            Disconnect: "Disconnect",
            InvokeError: "InvokeError",
            InvokeTimeout: "InvokeTimeout",
            AddCallbackSucceed: "AddCallbackSucceed",
            AddCallbackError: "AddCallbackError",
            RemoveCallbackError: "RemoveCallbackError",
            UpdateToken: "UpdateToken",
        },

        /**
         *  初始化建構式
         * @param loginInfo , 登入需要的資訊, 由 Web Login 取得
         * @private
         */
        __init__: function (deviceId,loginInfo) {
            if (loginInfo) {
                this.deviceId = deviceId;
                this.loginInfo = loginInfo;

                // 取 loginInfo.GlacierConnectionString (連線字串), 為 Default router
                this.GlacierConnectionString = loginInfo.GlacierConnectionString;
                // Node.js runtime, 用來壓測使用
                if (typeof window === 'undefined') {
                    this.GlacierConnectionString += ":tcp -h 127.0.0.1 -p 8000";
                }

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
                    // 計錄 RouterPrx
                    self.router = router;

                    // 設定登入資訊
                    var context = new Ice.HashMap();
                    context.set(RequestContract.Context_Platform, "Android");
                    context.set(RequestContract.Context_Product, "Robot");
                    context.set(RequestContract.Context_Language, "zh_TW");
                    context.set(RequestContract.Context_WebSessionId, self.loginInfo.AuthCode);
                    context.set(RequestContract.Context_MemberId, self.loginInfo.MemberId.toString());
                    context.set(RequestContract.Context_DeviceId, self.deviceId.toString());

                    console.log('createSession() createSessionFromSecureConnection');
                    return router.createSessionFromSecureConnection(context).then(
                        function (session) {
                            console.log('createSession() uncheckedCast');
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
                        console.error(ex, ex.stack);
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
        },

        /**
         * @method registerFunctionalListener
         * @param {String} proxy_name
         * @param {function} callback
         * @param {boolean} [register_to_ice=false]
         * @return {boolean}
         */
        // registerFunctionalListener: function (proxy_name,
        //                                       callback,
        //                                       register_to_ice) {
        //
        //     // 需要對 ice add callback
        //     if (register_to_ice) {
        //         // 對 Ice :: addCallback
        //         var self = this;
        //         var proxy = self.communicator.stringToProxy(proxy_name);
        //         var invokablePrx = ClientFacade.InvokablePrx.uncheckedCast(proxy);
        //         var callbackPrx;
        //         var categoryString = "";
        //         self.m_glacier.router.getCategoryForClient().then(
        //             function (category) {
        //                 categoryString = category;
        //                 return self.communicator.createObjectAdapterWithRouter("",self.m_glacier.router);
        //             }
        //         ).then(
        //             function (adapter) {
        //                 //
        //                 // Create a callback receiver servant and add it to
        //                 // the object adapter.
        //                 //
        //                 var r = adapter.add(new InvokeCallback(callback), new Ice.Identity(Ice.generateUUID(), categoryString));
        //
        //                 //
        //                 // Set the connection adapter.
        //                 //
        //                 //self.m_glacier.router.ice_getCachedConnection().setAdapter(adapter);
        //
        //                 //
        //                 // Create the CallbackablePrx servant and add it to the ObjectAdapter.
        //                 //
        //                 callbackPrx = ClientFacade.CallbackablePrx.uncheckedCast(r);
        //
        //                 //
        //                 // Register the client with the bidir server.
        //                 //
        //                 return invokablePrx.AddCallback(callbackPrx, self.m_glacier.session);
        //             }).then(
        //             function (result) {
        //
        //                 if (result.resultCode == RequestContract.RequestResult.ResultCode_Success)
        //                 {
        //                     // AddCallback 成功
        //                     console.log(proxy_name, "AddCallback 成功");
        //
        //                     // 計錄callbackPrx 到 functionListener 中
        //                     self.functionListener[proxy_name].callbackPrx =  callbackPrx;
        //                     self._callconnectionLister(self.ClientFacade.AddCallbackSucceed, JSON.stringify({ProxyName : proxy_name}));
        //                 }
        //                 else
        //                 {
        //                     // AddCallback 呼叫成功，但回傳錯誤
        //                     cc.warn(proxy_name, "AddCallback 失敗!!", "resultCode=",result.resultCode );
        //                     cc.warn(proxy_name, "AddCallback 失敗!!", "resultMessage=",result.resultMessage );
        //                     self._callconnectionLister(self.ClientFacade.InvokeError, JSON.stringify({ProxyName : proxy_name}));
        //                 }
        //
        //             }).exception(
        //             function (ex) {
        //                 // InvokeError
        //                 console.log(proxy_name, "AddCallback Error", ex.toString());
        //
        //                 self._callconnectionLister(self.ClientFacade.AddCallbackError, JSON.stringify({ProxyName : proxy_name}));
        //             });
        //     }
        //
        //     // 計錄到 functionListener 中
        //     this.functionListener[proxy_name] = { "callback" : callback, "register_to_ice" : register_to_ice};
        //     return true;
        // },
        //
        // /**
        //  * @method unregisterFunctionalListener
        //  * @param {String} proxy_name
        //  */
        // unregisterFunctionalListener: function (proxy_name) {
        //     var callbackInfo = this.functionListener[proxy_name];
        //
        //     // Check 是否要對 Ice RemoveCallback
        //     if (callbackInfo.register_to_ice) {
        //         // 對 Ice :: RemoveCallback
        //         var self = this;
        //         var proxy = self.communicator.stringToProxy(proxy_name);
        //         var invokablePrx = ClientFacade.InvokablePrx.uncheckedCast(proxy);
        //         if (typeof callbackInfo.callbackPrx != 'undefined')
        //         {
        //             invokablePrx.RemoveCallback(callbackPrx, self.m_glacier.session).then(
        //                 function () {
        //                     // AddCallback 成功
        //                     console.log(proxy_name, "RemoveCallback 成功");
        //                     // TODO: Test
        //                     debugger;
        //                 }
        //             ).exception(
        //                 function (ex) {
        //                     // InvokeError
        //                     console.log(proxy_name, "RemoveCallback Error", ex.toString());
        //                     // TODO: Test
        //                     debugger;
        //                     self._callconnectionLister(self.ClientFacade.RemoveCallbackError, JSON.stringify({ProxyName : proxy_name}));
        //                 });
        //         }
        //     }
        //
        //     delete self.functionListener[proxy_name];
        // },
    });
    exports.BravoGlacier = BravoGlacier;
    
}(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
