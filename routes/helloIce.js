
var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('helloIce', { title: 'Express' });  
  res.sendFile(path.resolve(__dirname, '../views/helloIce.html'));  
});

router.get('/bravoLogin', function(req, res, next) {
  // 登入 Brave Web Site
  var websiteURL = 'https://www.rd2.atcity.dev';
  var DeviceId = "Benson's Nodejs";

  var BravoLogin = require('../public/bravoLogin').BravoLogin;
  var bravoLogin = new BravoLogin(DeviceId);
  bravoLogin.setWebsite(websiteURL);
  bravoLogin.createSession(true).then(
      function () {
        localStorage.setItem("loginInfo", JSON.stringify(bravoLogin.loginInfo));
        // 登入成功
        console.log("登入成功");
      },
      function (msg) {
        console.log(msg);
        // 登入失敗
      }
  );

  console.log(BravoLogin);
  res.send("login to"+websiteURL);
});

module.exports = router;
