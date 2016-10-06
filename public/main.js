/**
 * Created by benson on 2016/10/5.
 */

// Bravo Casino Main
function arraytoHexString(byteArray) {
    var result = "";
    byteArray.forEach(function(byte) {
        result += ('0' + (byte & 0xFF).toString(16)).slice(-2)
    });

    return result;
}

function hexStringToArray(str) {
    var result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));

        str = str.substring(2, str.length);
    }

    return result;
}

function stringToHex(str) {
    var hex;
    try {
        hex = unescape(encodeURIComponent(str))
            .split('').map(function(v) {
                return v.charCodeAt(0).toString(16);
            }).join('')
    } catch (e) {
        hex = str;
        console.log('invalid text input: ' + str)
    }
    return hex;
}

function stringFromHex(hex) {
    var str;
    try {
        str = decodeURIComponent(hex.replace(/(..)/g, '%$1'))
    } catch (e) {
        str = hex
        console.log('invalid hex input: ' + hex)
    }
    return str
}

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
