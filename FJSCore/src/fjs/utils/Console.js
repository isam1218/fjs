(function(){
    namespace("fjs.utils");
    fjs.utils.Console = function() {

    };
    fjs.utils.Console.log = function() {
        if(console) {
            console.log(arguments);
        }
    };
    fjs.utils.Console.error = function() {
        if(console) {
            console.error(arguments);
        }
    };
    fjs.utils.Console.debug = function() {
        if(console) {
            if(console.debug) {
                console.debug(arguments);
            }
            else {
                console.log(arguments);
            }
        }
    };
    fjs.utils.Console.warn = function() {
        if(console) {
            if(console.warn) {
                console.warn(arguments);
            }
            else {
                console.log(arguments);
            }
        }
    };
    fjs.utils.Console.info = function() {
        if(console) {
            if(console.info) {
                console.info(arguments);
            }
            else {
                console.log(arguments);
            }
        }
    };
})();