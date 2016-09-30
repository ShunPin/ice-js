
var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('helloIce', { title: 'Express' });  
  res.sendFile(path.resolve(__dirname, '../views/helloIce.html'));  
});

module.exports = router;
