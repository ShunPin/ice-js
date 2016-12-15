var express = require('express');
var router = express.Router();
var model = require('../server/modelUser');

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
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        }
    );
});

// Update
router.put('/:id', function (req, res) {
    model.set(req.params.id,req.body,
        function (err, results) {
            if (err) {
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        });
});

// Delete
router.delete('/:id', function (req, res) {
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
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end();
            }
        });
});
module.exports = router;
