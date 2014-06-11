(function(){
    namespace("fjs.utils");
    fjs.utils.Console = function() {

    };
    fjs.utils.Console.log = function() {
        if(console) {
            if(console.log.apply) {
                console.log.apply(console, arguments);
            }
            else {
                var log = Function.prototype.bind.call(console.log, console);
                log.apply(console, arguments);
            }
        }
    };
    fjs.utils.Console.error = function() {
        if(console) {
            if(console.error.apply) {
                console.error.apply(console, arguments);
            }
            else {
                var log = Function.prototype.bind.call(console.error, console);
                log.apply(console, arguments);
            }
        }
    };
    fjs.utils.Console.debug = function() {
        if(console) {
            if(console.debug) {
                if(console.debug.apply) {
                    console.debug.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.debug, console);
                    log.apply(console, arguments);
                }
            }
            else {
                fjs.utils.Console.log.apply(fjs.utils.Console, arguments);
            }
        }
    };
    fjs.utils.Console.warn = function() {
        if(console) {
            if(console.warn) {
                if(console.warn.apply) {
                    console.warn.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.warn, console);
                    log.apply(console, arguments);
                }
            }
            else {
                fjs.utils.Console.log.apply(fjs.utils.Console, arguments);
            }
        }
    };
    fjs.utils.Console.info = function() {
        if(console) {
            if(console.info) {
                if(console.info.apply) {
                    console.info.apply(console, arguments);
                }
                else {
                    var log = Function.prototype.bind.call(console.info, console);
                    log.apply(console, arguments);
                }
            }
            else {
                fjs.utils.Console.log.apply(fjs.utils.Console, arguments);
            }
        }
    };
})();