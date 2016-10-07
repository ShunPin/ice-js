/**
 * Created by benson on 2016/10/5.
 */

var bravo = bravo || {};

bravo.testLogin = function() {
    //var websiteURL = 'https://www.rd1.atcity.dev';
    var websiteURL = 'https://www.rd2.atcity.dev';


    if (!localStorage.getItem("DeviceId")) {
        // TODO: generate Device ID (UUID)
        localStorage.setItem("DeviceId", "Benson's Browser");
    }

    var DeviceId = localStorage.getItem("DeviceId");
    var loginInfo = localStorage.getItem("loginInfo");

    if (loginInfo) {
        loginInfo = JSON.parse(loginInfo);
    }

    var bravoLogin = new BravoLogin(DeviceId,loginInfo);
    //bravoLogin.setWebsite('https://www.rd1.atcity.dev');
    bravoLogin.setWebsite(websiteURL);

    var isGuestLogin = false;

    // 檢查是否有 loginInfo
    if (loginInfo) {
        isGuestLogin = false;

    } else {
        isGuestLogin = true;
    }

    bravoLogin.createSession(isGuestLogin).then(
        function () {
            localStorage.setItem("loginInfo", JSON.stringify(bravoLogin.loginInfo));
            // 登入成功
            console.log("登入成功");
            debugger;
        },
        function (msg) {
            console.log(msg);
            // 登入失敗
            debugger;
        }
    );
}
