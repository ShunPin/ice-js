// Bravo Casino Glacier

var bravo = bravo || {};

bravo.Glacier = bravo.Glacier || {};

// Initialize 
// return Glacier2 router 
bravo.Glacier.init = function() {
    var RouterPrx = Glacier2.RouterPrx;
    // RouterSession
    var RouterSessionPrx = SGTech.AtlanticCity.MemberCenter;

    // 取 loginInfo (連線字串), 為 Default router
    // localStorage.setItem("loginInfo", JSON.stringify(bravo.loginInfo));   
    var router = bravo.loginInfo.GlacierConnectionString;

    //
    // Initialize the communicator with the Ice.Default.Router property
    // set to the simple chat demo Glacier2 router.
    //
    var initData = new Ice.InitializationData();
    initData.properties = Ice.createProperties();
    initData.properties.setProperty("Ice.Default.Router", router);

    // Active connection management
    initData.properties.setProperty("Ice.ACM.Close", "0"); // CloseOff
    initData.properties.setProperty("Ice.ACM.Heartbeat", "3"); // HeartbeatAlways
    initData.properties.setProperty("Ice.ACM.Timeout", "30");
    // Invoke timeout
    initData.properties.setProperty("Ice.Default.InvocationTimeout", "10000");
    initData.properties.setProperty("Ice.RetryIntervals", "-1");

    var communicator = Ice.initialize(initData);
    //
    // Get a proxy to the Glacier2 router using checkedCast to ensure
    // the Glacier2 server is available.
    //
    return RouterPrx.checkedCast(communicator.getDefaultRouter());
}

bravo.Glacier.createSession = function() {
    var communicator;
    var router;
    var session;

    Ice.Promise.try(
        function() {
            return bravo.Glacier.init();
        }
    ).then(
        function(r) {
            router = r;
            // 設定登入資訊
            var context = new Ice.HashMap();
            context.set(SGTech.AtlanticCity.RequestContract.Context_Platform,"Android");
            context.set(SGTech.AtlanticCity.RequestContract.Context_Product,"Robot");
            context.set(SGTech.AtlanticCity.RequestContract.Context_Language,"zh_TW");
            context.set(SGTech.AtlanticCity.RequestContract.Context_WebSessionId,bravo.loginInfo.AuthCode);
            context.set(SGTech.AtlanticCity.RequestContract.Context_MemberId,bravo.loginInfo.MemberId);
            return router.createSessionFromSecureConnection(context);
        }
    ).then(
        function (s) {
            session = SGTech.AtlanticCity.MemberCenter.RouterSessionPrx.uncheckedCast(s);
            // 呼叫 GetMemberId()
            return session.GetMemberId();
        }
    ).then(
        function (getMemberID) {
            // GetMemberId 成功
            console.log("GetMemberId 成功", getMemberID);
        }
    ).exception(
        function(ex) {
            debugger;
            // TODO:
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
                console.error(ex.toString());
            }

            if (communicator) {
                communicator.destroy();
            }
        });
}