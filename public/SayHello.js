(function () {
    console.log("SayHello.js load");
})();



function sayHello() {
    //var Ice = require("ice").Ice;
    //var Demo = require("Hello").Demo;
    var communicator = Ice.initialize();
    var proxy = communicator.stringToProxy("hello:ws -h 127.0.0.1 -p 10002");
    var hello = Demo.HelloPrx.uncheckedCast(proxy);
    hello.sayHello(1).then(
        function () { console.log("sayHello done!"); }
    ).exception(
        function (ex) {
            console.log("something went wrong!");
        }
    ).finally(
        function () { return communicator.destroy(); }
    );
}
