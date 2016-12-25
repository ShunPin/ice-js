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
        nga.field('interval', 'number').label('進入數度 ms'),
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
        nga.field('interval', 'number').label('進入數度 ms'),
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


myApp.controller('stressInfoCtrl', ['$scope', '$interval',
    function ($scope, $interval) {

        var checkUpdate = function () {
            axios.get('/stressLogin/infos')
                .then(function (response) {
                    //console.log(response);
                    // TODO test
                    var checkLater = false;

                    var infos = [];
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

                    //  TODO: 檢查是否停掉檢查
                    // if (timerID && checkLater == false) {
                    //
                    // }
                })
                .catch(function (error) {
                    console.log(error);
                });

        }

        //  立即檢查更新
        checkUpdate();
        // 兩秒後在更新
        timerID = $interval(checkUpdate, 2000);

    }]);