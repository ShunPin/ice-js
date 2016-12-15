/**
 * Created by benson on 2016/11/22.
 */
var express = require('express');
var router = express.Router();
var model = require('../server/modelSetting');
var mgrCommander = require('../server/MgrCommander');
mgrCommander.setWebsite('https://www.rd2.atcity.dev');

// 測試 Code , TODO:  Remove
// model.get(null,function (err,array) {
//     for (var i=0; i< array.length; i++){
//         var setting = array[i];
//         mgrCommander.set(setting.id,setting);
//     }
// });

/* GET setting listing. */
router.get('/', function (req, res, next) {    //res.send('respond with a resource');
    console.log(req.query);
    if (req.query.hasOwnProperty('_page'))
    {
        // 查詢
        model.get(null,
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
    // console.log(req.params);
    model.get(req.params.id,
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

// Add New Setting
router.post('/', function (req, res) {
    //console.log('Post:', req.url);
    //console.log('Modify',req.body);

    model.add(req.body,
        function (err, results) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
            else {
                //console.log(results);
                // 異動同步 Commander
                mgrCommander.set(results.id, results);
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        }
    );
});

// Update
router.put('/:id', function (req, res) {
    //console.log('Put:', req.url);
    //console.log('Put:', req.body);
    // console.log(req.params.id);
    model.set(req.params.id,req.body,
        function (err, results) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
            else {
                //console.log(results);
                // 異動同步 Commander
                mgrCommander.set(results.id, results);

                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        });
});

// Delete
router.delete('/:id', function (req, res) {
    //console.log('Delete:', req.url);
    //console.log(req.params.id);
    var id = req.params.id;
    model.del(id,
        function (err, results) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
            else {
                //console.log(results);
                mgrCommander.del(id);

                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        });
});
module.exports = router;
