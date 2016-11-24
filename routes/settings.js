/**
 * Created by benson on 2016/11/22.
 */
var express = require('express');
var router = express.Router();
var model = require('../server/stressModel');

/* GET users listing. */
router.get('/', function (req, res, next) {    //res.send('respond with a resource');
    console.log(req.query);

    if (req.query.hasOwnProperty('_page'))
    {
        model.getSettings(null,
            function (err, results) {
                if (err) {
                    res.render('error', {
                        message: err.message,
                        error: {}
                    });
                }
                else {
                    //console.log(results);
                    res.setHeader('Content-Type', 'application/json');
                    res.json(results);
                }
            });
    }
    // 預設 Setting
    else {
        model.getDefaultSettings(
            function (err, results) {
                if (err) {
                    res.render('error', {
                        message: err.message,
                        error: {}
                    });
                }
                else {
                    //console.log(results);
                    res.setHeader('Content-Type', 'application/json');
                    res.json(results);
                }
            });
    }


});

// 單一筆資料查詢
router.get('/:id', function (req, res, next) {    //res.send('respond with a resource');
    // console.log(req.query);
    // console.log(req.params);
    model.getSettings(req.params.id,
        function (err, results) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
            else {
                //console.log(results);
                res.setHeader('Content-Type', 'application/json');
                res.json(results);
            }
        });
});

// Add
router.post('/', function (req, res) {
    console.log('Post:', req.url);
    console.log('Modify',req.params);
    //model.setSettings();
    // TODO:  改成存檔
    var setting = [
        {
            'id': 1,
            'targetCount': 100,
            'interval': 100,
            'method': 'GuestLogin',
            'ice': true,
            'running': true,
        },
        {
            'id': 2,
            'targetCount': 100,
            'interval': 100,
            'method': 'RegisterLogin',
            'ice': true,
            'running': true,
        },
        {
            'id': 3,
            'targetCount': 200,
            'interval': 200,
            'method': 'RegisterLogin',
            'ice': true,
            'running': false,
        }
    ];
    res.send(setting);
});

// Update
router.put('/', function (req, res) {
    console.log('Put:', req.url);
    // TODO:  改成存檔
    var setting = [
        {
            'id': 1,
            'targetCount': 100,
            'interval': 100,
            'method': 'GuestLogin',
            'ice': true,
            'running': true,
        },
        {
            'id': 2,
            'targetCount': 100,
            'interval': 100,
            'method': 'RegisterLogin',
            'ice': true,
            'running': true,
        },
    ];
    res.send(setting);
});

// Delete
router.delete('/', function (req, res) {
    console.log('Delete:', req.url);
    // TODO:  改成存檔
    res.send({});
});
module.exports = router;
