var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var log4js = require("log4js");
//We won't need this.
// var logger = require('morgan');
//var log = log4js.getLogger("stress");

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var helloIce = require('./routes/helloIce');
var stressLogin = require('./routes/StressLogin');
var settings = require('./routes/settings');

// Lune: 如果直接用 node command 執行，會發生 unable to verify the first certificate 的問題，所以先設為不檢查
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 設定 log4js
log4js.configure({
    appenders: [
        {
            category: "stress",
            type: "console"
        },
        {
            category: "stressFile",
            type: "file",
            filename: "logs/error.log",
            maxLogSize: 104857600,
            backups: 10,
        }
        // {
        //     category: "stress",
        //     type: "logLevelFilter",
        //     appender: {
        //         type: "log4js-elasticsearch",
        //         url: "http://log.rd2.atcity.dev:9200/"
        //     }
        // }
    ],
    "replaceConsole": true,
    "levels": {
        "stress": "INFO",
        "stressError": "WARN"
    }
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// replace this with the log4js connect-logger
// app.use(logger('dev'));
//app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.use('/', routes);
app.use('/users', users);
app.use('/ice', helloIce);
app.use('/stressLogin', stressLogin);
app.use('/settings', settings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if( app.get('env') === 'development' ) {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
