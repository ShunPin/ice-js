// Bravo Casino Login Main 

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


// require.config({
//     packages: [{
//         name: 'crypto-js',
//         location: '/bower_components/crypto-js',
//         main: 'index'
//     }]
// });

// require(["crypto-js/aes"], function(AES) {
//     console.log(SHA256("Message"));
// });

//axios.defaults.baseURL = 'https://www.rd1.atcity.dev';
axios.defaults.baseURL = 'https://www.rd2.atcity.dev';
axios.defaults.withCredentials = true;

var bravo = bravo || {};

bravo.Login = function() {
    if (!localStorage.getItem("DeviceId")) {
        // TODO: generate Device ID (UUID)
        localStorage.setItem("DeviceId", "Benson's Browser");
    }
    bravo.DeviceId = localStorage.getItem("DeviceId");

    delete bravo.RSAKey;

    // 準備 GetPreloginEncryptKey Command Body
    var cmdBody = bravo.GetPreloginEncryptKeyCmd();
    //console.log(JSON.stringify(cmdBody));

    axios.post('/api/GetPreloginEncryptKey', cmdBody)
        .then(function(response) {
            //console.log(response);

            var result_code = response.data.result_code;
            if (result_code && result_code == "OK") {
                console.log("API_Call::OK");

                // 取出 result_data
                var result_data = response.data.result_data;

                // HexString 解密
                if (1) {
                    // 解密
                    var rsaKey = bravo.RSAKey;
                    var resString = rsaKey.decrypt(result_data);
                    console.log("AES_KEY", resString);
                    var aesKey = JSON.parse(resString);

                    // 儲存 AES_Key
                    if (aesKey) {
                        bravo.AESKey = aesKey;
                    }
                }

                //debugger;
                if (bravo.RSAKey) {
                    var loginInfo = localStorage.getItem("loginInfo");

                    // 檢查是否有 loginInfo
                    if (loginInfo) {
                        bravo.loginInfo = JSON.parse(loginInfo);

                        // 快速登入                    
                        bravo.FastLogin();
                    } else {
                        delete bravo.loginInfo;

                        // guest 登入
                        bravo.GuestLogin();
                    }
                }
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

bravo.GuestLogin = function() {
    delete bravo.loginInfo;

    // 準備 GuestLogin Command Body
    var cmdBody = bravo.GuestLoginCmd(bravo);
    var cmdBodyString = JSON.stringify(cmdBody);
    //console.log(JSON.stringify(cmdBody));

    // AES 加密, 並轉 base64
    var key = CryptoJS.enc.Utf8.parse(bravo.AESKey.Key);
    var iv = CryptoJS.enc.Utf8.parse(bravo.AESKey.IV);
    var encrypted = CryptoJS.AES.encrypt(cmdBodyString, key, { iv: iv });
    var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    //console.log(encString);    

    var newCmdBody = { "data": encString };
    axios.post('/api/calle', newCmdBody)
        .then(function(response) {
            //console.log(response);                    

            var result_data = response.data;
            if (result_data && result_data.length > 2) {
                // AES 解密
                var decrypted = CryptoJS.AES.decrypt(result_data, key, { iv: iv });
                var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                var result = JSON.parse(decString);
                //debugger;

                if (result && result.result_code == "OK") {
                    console.log("API_Calle::OK");
                    var loginInfo = JSON.parse(result.result_data);
                    if (loginInfo) {
                        // 計錄 loginInfo
                        bravo.loginInfo = loginInfo;
                        localStorage.setItem("loginInfo", JSON.stringify(bravo.loginInfo));
                        console.log("登入成功!!");
                    }
                } else {
                    console.log("登入失敗!!");
                }
            } else {
                console.log("登入失敗!!");
            }
        })
        .catch(function(error) {
            console.log(error);
            console.log("登入失敗!!");
        });
}

bravo.FastLogin = function() {

    // 準備 FastLogin Command Body
    var cmdBody = bravo.FastLoginCmd(bravo);
    var cmdBodyString = JSON.stringify(cmdBody);
    console.log(cmdBodyString);
    //console.log(JSON.stringify(cmdBody));

    // AES 加密, 並轉 base64
    var key = CryptoJS.enc.Utf8.parse(bravo.AESKey.Key);
    var iv = CryptoJS.enc.Utf8.parse(bravo.AESKey.IV);
    var encrypted = CryptoJS.AES.encrypt(cmdBodyString, key, { iv: iv });
    var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    //console.log(encString);    

    var newCmdBody = { "data": encString };
    axios.post('/api/calle', newCmdBody)
        .then(function(response) {
            //console.log(response);            

            var result_data = response.data;
            if (result_data && result_data.length > 2) {
                // AES 解密
                var decrypted = CryptoJS.AES.decrypt(result_data, key, { iv: iv });
                var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                var result = JSON.parse(decString);
                //debugger;
                if (result && result.result_code == "OK") {
                    console.log("API_Calle::OK");
                    var loginInfo = JSON.parse(result.result_data);
                    if (loginInfo) {
                        // 計錄 loginInfo
                        bravo.loginInfo = loginInfo;
                        console.log("登入成功!!");
                    }
                } else {
                    console.log("登入失敗!!");
                }
            } else {
                console.log("登入失敗!!");
            }
        })
        .catch(function(error) {
            console.log(error);
            console.log("登入失敗!!");
        });
}

// GetPrelogin Command
bravo.GetPreloginEncryptKeyCmd = function() {
    // 產生 RSA Key, 長度 1024, Exponent 0x10001 
    var rsa = new RSAKey();
    rsa.generate(1024, "10001");
    //rsa.generate(1024, "3");

    // 計錄到 RSAKey
    bravo.RSAKey = rsa;

    // 轉成 base64
    var pubKeyString = cryptico.b16to64(rsa.n.toString(16));
    var expKeyString = cryptico.b16to64(rsa.e.toString(16));

    // 封裝成 ASP.Net 的 XML 格式 
    var pubKeyXML = "<RSAKeyValue><Modulus>" + pubKeyString + "</Modulus>" + "<Exponent>" + expKeyString + "</Exponent></RSAKeyValue>";


    // // 以 Base64 編碼 
    // var pubKeyBase64 = Base64.encode(pubKeyXML);
    // console.log(pubKeyBase64);

    // 以 HexString 編碼 
    var pubKeyBase64 = stringToHex(pubKeyXML);
    // console.log(pubKeyBase64);

    var body = {
        "command": "GetPreloginEncryptKey",
        "data": JSON.stringify({ "Key": pubKeyBase64 }),
        "product": "apk",
    };

    return body;
};

bravo.GuestLoginCmd = function(_bravo) {
    var body = {
        "command": "GuestLogin",
        "data": JSON.stringify({ "DeviceId": _bravo.DeviceId }),
        "product": "apk",
    };

    return body;
}

bravo.FastLoginCmd = function(_bravo) {
    var body = {
        "command": "FastLogin",
        "data": JSON.stringify({
            "MemberId": _bravo.loginInfo.MemberId,
            "LoginToken": _bravo.loginInfo.LoginToken,
            "DeviceId": _bravo.DeviceId,
        }),
        "product": "apk",
    };

    return body;
}

// Base64 TODO:
function RSADecrypt(b64String) {
    var c = parseBigInt(ctext, 16);
    var m = this.doPrivate(c);
    if (m == null) return null;
    return pkcs1unpad2(m, (this.n.bitLength() + 7) >> 3);
}

function cryptionTest() {
    var MattsRSAkey = new RSAKey();
    MattsRSAkey.generate(1024, "10001");

    /// String Test
    //stringTest(MattsRSAkey);
    binaryTest(MattsRSAkey);

    function stringTest(rsaKey) {
        var PlainText = "Matt, I need you to help me with my Starcraft strategy.";

        // cryptico test
        // 這一段有問題，是因為 cryptico 封裝的方法，預設 Exponent = 3
        var MattsPublicKeyString = cryptico.publicKeyString(rsaKey);
        // Result 是一個封裝後的物件
        var EncryptionResult = cryptico.encrypt(PlainText, MattsPublicKeyString);
        var DecryptionResult = cryptico.decrypt(EncryptionResult.cipher, rsaKey);

        if (DecryptionResult.status == "success") {
            console.log("cryptico 加解密成功");
            //debugger;
        } else {
            console.log("cryptico 加解密失敗!!");
            //debugger;
        }

        // Result Hex String
        EncryptionResult = rsaKey.encrypt(PlainText);
        DecryptionResult = rsaKey.decrypt(EncryptionResult);

        if (DecryptionResult && DecryptionResult == PlainText) {
            console.log("RSAKey 加解密成功");
            //debugger;
        } else {
            console.log("RSAKey 加解密失敗!!");
            //debugger;
        }
    }

    function binaryTest(rsaKey) {
        var PlainNumber = new Uint8Array(64);
        for (var i = 0; i < PlainNumber.byteLength; i++) {
            PlainNumber[i] = i + 1;
        }

        // Binary Array 轉 BigInteger 後直接加解密, 沒有 Padding!!
        // OK
        var bV1 = new BigInteger(PlainNumber);
        var enV1 = rsaKey.doPublic(bV1);
        var deV1 = rsaKey.doPrivate(enV1);
        var aryV1 = deV1.toByteArray();
        //debugger;

        // Binary Array 轉 HexString 後加解密

        // Binary Array 轉 HexString 後加解密
        // To Hex String
        var PlainHex = arraytoHexString(PlainNumber);
        var PlainAry = hexStringToArray(PlainHex);
        var EncryptionResult = rsaKey.encrypt(PlainHex);
        var DecryptionResult = rsaKey.decrypt(EncryptionResult);
        //debugger

        // To BigInteger 
        var message = new BigInteger(PlainText, 16);
        var messageArg = message.toByteArray();
        var NumberString = message.toString();
        //debugger;
        var EncryptionResult = rsaKey.doPublic(message);
        //debugger;
        var DecryptionResult = rsaKey.decrypt(EncryptionResult);
        //debugger;

        var EncryptionResult = rsaKey.encrypt(PlainText);
        var DecryptionResult = rsaKey.decrypt(EncryptionResult);

        if (DecryptionResult) {
            var ConfirmNumber = hexStringToArray(DecryptionResult);
            if (ConfirmNumber == PlainNumber) {
                console.log("RSAKey 加解密成功");
            } else {
                console.log("RSAKey 加解密失敗!!");
            }
            //debugger;
        } else {
            console.log("RSAKey 加解密失敗!!");
            //debugger;
        }
    }
}


// GetPreloginEncryptKeyCmd 
function bravoLogin() {
    console.log('bravoLogin');

    var cmdBody = bravo.GetPreloginEncryptKeyCmd();

    //console.log(JSON.stringify(cmdBody));
    axios.post('/api/GetPreloginEncryptKey', cmdBody)
        .then(function(response) {
            console.log(response);
            // 測試 Guest Login
            var result_code = response.data.result_code;
            if (result_code && result_code == "OK") {
                console.log("API_Call::OK");

                // 取出 result_data
                var result_data = response.data.result_data;

                // HexString 解密
                if (1) {
                    // 解密
                    var rsaKey = bravo.RSAKey;
                    var resString = rsaKey.decrypt(result_data);
                    var aesKey = JSON.parse(resString);

                    // 儲存 AES_Key
                    if (aesKey) {
                        bravo.AESKey = aesKey;
                        guestLogin();
                    }
                }
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

// GuestLoginCmd
function guestLogin() {
    console.log('guestLogin');

    var cmdBody = bravo.GuestLoginCmd();
    var cmdBodyString = JSON.stringify(cmdBody);
    console.log(JSON.stringify(cmdBody));

    // AES 加密, 並轉 base64
    var key = CryptoJS.enc.Utf8.parse(bravo.AESKey.Key);
    var iv = CryptoJS.enc.Utf8.parse(bravo.AESKey.IV);
    var encrypted = CryptoJS.AES.encrypt(cmdBodyString, key, { iv: iv });
    var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    //console.log(encString);
    //debugger;

    var newCmdBody = { "data": encString };
    axios.post('/api/calle', newCmdBody)
        .then(function(response) {
            //console.log(response);
            //debugger;

            // 清除 loginInfo
            delete bravo.loginInfo;

            var result_data = response.data;
            if (result_data && result_data.length > 2) {
                // AES 解密
                var decrypted = CryptoJS.AES.decrypt(result_data, key, { iv: iv });
                var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                var result = JSON.parse(decString);
                if (result && result.result_code == "OK") {
                    console.log("API_Calle::OK");
                    var loginInfo = JSON.parse(result.result_data);
                    if (loginInfo) {
                        // 計錄 loginInfo
                        bravo.loginInfo = loginInfo;
                    }
                } else {
                    console.log("登入失敗!!");
                }
            } else {
                console.log("登入失敗!!");
            }
        })
        .catch(function(error) {
            console.log(error);
            console.log("登入失敗!!");
        });
}