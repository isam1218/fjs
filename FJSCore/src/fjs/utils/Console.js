(function(){
    namespace("fjs.utils");
    fjs.utils.Console = function() {

    };
    fjs.utils.Console.log = function() {
        if(console) {
            console.log.apply(console, arguments);
        }
    };
    fjs.utils.Console.error = function() {
        if(console) {
            console.error.apply(console, arguments);
        }
    };
    fjs.utils.Console.debug = function() {
        if(console) {
            if(console.debug) {
                console.debug.apply(console, arguments);
            }
            else {
                console.log.apply(console, arguments);
            }
        }
    };
    fjs.utils.Console.warn = function() {
        if(console) {
            if(console.warn) {
                console.warn.apply(console, arguments);
            }
            else {
                console.log.apply(console, arguments);
            }
        }
    };
    fjs.utils.Console.info = function() {
        if(console) {
            if(console.info) {
                console.info.apply(console, arguments);
            }
            else {
                console.log.apply(console, arguments);
            }
        }
    };
})();