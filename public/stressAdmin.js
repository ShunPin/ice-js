/**
 * Created by benson on 2016/11/17.
 */

// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('StressApp', ['ng-admin']);
// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('Social Casino Stress Admin');
    // more configuration here later
    // ...
    // attach the admin application to the DOM and execute it

    //admin.baseApiUrl('http://jsonplaceholder.typicode.com/'); // main API endpoint
    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id
    var setting = nga.entity('settings');
    //setting.url('/settings/set');
    // setting.url(function(entityName, viewType, identifierValue, identifierName) {
    //     var e = encodeURIComponent;
    //     return '/settings/set' + e(entityName) + '_' + e(viewType) + '?' + e(identifierName) + '=' + e(identifierValue); // Can be absolute or relative
    // });
    setting.creationView().fields([
        nga.field('targetCount', 'number').label('工具數量'),
        nga.field('interval', 'number').label('進入速度 ms'),
        nga.field('stayTime', 'number').label('登入後等待時間 sec'),
        nga.field('method', 'choice').label('登入方式').choices([
            {label: '快速登入', value: 'FastLogin'},
            {label: '訪客', value: 'GuestLogin'}
        ]),
        nga.field('ice', 'boolean').label('是否登入ice').choices([
            {value: true, label: 'true'},
            {value: false, label: 'false'}
        ]),
        // nga.field('logout', 'boolean').label('是否登出').choices([
        //     {value: true, label: 'true'},
        //     {value: false, label: 'false'}
        // ]),
    ]);

    setting.editionView().fields([
        nga.field('running', 'boolean').label('運行中').choices([
            {label: 'Run', value: true},
            {label: 'Stop', value: false}
        ]),
        nga.field('targetCount', 'number').label('工具數量'),
        nga.field('interval', 'number').label('進入速度 ms'),
        nga.field('stayTime', 'number').label('登入後等待時間 sec'),
        nga.field('method', 'choice').label('登入方式').choices([
            {label: '快速登入', value: 'FastLogin'},
            {label: '訪客', value: 'GuestLogin'}
        ]),
        nga.field('ice', 'boolean').label('是否登入ice').choices([
            {value: true, label: 'true'},
            {value: false, label: 'false'}
        ]),
        // nga.field('logout', 'boolean').label('是否登出').choices([
        //     {value: true, label: 'true'},
        //     {value: false, label: 'false'}
        // ]),
    ]);

    var listFields = setting.editionView().fields();
    setting.listView().fields(listFields);
    setting.listView().listActions(['edit', 'delete']);

    // add the entity to the admin application
    admin.addEntity(setting);

    var user = nga.entity('users');
    //user.url('http://jsonplaceholder.typicode.com/users');
    // set the fields of the user entity list view
    user.listView().fields([
        nga.field('MemberId'),
        nga.field('DeviceId'),
        nga.field('LoginToken')
    ]);
    user.creationView().fields([
        nga.field('MemberId'),
        nga.field('DeviceId'),
        nga.field('LoginToken')
    ]);
    user.listView().listActions(['edit', 'delete']);

    // use the same fields for the editionView as for the creationView
    user.editionView().fields(user.creationView().fields());

    // add the user entity to the admin application
    admin.addEntity(user);
    // attach the admin application to the DOM and execute it

    nga.configure(admin);
}]);


myApp.controller('stressChartCtrl', ['$scope', '$interval',
    function ($scope, $interval) {
        "use strict";

        function requestData() {
            axios.get('/stressLogin/infos')
                .then(function (response) {
                    // 設定的 pointer data 為 { date time , current Count}
                    var dateNow = new Date().getTime();

                    // 記錄 Chart Map(Name,Data)
                    var chartMap1 = {};
                    for (var i = 0; i < chart1.series.length; i++) {
                        var name = chart1.series[i].name;
                        var series = chart1.series[i];
                        // add to map
                        chartMap1[name] = series;
                    }

                    var chartMap2 = {};
                    for (var i = 0; i < chart2.series.length; i++) {
                        var name = chart2.series[i].name;
                        var series = chart2.series[i];
                        // add to map
                        chartMap2[name] = series;
                    }

                    // 記錄 response Map(Name,Data)
                    for (var i = 0; i < response.data.length; i++) {
                        var pointName = response.data[i].id;
                        var loginPerSceondName = pointName + '-loginPerSecond';
                        var disconnectName = pointName + '-disconnect';
                        var failName = pointName + '-fail';

                        // 新增 線 (addSeries)
                        if (chartMap1.hasOwnProperty(pointName) == false) {
                            chartMap1[pointName] = chart1.addSeries({name: pointName, data: []}, false);
                            chartMap1[loginPerSceondName] = chart1.addSeries({name: loginPerSceondName, data: []}, false);
                            chartMap2[disconnectName] = chart2.addSeries({name: disconnectName, data: []}, false);
                            chartMap2[failName] = chart2.addSeries({name: failName, data: []}, false);
                        }

                        // 新增 顯示的資料
                        var point1 = {
                            name: pointName,
                            data: [dateNow, response.data[i].loginCount]
                        };

                        var loginPerSecPoint = {
                            name: loginPerSceondName,
                            data: [dateNow, response.data[i].loginPerSecond]
                        };

                        var disconnectPoint = {
                            name: disconnectName,
                            data: [dateNow, response.data[i].disconnectCount]
                        };

                        var failPoint = {
                            name: failName,
                            data: [dateNow, response.data[i].failCount]
                        };

                        // shift if the series is
                        // max 24Hr
                        var shift = chartMap1[pointName].data.length > (24*3600/10);

                        // add the point
                        chartMap1[pointName].addPoint(point1.data, false, shift);
                        chartMap1[loginPerSceondName].addPoint(loginPerSecPoint.data, false, shift);
                        chartMap2[disconnectName].addPoint(disconnectPoint.data, false, shift);
                        chartMap2[failName].addPoint(failPoint.data, false, shift);
                    }

                    chart1.redraw();
                    chart2.redraw();
                })
                .catch(function (error) {
                    console.error(error);
                });
        }

        // 每10 秒更新
        $interval(requestData, 10000);

        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        var chart1 = $scope.chart1 = Highcharts.chart('myChart1', {
            chart: {
                defaultSeriesType: 'spline',
                zoomType: 'x',
                events: {
                    load: requestData
                }
            },
            title: {
                text: '壓測線圖-登入數'
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 60 * 1000,  // 1min
                //maxZoom: 20 * 1000
            },
            yAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                title: {
                    text: 'Value',
                    margin: 80
                }
            },
            series: [{}]
        });

        var chart2 = $scope.chart1 = Highcharts.chart('myChart2', {
            chart: {
                defaultSeriesType: 'spline',
                zoomType: 'x',
                events: {
                    load: requestData
                }
            },
            title: {
                text: '壓測線圖-失敗'
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 60 * 1000,  // 1min
                //maxZoom: 20 * 1000
            },
            yAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                title: {
                    text: 'Value',
                    margin: 80
                }
            },
            series: [{}]
        });

        $scope.shutdown = function () {
            axios.get('/stressLogin/shutdown')
                .then(function (response) {
                    if (response.status == 200) {
                        alert('關機設定成功');
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    }]);

myApp.controller('stressInfoCtrl', ['$scope', '$interval',
    function ($scope, $interval) {

        var timeID;
        $scope.running = false;

        $scope.checkUpdate = function () {
            axios.get('/stressLogin/infos')
                .then(function (response) {
                    var infos = [];
                    var checkLater = false;
                    for (var i = 0; i < response.data.length; i++) {
                        var obj = response.data[i];
                        if (obj.running) {
                            checkLater = true;
                            obj.type = "success"
                        }
                        else {
                            obj.type = "active";
                        }
                        infos.push(obj);
                    }
                    $scope.infos = infos;
                    $scope.running = checkLater;
                })
                .catch(function (error) {
                    console.error(error);
                });
        };

        $scope.startUpdate = function () {
            "use strict";
            timeID = $interval($scope.checkUpdate, 2000);
        };

        $scope.stopUpdate = function () {
            "use strict";
            $interval.cancel(timeID);
            timeID = undefined;
        };

        //  立即檢查更新
        $scope.checkUpdate();
        // 兩秒後在更新
        $scope.startUpdate();

        // 啟動所有設定
        $scope.startAll = function () {
            "use strict";
            console.log("StartAll clicked");

            axios.get('/stressLogin/startAll')
                .then(function (response) {
                    if (response.status == 200) {
                        console.log('設定成功');
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        };

        // 停止所有設定
        $scope.stopAll = function () {
            "use strict";
            console.log("StopAll clicked");

            axios.get('/stressLogin/stopAll')
                .then(function (response) {
                    if (response.status == 200) {
                        console.log('設定成功');
                    }
                })
                .catch(function (error) {
                    console.error(error);
                });
        };

    }]);