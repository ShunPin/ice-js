(function (module, require, exports) {
    //axios.defaults.withCredentials = true;

    var cryptico;
    var RSAKey;
    var axios;
    var CryptoJS;
    var Ice = require("ice").Ice;
    var BravoGlacier = require('../public/bravoGlacier').BravoGlacier;

    // Node.js
    if (typeof window === 'undefined') {
        cryptico = require("cryptico-js");
        RSAKey = require("cryptico-js").RSAKey;
        axios = require("axios");
        CryptoJS = require("crypto-js");
    }
    // Browser
    else {
        cryptico = window.cryptico;
        RSAKey = window.RSAKey;
        axios = window.axios;
        CryptoJS = window.CryptoJS;
    }

    var BravoLogin = Ice.Class({
        __init__: function (deviceID) {
            this.axiosConfig = {withCredentials:true,headers:{}};
            this.DeviceId = deviceID;
            //this.loginInfo = loginInfo;
            this.SessionCookies = [];
            this.RSAKey = {};
            this.AESKey = {Key : "", IV : ""};
            this.Language = "zh_TW";
        },

        /**
         * @method clearSessionCookies
         */
        clearSessionCookies : function (
        )
        {
            this.SessionCookies = {};
        },

        /**
         *  設定要登入的 Website URL
         * @param url
         */
        setWebsite : function (url) {
            this.axiosConfig.baseURL = url;
        },

        /**
         * @method setLanguageTag
         * @param {String} lang_tag
         */
        setLanguageTag : function (
            lang_tag)
        {
            this.Language = lang_tag;
        },

        /**
         * 登入並建立 Session
         * @param isGuestLogin
         * @returns {*} Ice.Promise 物件, 成功並傳出 MemberCenter.RouterSessionPrx
         */
        createSession: function (isGuestLogin) {
            var self = this;

            var promise = new Ice.Promise();

            // 準備 GetPreloginEncryptKey Command Body
            var cmdBody = this._getPreloginEncryptKeyCmd();
            this.axiosConfig.headers['Cookie']=self.SessionCookies;
            axios.post('/api/call', cmdBody, this.axiosConfig)
                .then(function (response) {
                    //console.log("response.headers:",JSON.stringify(response.headers));
                    // Check Cookie and save
                    var cookie = response.headers['set-cookie'];
                    if (cookie != undefined)
                    {
                        self.SessionCookies = cookie;
                        console.log("Set-Cookie:",cookie);
                    }

                    // success
                    var result_code = response.data.result_code;
                    if (result_code && result_code == "OK") {
                        console.log("API_Call::OK");

                        // 取出 result_data
                        var result_data = response.data.result_data;

                        // HexString 解密
                        if (1) {
                            // 解密
                            var resString = self._decryptRsaData(result_data);
                            var aesKey = JSON.parse(resString);
                            // 儲存 AES_Key
                            if (aesKey) {
                                // 取得 AESKey 成功
                                self._setAesKey(aesKey.Key,aesKey.IV);

                                // 處理登入
                                self._login(isGuestLogin).then(
                                    // success
                                    function (session) {
                                        promise.succeed(session);
                                    }
                                ).exception(
                                    function (ex) {
                                        promise.fail(ex);
                                    }
                                );
                            }
                            else {
                                delete self.AESKey;
                                // 取得 AESKey 失敗
                                throw new Error("PreloginEncryptKey Error");
                            }
                        }
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    promise.fail(error.toString());
                });

            return promise;
        },

        /**
         * @method logout
         */
        logout: function () {
            // 讓他斷線
            this.glacier.communicator.destroy();
        },

        /**
         *  登入處理, 區分 GuestLogin 與 FastLogin
         * @param isGuestLogin
         * @returns {*} Ice.Promise 物件, 成功必導出 MemberCenter.RouterSessionPrx
         * @private
         */
        _login: function (isGuestLogin) {
            var self = this;
            var promise = new Ice.Promise();

            if (isGuestLogin) {
                // guest 登入
                self._guestLogin().then(
                    // success
                    function () {
                        // guest 登入成功
                        console.log("guest 登入成功");

                        var glacier = new BravoGlacier(self.DeviceId,self.loginInfo);
                        self.glacier = glacier;
                        return glacier.createSession();
                    }
                ).then(
                    // success
                    function (session) {
                        console.log("glacier 登入成功");
                        promise.succeed(session);
                    }
                ).exception(
                    function (ex) {
                        promise.fail(ex.toString());
                    }
                );
            } else {
                // fast 登入
                self._fastLogin().then(
                    // success
                    function () {
                        // fast 登入成功
                        console.log("fast 登入成功");

                        var glacier = new BravoGlacier(self.loginInfo);
                        self.glacier = glacier;
                        return glacier.createSession();
                    }
                ).then(
                    // success
                    function (session) {
                        console.log("glacier 登入成功");
                        promise.succeed(session);
                    }
                ).exception(
                    function (ex) {
                        promise.fail(ex.toString());
                    }
                );
            }

            return promise;
        },

        _guestLogin: function () {
            var self = this;
            delete this.loginInfo;

            var promise = new Ice.Promise();
            // TODO: 修改成  _sendEncryptionRequest('/api/calle',);
            //this._sendEncryptionRequest('/api/calle',);

            // 準備 GuestLogin Command Body
            var cmdBody = this._getGuestLoginCmd();
            var cmdBodyString = JSON.stringify(cmdBody);

            // AES 加密, 並轉 base64
            var key = CryptoJS.enc.Utf8.parse(this.AESKey.Key);
            var iv = CryptoJS.enc.Utf8.parse(this.AESKey.IV);
            var encrypted = CryptoJS.AES.encrypt(cmdBodyString, key, {iv: iv});
            var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

            var newCmdBody = {"data": encString};
            this.axiosConfig.headers['Cookie']=self.SessionCookies;
            axios.post('/api/calle', newCmdBody, this.axiosConfig)
                // success
                .then(function (response) {
                    var cookie = response.headers['set-cookie'];
                    if (cookie != undefined)
                    {
                        self.SessionCookies = cookie;
                        console.log("Set-Cookie:",cookie);
                    }

                    var result_data = response.data;
                    if (result_data && result_data.length > 2) {
                        // AES 解密
                        var decrypted = CryptoJS.AES.decrypt(result_data, key, {iv: iv});
                        var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                        var result = JSON.parse(decString);

                        if (result && result.result_code == "OK") {
                            console.log("API_Calle::OK");
                            var loginInfo = JSON.parse(result.result_data);
                            if (loginInfo) {
                                // 計錄 loginInfo
                                self.loginInfo = loginInfo;
                                console.log("GuestLogin 成功");
                                promise.succeed(loginInfo);
                            } else {
                                promise.fail("GuestLogin loginInfo is null");
                            }

                        } else {
                            promise.fail("GuestLogin result Error");
                        }
                    } else {
                        promise.fail("GuestLogin result Error");
                    }
                })
                .catch(function (error) {
                    console.error(error);
                    promise.fail(error.toString());
                });

            return promise;
        },

        _fastLogin: function () {
            var self = this;

            var promise = new Ice.Promise();

            // 準備 FastLogin Command Body
            var cmdBody = this._getFastLoginCmd();
            var cmdBodyString = JSON.stringify(cmdBody);

            // AES 加密, 並轉 base64
            var key = CryptoJS.enc.Utf8.parse(self.AESKey.Key);
            var iv = CryptoJS.enc.Utf8.parse(self.AESKey.IV);
            var encrypted = CryptoJS.AES.encrypt(cmdBodyString, key, {iv: iv});
            var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

            var newCmdBody = {"data": encString};
            this.axiosConfig.headers['Cookie']=self.SessionCookies;
            axios.post('/api/calle', newCmdBody, this.axiosConfig)
                // success
                .then(function (response) {
                    var cookie = response.headers['set-cookie'];
                    if (cookie != undefined)
                    {
                        self.SessionCookies = cookie;
                        console.log("Set-Cookie:",cookie);
                    }

                    var result_data = response.data;
                    if (result_data && result_data.length > 2) {
                        // AES 解密
                        var decrypted = CryptoJS.AES.decrypt(result_data, key, {iv: iv});
                        var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                        var result = JSON.parse(decString);

                        if (result && result.result_code == "OK") {
                            console.log("API_Calle::OK");
                            var loginInfo = JSON.parse(result.result_data);
                            if (loginInfo) {
                                // 計錄 loginInfo
                                self.loginInfo = loginInfo;
                                console.log("FastLogin 成功!!");
                                promise.succeed(loginInfo);
                            } else {
                                promise.fail("FastLogin loginInfo is null");
                            }
                        } else {
                            promise.fail("FastLogin result Error");
                        }
                    } else {
                        console.error("登入失敗!!");
                        promise.fail("FastLogin result Error");
                    }
                })
                .catch(function (ex) {
                    console.log(error);
                    promise.fail(error.toString());
                });

            return promise;
        },

        /**
         * @method getRsaPublicKey
         * @return {String} rsa key
         */
        _getRsaPublicKey : function (
        )
        {
            // 產生 RSA Key, 長度 1024, Exponent 0x10001
            var rsa = new RSAKey();
            rsa.generate(1024, "10001");

            // 計錄到 RSAKey
            this.RSAKey = rsa;

            // 轉成 base64
            var pubKeyString = cryptico.b16to64(rsa.n.toString(16));
            var expKeyString = cryptico.b16to64(rsa.e.toString(16));

            // 封裝成 ASP.Net 的 XML 格式
            var pubKeyXML = "<RSAKeyValue><Modulus>" + pubKeyString + "</Modulus>" + "<Exponent>" + expKeyString + "</Exponent></RSAKeyValue>";

            // 以 Base64 String 編碼
            var pubKeyBase64 = CryptoJS.enc.Latin1.parse(pubKeyXML).toString(CryptoJS.enc.Base64);

            return pubKeyBase64;
        },

        /**
         * @method setAesKey
         * @param {String} key
         * @param {String} iv
         */
        _setAesKey : function (
            key,
            iv
        )
        {
            this.AESKey.Key = key.substring(0);
            this.AESKey.IV = iv.substring(0);
        },

        /**
         * @method decryptRsaData
         * @param {String} enc_data (BASE64 預設)
         * @return {String}
         */
        _decryptRsaData : function (
            enc_data
        )
        {
            var rsaKey = this.RSAKey;
            var decoded_str = CryptoJS.enc.Base64.parse(enc_data).toString();
            var resString = rsaKey.decrypt(decoded_str);
            return resString;
        },

        /**
         * @method sendRequest
         * @param {String} url
         * @param {String} headers
         * @param {String} params
         * @param {function} callback
         */
        _sendRequest : function (
            url,
            headers,
            params,
            callback)
        {
            var config = {withCredentials:true};
            config.headers = headers;
            var cmdBody = JSON.parse(params);
            this.axiosConfig.headers['Cookie']=self.SessionCookies;
            axios.post(url, cmdBody, config)
                .then(function (response) {
                    callback(response.status, JSON.stringify(response.data));
                });
        },

        /**
         * @method sendEncryptionRequest
         * @param {String} url
         * @param {String} headers
         * @param {String} params
         * @param {function} callback
         */
        _sendEncryptionRequest : function (
            url,
            headers,
            params,
            callback
        )
        {
            // AES 加密, 並轉 base64
            var key = CryptoJS.enc.Utf8.parse(this.AESKey.Key);
            var iv = CryptoJS.enc.Utf8.parse(this.AESKey.IV);
            var encrypted = CryptoJS.AES.encrypt(params, key, {iv: iv});
            var encString = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

            var newCmdBody = {"data": encString};
            var config = {withCredentials:true};
            // TODO:
            config.headers['Cookie']=self.SessionCookies;
            axios.post(url, newCmdBody, config)
                .then(function (response) {
                    var cookie = response.headers['set-cookie'];
                    if (cookie != undefined)
                    {
                        self.SessionCookies = cookie;
                        console.log("Set-Cookie:",cookie);
                    }

                    var result_data = response.data;
                    if (result_data && result_data.length > 2) {
                        // AES 解密
                        var decrypted = CryptoJS.AES.decrypt(result_data, key, {iv: iv});
                        var decString = CryptoJS.enc.Utf8.stringify(decrypted);
                        //var result = JSON.parse(decString);
                        callback(response.status, decString);
                    } else {
                        callback(response.status, response.data);
                    }
                })
                .catch(function (error) {
                    if (error.response) {
                        // The request was made, but the server responded with a status code
                        // that falls out of the range of 2xx
                        callback(error.response.status, error.response.data);
                    }
                });
        },

        _getPreloginEncryptKeyCmd: function () {
            if (this.RSAKey) delete this.RSAKey;

            var pubKeyBase64 = this._getRsaPublicKey();
            var body = {
                "command": "GetPreloginEncryptKey",
                "data": JSON.stringify({"Key": pubKeyBase64}),
                "product": "apk",
            };

            return body;
        },

        _getGuestLoginCmd: function () {
            var body = {
                "command": "GuestLogin",
                "data": JSON.stringify({"DeviceId": this.DeviceId}),
                "product": "apk",
            };

            return body;
        },

        _getFastLoginCmd: function () {
            var body = {
                "command": "FastLogin",
                "data": JSON.stringify({
                    "MemberId": this.loginInfo.MemberId,
                    "LoginToken": this.loginInfo.LoginToken,
                    "DeviceId": this.DeviceId,
                }),
                "product": "apk",
            };

            return body;
        },
    });
    exports.BravoLogin = BravoLogin;

}(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
    typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
